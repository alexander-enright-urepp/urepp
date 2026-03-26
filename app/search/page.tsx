import ProfileSearch from '@/components/ProfileSearch'
import Link from 'next/link'

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-babyblue-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-babyblue-600">UREPP</Link>
            <div className="flex gap-4 items-center">
              <Link
                href="/search"
                className="text-gray-600 hover:text-babyblue-600 font-medium transition-colors"
              >
                Search
              </Link>
              <Link
                href="/signup"
                className="bg-babyblue-500 hover:bg-babyblue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-md shadow-babyblue-200"
              >
                Create Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Players</h1>
          <p className="text-gray-600">
            Find athletes across Baseball, Football, Basketball, Soccer, and Hockey by name, position, graduation year, or location.
          </p>
        </div>

        <ProfileSearch />
      </main>

      {/* Footer */}
      <footer className="border-t border-babyblue-200/50 bg-white/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>UREPP - The Sports Recruitment Platform</p>
        </div>
      </footer>
    </div>
  )
}