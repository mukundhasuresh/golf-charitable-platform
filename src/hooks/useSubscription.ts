'use client';

import { useEffect, useState } from 'react';
import type { Subscription } from '@/types';

/**
 * Hook to fetch and manage user subscription
 */
export function useSubscription(userId: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;

    fetchSubscription();
  }, [userId]);

  async function fetchSubscription() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscription');
      }

      setSubscription(data.subscription || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return { subscription, isLoading, error, refetch: fetchSubscription };
}

/**
 * Hook to check if user is subscribed
 */
export function useIsSubscribed(userId: string) {
  const { subscription, isLoading } = useSubscription(userId);

  return {
    isSubscribed: subscription?.status === 'active',
    isLoading,
  };
}
