import { getSupabaseServerClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import type { Subscription } from '@/types';

/**
 * Create a Stripe checkout session and save subscription intent to database
 */
export async function createCheckoutSession(
  userId: string,
  plan: 'monthly' | 'yearly'
): Promise<{ sessionId: string | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServerClient();

    // Get user email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !user?.email) {
      return { sessionId: null, error: 'User not found' };
    }

    // Determine price ID based on plan
    const priceId = plan === 'monthly'
      ? process.env.STRIPE_PRICE_MONTHLY_ID
      : process.env.STRIPE_PRICE_YEARLY_ID;

    if (!priceId) {
      return { sessionId: null, error: 'Price configuration missing' };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: userId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/subscription?success=true`,
      cancel_url: `${appUrl}/dashboard/subscription?cancelled=true`,
    });

    return { sessionId: session.id, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return { sessionId: null, error: message };
  }
}

/**
 * Get user's subscription
 */
export async function getUserSubscription(
  userId: string
): Promise<{ subscription: Subscription | null; error: string | null }> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { subscription: null, error: error.message };
    }

    return { subscription: (subscription as Subscription) || null, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscription';
    return { subscription: null, error: message };
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await getSupabaseServerClient();

    // Get Stripe subscription ID
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !subscription?.stripe_subscription_id) {
      return { error: 'Subscription not found' };
    }

    // Cancel with Stripe
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);

    // Update status in DB
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscriptionId);

    if (updateError) {
      return { error: updateError.message };
    }

    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
    return { error: message };
  }
}

/**
 * Check if user is subscribed
 */
export async function isSubscribed(userId: string): Promise<boolean> {
  try {
    const { subscription, error } = await getUserSubscription(userId);

    if (error || !subscription) {
      return false;
    }

    return subscription.status === 'active';
  } catch {
    return false;
  }
}
