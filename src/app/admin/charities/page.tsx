'use client';

import { useState, useEffect, FormEvent } from 'react';
import type { Charity } from '@/types';

/**
 * Admin charities management page
 */
export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCharities();
  }, []);

  async function fetchCharities() {
    try {
      const response = await fetch('/api/admin/charities');
      const data = await response.json();
      if (data.charities) {
        setCharities(data.charities);
      }
    } catch (err) {
      console.error('Failed to fetch charities:', err);
    }
  }

  async function handleAddCharity(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/charities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          image_url: imageUrl,
          is_featured: isFeatured,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add charity');
        return;
      }

      setSuccess('Charity added successfully!');
      await fetchCharities();
      setName('');
      setDescription('');
      setImageUrl('');
      setIsFeatured(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleFeatured(charityId: string) {
    try {
      const response = await fetch(`/api/admin/charities/${charityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_featured: !charities.find(c => c.id === charityId)?.is_featured,
        }),
      });

      if (response.ok) {
        await fetchCharities();
      }
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    }
  }

  async function handleDeleteCharity(charityId: string) {
    if (!confirm('Are you sure you want to delete this charity?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/charities/${charityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Charity deleted successfully!');
        await fetchCharities();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete charity');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Charities Management</h1>
        <p className="text-gray-600 mt-2">Add and manage charitable organizations</p>
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

      {/* Add Charity Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Charity</h2>

        <form onSubmit={handleAddCharity} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Charity Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              id="isFeatured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
              Feature on homepage
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {isLoading ? 'Adding...' : 'Add Charity'}
          </button>
        </form>
      </div>

      {/* Charities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {charities.map((charity) => (
          <div key={charity.id} className="bg-white rounded-lg shadow p-4">
            {charity.image_url && (
              <img
                src={charity.image_url}
                alt={charity.name}
                className="w-full h-32 object-cover rounded mb-3"
              />
            )}
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-gray-900">{charity.name}</h3>
                {charity.is_featured && <span className="text-xs text-yellow-600">⭐ Featured</span>}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{charity.description}</p>
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => handleToggleFeatured(charity.id)}
                  className={`flex-1 px-3 py-1 text-xs font-medium rounded transition-colors ${
                    charity.is_featured
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {charity.is_featured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  onClick={() => handleDeleteCharity(charity.id)}
                  className="flex-1 px-3 py-1 text-xs font-medium text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
