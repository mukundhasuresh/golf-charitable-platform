import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types';

/**
 * Admin analytics overview page
 */
export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();

  // Fetch analytics data
  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: charityTotals },
    { data: prizeData },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active'),
    supabase
      .from('profiles')
      .select('charity_id, charity_percentage')
      .not('charity_id', 'is', 'null'),
    supabase
      .from('winners')
      .select('prize_amount'),
  ]);

  const totalPrizePool = (prizeData || []).reduce((sum: number, w: Database['public']['Tables']['winners']['Row']) => sum + w.prize_amount, 0);

  // Calculate charity donations (quick simulation)
  const charityDistribution: Record<string, number> = {};
  (charityTotals || []).forEach((user: Database['public']['Tables']['profiles']['Row']) => {
    if (user.charity_id) {
      const donation = user.charity_percentage || 10;
      charityDistribution[user.charity_id] = (charityDistribution[user.charity_id] || 0) + donation;
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-gray-600 mt-2">Overview of platform activity and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers || 0}</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Active Subscribers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeSubscribers || 0}</p>
              {totalUsers && (
                <p className="text-xs text-gray-500 mt-1">
                  {((activeSubscribers || 0) / (totalUsers || 1) * 100).toFixed(1)}% of users
                </p>
              )}
            </div>
            <span className="text-3xl">💳</span>
          </div>
        </div>

        {/* Total Prize Pool */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Total Prize Pool</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                £{(totalPrizePool / 100).toFixed(2)}
              </p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>

        {/* Charities Supported */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm uppercase tracking-wide">Charities Supported</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {Object.keys(charityDistribution).length}
              </p>
            </div>
            <span className="text-3xl">❤️</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Manage Users</p>
            <p className="text-sm text-gray-600 mt-1">View and edit user accounts</p>
          </a>
          <a
            href="/admin/draws"
            className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Create Draw</p>
            <p className="text-sm text-gray-600 mt-1">Generate and publish a new draw</p>
          </a>
          <a
            href="/admin/winners"
            className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Review Winners</p>
            <p className="text-sm text-gray-600 mt-1">Verify and approve winners</p>
          </a>
        </div>
      </div>
    </div>
  );
}
