import { getCurrentUser } from '@/services/auth.service';
import { getLatestDraw, getUserDrawHistory, checkWinner } from '@/services/draw.service';
import { getScores } from '@/services/score.service';
import { redirect } from 'next/navigation';

/**
 * Draws page - view latest draw and history
 */
export default async function DrawsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const [{ draw: latestDraw }, { draws: drawHistory }, { scores }] = await Promise.all([
    getLatestDraw(),
    getUserDrawHistory(),
    getScores(user.id),
  ]);

  let userMatches = 0;
  if (latestDraw && scores && scores.length > 0) {
    const userNumbers = scores.slice(0, 5).map(s => s.score);
    userMatches = userNumbers.filter(num => latestDraw.numbers.includes(num)).length;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Draws</h1>
        <p className="text-gray-600 mt-2">View draw results and your match history</p>
      </div>

      {/* Latest Draw */}
      {latestDraw ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Draw</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">Draw Numbers</p>
              <div className="flex gap-3 mb-6">
                {latestDraw.numbers.map((num, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg"
                  >
                    {num}
                  </div>
                ))}
              </div>

              <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">Draw Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(latestDraw.year, latestDraw.month - 1, 15).toLocaleDateString()}
              </p>
            </div>

            <div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">Your Matches</p>
                <div className="text-5xl font-bold text-blue-600 mb-4">{userMatches}</div>

                {userMatches >= 3 && (
                  <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg mb-4">
                    🎉 You&apos;re a winner! Prize calculation in progress.
                  </div>
                )}

                {userMatches < 3 && (
                  <p className="text-gray-600">
                    You need to match at least 3 numbers to win a prize. Keep playing!
                  </p>
                )}

                <div className="mt-6 p-4 bg-white rounded-lg">
                  <p className="text-gray-600 text-xs uppercase tracking-wide mb-2">Prize Pool Breakdown</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">5 matches: 40%</span>
                      <span className="font-semibold">£{(latestDraw.jackpot_amount / 100 * 0.4).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">4 matches: 35%</span>
                      <span className="font-semibold">£{(latestDraw.jackpot_amount / 100 * 0.35).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">3 matches: 25%</span>
                      <span className="font-semibold">£{(latestDraw.jackpot_amount / 100 * 0.25).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
          No draws published yet. Check back soon!
        </div>
      )}

      {/* Draw History */}
      {drawHistory && drawHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Draw History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Numbers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Jackpot
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {drawHistory.map((draw) => (
                  <tr key={draw.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(draw.year, draw.month - 1, 15).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {draw.numbers.map((num, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-800 rounded-full text-xs font-bold"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      £{(draw.jackpot_amount / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
