import Link from 'next/link';

/**
 * Home landing page
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Golf Charity</h1>
          <div className="space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Play Golf.<br />Win Prizes.<br />Change Lives.
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Record your golf scores, enter our monthly draw, and share your winnings with charities you care about.
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
        >
          Start Playing Today
        </Link>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full font-bold text-2xl mb-4">
                1
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Record Your Scores</h4>
              <p className="text-gray-600">
                Enter your Stableford points from each round. Keep your last 5 scores on file.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full font-bold text-2xl mb-4">
                2
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Enter the Draw</h4>
              <p className="text-gray-600">
                Your scores automatically enter our monthly draw. Match 3, 4, or all 5 winning numbers to win.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full font-bold text-2xl mb-4">
                3
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Support Charity</h4>
              <p className="text-gray-600">
                Share your winnings with the charity of your choice. Choose how much (10-100%) to donate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Prize Pool */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-12">Prize Pool Breakdown</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur">
              <p className="text-4xl font-bold mb-2">40%</p>
              <p className="text-lg">Match All 5 Numbers</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur">
              <p className="text-4xl font-bold mb-2">35%</p>
              <p className="text-lg">Match 4 Numbers</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur">
              <p className="text-4xl font-bold mb-2">25%</p>
              <p className="text-lg">Match 3 Numbers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Charities */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Featured Charities</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600"></div>
                <div className="p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Charity Organization {i}</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Making a difference in communities across the UK through innovative programs and local partnerships.
                  </p>
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Learn More →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Playing?</h3>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of golfers supporting their favorite charities.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
          >
            Subscribe Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2026 Golf Charity Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
