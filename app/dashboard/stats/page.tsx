'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  BarChart3,
  Construction,
  Clock,
  Home,
  Search,
  User,
  Tv
} from 'lucide-react'

export default function StatsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="w-10 h-10 rounded-xl bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Stats</h1>
              <p className="text-sm text-gray-500">Performance analytics</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-12">
        <div className="text-center">
          {/* Coming Soon Icon */}
          <div className="w-24 h-24 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="w-12 h-12 text-babyblue-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon!</h2>
          
          <p className="text-gray-600 mb-8 max-w-xs mx-auto">
            We're building powerful analytics to help you track your performance and improve your game.
          </p>

          {/* Features Preview */}
          <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-babyblue-500" />
              What's Coming
            </h3>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-babyblue-500 rounded-full"></div>
                <span className="text-gray-600">Season performance trends</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-babyblue-500 rounded-full"></div>
                <span className="text-gray-600">Stats comparison with peers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-babyblue-500 rounded-full"></div>
                <span className="text-gray-600">Recruiting visibility metrics</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-babyblue-500 rounded-full"></div>
                <span className="text-gray-600">Video performance insights</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="bg-babyblue-500 hover:bg-babyblue-600 text-white py-3 px-8 rounded-xl font-semibold transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-babyblue-100 px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/tv" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <Tv className="w-6 h-6" />
            <span className="text-xs font-medium">TV</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium">Search</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 py-2 px-6 text-babyblue-600">
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
