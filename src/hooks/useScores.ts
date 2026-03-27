'use client';

import { useEffect, useState } from 'react';
import type { Score } from '@/types';

/**
 * Hook to fetch and manage user scores
 */
export function useScores(userId: string) {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;

    fetchScores();
  }, [userId]);

  async function fetchScores() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/scores');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch scores');
      }

      setScores(data.scores || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return { scores, isLoading, error, refetch: fetchScores };
}

/**
 * Hook to add a score
 */
export function useAddScore() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function addScore(score: number, date: string) {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, date }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add score');
      }

      return { score: data.score, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { score: null, error: message };
    } finally {
      setIsLoading(false);
    }
  }

  return { addScore, isLoading, error };
}

/**
 * Hook to delete a score
 */
export function useDeleteScore() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function deleteScore(scoreId: string) {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/scores', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoreId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete score');
      }

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { error: message };
    } finally {
      setIsLoading(false);
    }
  }

  return { deleteScore, isLoading, error };
}
