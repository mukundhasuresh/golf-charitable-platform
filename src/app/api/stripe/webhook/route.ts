import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Handle Stripe webhook events:
 * - checkout.session.completed: Create subscription
 * - customer.subscription.updated: Update subscription status
 * - customer.subscription.deleted: Mark subscription as inactive
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook signature verification failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const stripeCustomerId = session.customer;

        if (!userId || !stripeCustomerId) {
          return NextResponse.json(
            { error: 'Missing userId or customerId' },
            { status: 400 }
          );
        }

        // Get subscription from Stripe
        const subscription = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          limit: 1,
        });

        if (!subscription.data[0]) {
          return NextResponse.json(
            { error: 'Subscription not found' },
            { status: 400 }
          );
        }

        const stripeSubscription = subscription.data[0];
        const plan = stripeSubscription.items.data[0]?.price.recurring?.interval === 'year'
          ? 'yearly'
          : 'monthly';

        // Save subscription to database
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert([
            {
              user_id: userId,
              plan,
              status: 'active',
              stripe_subscription_id: stripeSubscription.id,
              stripe_customer_id: stripeCustomerId,
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            },
          ]);

        if (insertError) {
          console.error('Error saving subscription:', insertError);
        }

        // Update user profile status
        await supabase
          .from('profiles')
          .update({ subscription_status: 'active' })
          .eq('id', userId);

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        // Mark subscription as cancelled
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (sub) {
          await supabase
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('stripe_subscription_id', subscription.id);

          await supabase
            .from('profiles')
            .update({ subscription_status: 'cancelled' })
            .eq('id', sub.user_id);
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    console.error('Webhook error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
