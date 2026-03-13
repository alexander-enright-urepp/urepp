import ProfileSearch from '@/components/ProfileSearch'
import Link from 'next/link'

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-blue-600">UREPP</Link>
            <div className="flex gap-4 items-center">
              <Link
                href="/search"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Search
              </Link>
              <Link
                href="/profile/create"
                className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Athletes</h1>
          <p className="text-gray-600">
            Find baseball players by name, position, graduation year, or location.
          </p>
        </div>

        <ProfileSearch />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>UREPP - Built for baseball players chasing their college dreams</p>
        </div>
      </footer>
    </div>
  )
}
