'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Score } from '@/types';

/**
 * Scores management page - add, view, and delete golf scores
 */
export default function ScoresPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [scores, setScores] = useState<Score[]>([]);
  const [score, setScore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch scores on mount
  useEffect(() => {
    fetchScores();
  }, []);

  async function fetchScores() {
    try {
      const response = await fetch('/api/scores', { method: 'GET' });
      const data = await response.json();
      if (data.scores) {
        setScores(data.scores);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch scores';
      setError(message);
    }
  }

  async function handleAddScore(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: parseInt(score),
          date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add score');
        return;
      }

      setScore('');
      setDate(new Date().toISOString().split('T')[0]);
      await fetchScores();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteScore(scoreId: string) {
    setIsDeleting(scoreId);
    try {
      const response = await fetch('/api/scores', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoreId }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to delete score');
        return;
      }

      await fetchScores();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsDeleting(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Golf Scores</h1>
        <p className="text-gray-600 mt-2">Record and manage your Stableford points</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Score Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Score</h2>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAddScore} className="space-y-4">
              <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
                  Stableford Points (1-45)
                </label>
                <input
                  id="score"
                  type="number"
                  min="1"
                  max="45"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="30"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {scores.length >= 5 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm">
                  ⚠️ This will replace your oldest score
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isLoading ? 'Adding...' : 'Add Score'}
              </button>
            </form>
          </div>
        </div>

        {/* Scores List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Your Scores</h2>
              <p className="text-gray-600 text-sm mt-1">Last 5 scores (newest first)</p>
            </div>

            <div className="divide-y divide-gray-200">
              {scores.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No scores yet. Add your first score above.
                </div>
              ) : (
                scores.map((s) => (
                  <div
                    key={s.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-lg font-bold text-gray-900">{s.score} points</p>
                      <p className="text-sm text-gray-600">
                        {new Date(s.date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteScore(s.id)}
                      disabled={isDeleting === s.id}
                      className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      {isDeleting === s.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
