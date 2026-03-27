import { getCurrentUser } from '@/services/auth.service';
import { getScores } from '@/services/score.service';
import { getUserCharity } from '@/services/charity.service';
import { getLatestDraw } from '@/services/draw.service';
import { getUserSubscription } from '@/services/subscription.service';
import { redirect } from 'next/navigation';

/**
 * Main dashboard showing key metrics and recent activity
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all dashboard data in parallel
  const [{ scores }, { charity }, { draw }, { subscription }] = await Promise.all([
    getScores(user.id),
    getUserCharity(user.id),
    getLatestDraw(),
    getUserSubscription(user.id),
  ]);

  const lastScore = scores?.[0];
  const nextDrawDate = draw ? new Date(draw.year, draw.month - 1, 15) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.full_name}</h1>
        <p className="text-gray-600 mt-2">Manage your golf scores, charities, and prizes</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Subscription Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Subscription Status</p>
              <p className="text-2xl font-bold text-gray-900 mt-2 capitalize">
                {subscription?.status || 'Inactive'}
              </p>
            </div>
            <span className="text-3xl">💳</span>
          </div>
        </div>

        {/* Last Score */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Last Score</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {lastScore?.score || '-'}
              </p>
              {lastScore && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(lastScore.date).toLocaleDateString()}
                </p>
              )}
            </div>
            <span className="text-3xl">⛳</span>
          </div>
        </div>

        {/* Selected Charity */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Your Charity</p>
              <p className="text-lg font-bold text-gray-900 mt-2">
                {charity?.name || 'Not Selected'}
              </p>
              {charity && (
                <p className="text-xs text-gray-500 mt-1">
                  {user.charity_percentage}% donation
                </p>
              )}
            </div>
            <span className="text-3xl">❤️</span>
          </div>
        </div>

        {/* Next Draw */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Next Draw</p>
              <p className="text-lg font-bold text-gray-900 mt-2">
                {nextDrawDate ? nextDrawDate.toLocaleDateString() : 'TBD'}
              </p>
              {draw && (
                <p className="text-xs text-gray-500 mt-1">
                  Jackpot: £{(draw.jackpot_amount / 100).toFixed(2)}
                </p>
              )}
            </div>
            <span className="text-3xl">🎰</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/scores"
            className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Add Score</p>
            <p className="text-sm text-gray-600 mt-1">Record your latest round</p>
          </a>
          <a
            href="/dashboard/charity"
            className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Select Charity</p>
            <p className="text-sm text-gray-600 mt-1">Choose who to support</p>
          </a>
          <a
            href="/dashboard/subscription"
            className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Manage Subscription</p>
            <p className="text-sm text-gray-600 mt-1">Update your plan</p>
          </a>
        </div>
      </div>
    </div>
  );
}
