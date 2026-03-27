'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

/**
 * Subscription management page - view plan and manage billing
 */
export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check for success/cancelled params
  useEffect(() => {
    if (searchParams.get('success')) {
      setSuccess('Subscription activated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchSubscription();
    }
    if (searchParams.get('cancelled')) {
      setError('Subscription cancelled');
      setTimeout(() => setError(''), 3000);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchSubscription();
  }, []);

  async function fetchSubscription() {
    try {
      const response = await fetch('/api/subscription');
      const data = await response.json();
      if (data.subscription) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch subscription';
      setError(message);
    }
  }

  async function handleSubscribe(plan: 'monthly' | 'yearly') {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok || !data.sessionId) {
        setError(data.error || 'Failed to create checkout session');
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancel() {
    if (!subscription) return;

    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to cancel subscription');
        return;
      }

      setSuccess('Subscription cancelled successfully');
      await fetchSubscription();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your account plan and billing</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {subscription && subscription.status === 'active' ? (
        /* Current Subscription Info */
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Current Plan</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Plan</p>
              <p className="text-2xl font-bold text-gray-900 capitalize mt-1">
                {subscription.plan}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Status</p>
              <p className="text-lg font-semibold text-green-600 capitalize mt-1">
                {subscription.status}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Renewal Date</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="mt-6 px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
        </div>
      ) : (
        /* Subscription Plans */
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Choose Your Plan</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Plan */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Monthly</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                £9<span className="text-lg text-gray-600">/month</span>
              </p>
              <p className="text-gray-600 text-sm mt-2">Flexible monthly billing</p>

              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={isLoading}
                className="w-full mt-6 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isLoading ? 'Processing...' : 'Subscribe Monthly'}
              </button>
            </div>

            {/* Yearly Plan */}
            <div className="bg-white rounded-lg shadow p-6 border-2 border-blue-600 relative">
              <div className="absolute -top-3 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Save 20%
              </div>
              <h3 className="text-lg font-bold text-gray-900">Yearly</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                £86<span className="text-lg text-gray-600">/year</span>
              </p>
              <p className="text-gray-600 text-sm mt-2">Best value - save 2 months</p>

              <button
                onClick={() => handleSubscribe('yearly')}
                disabled={isLoading}
                className="w-full mt-6 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isLoading ? 'Processing...' : 'Subscribe Yearly'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
