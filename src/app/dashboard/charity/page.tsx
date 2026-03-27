'use client';

import { useState, useEffect, FormEvent } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Charity, User } from '@/types';

/**
 * Charity selection page - choose charity and set donation percentage
 */
export default function CharityPage() {
  const supabase = getSupabaseBrowserClient();

  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);
  const [percentage, setPercentage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch charities and user data on mount
  useEffect(() => {
    fetchCharities();
    fetchUserCharity();
  }, []);

  async function fetchCharities() {
    try {
      const response = await fetch('/api/charities');
      const data = await response.json();
      if (data.charities) {
        setCharities(data.charities);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch charities';
      setError(message);
    }
  }

  async function fetchUserCharity() {
    try {
      const response = await fetch('/api/charities/user');
      const data = await response.json();
      if (data.charity) {
        setSelectedCharityId(data.charity.id);
      }
      if (data.percentage) {
        setPercentage(data.percentage);
      }
    } catch (err) {
      // Silently fail if no charity selected yet
    }
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!selectedCharityId) {
      setError('Please select a charity');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/charities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charityId: selectedCharityId,
          percentage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save charity');
        return;
      }

      setSuccess('Charity updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
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
        <h1 className="text-3xl font-bold text-gray-900">Select Your Charity</h1>
        <p className="text-gray-600 mt-2">Choose where to direct your winnings</p>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Charities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {charities.map((charity) => (
            <div
              key={charity.id}
              onClick={() => setSelectedCharityId(charity.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedCharityId === charity.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              {charity.image_url && (
                <img
                  src={charity.image_url}
                  alt={charity.name}
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{charity.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{charity.description}</p>
                </div>
                {charity.is_featured && (
                  <span className="text-lg ml-2">⭐</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Donation Percentage */}
        {selectedCharityId && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Donation Percentage</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-2">
                  Share {percentage}% of your winnings with this charity
                </label>
                <input
                  id="percentage"
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={percentage}
                  onChange={(e) => setPercentage(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>10%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                You will keep {100 - percentage}% of your winnings
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          disabled={isLoading || !selectedCharityId}
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Selection'}
        </button>
      </form>
    </div>
  );
}
