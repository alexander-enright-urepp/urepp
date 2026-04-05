// iOS-only Home page with pull-to-refresh
// Copy this to app/page.tsx when building for iOS

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  Trophy, 
  Video, 
  Share2, 
  User, 
  LogOut, 
  Star, 
  CheckCircle, 
  Users,
  Home as HomeIcon,
  Search,
  ChevronRight,
  Play,
  Tv,
  Crown,
  Sparkles,
  TrendingUp,
  Palette,
  Loader2
} from 'lucide-react'
import { getCurrentUser, signOut } from '@/lib/auth'
import PullToRefreshContainer from '@/components/PullToRefreshContainer'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchUser = useCallback(async () => {
    const user = await getCurrentUser()
    setUser(user)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchUser()
    await new Promise(resolve => setTimeout(resolve, 800))
    setRefreshing(false)
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-babyblue-500"></div>
      </div>
    )
  }

  return (
    <PullToRefreshContainer 
      onRefresh={handleRefresh}
      className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20"
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl font-bold text-babyblue-600">UREPP</span>
              <span className="ml-2 text-xs text-babyblue-500">Sports</span>
            </div>
            <div className="flex gap-2 items-center">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = '/login'}
                  className="text-sm text-babyblue-600 hover:text-babyblue-700 px-3 py-1.5 rounded-lg hover:bg-babyblue-50 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-babyblue-200/50 border border-babyblue-100 text-center">
          <div className="inline-flex items-center gap-1 bg-babyblue-100 text-babyblue-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
            <Star className="w-3 h-3 fill-current" />
            Trusted by Athletes
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
            Get Discovered by{' '}
            <span className="text-babyblue-500">College Coaches</span>
          </h1>
          
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Create your professional recruiting profile in minutes. Showcase your stats, skills, and achievements.
          </p>
          
          {user ? (
            <Link
              href="/dashboard"
              className="block w-full bg-babyblue-500 hover:bg-babyblue-600 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-babyblue-200"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full bg-babyblue-500 hover:bg-babyblue-600 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-babyblue-200"
              >
                Start Free Profile
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/search"
                className="block w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 py-3.5 rounded-xl font-medium transition-colors"
              >
                Search Players
              </Link>
            </div>
          )}
          
          <div className="flex flex-wrap justify-center gap-4 mt-5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              100% Free
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              No Credit Card
            </span>
          </div>
        </div>

        {/* Pull down to refresh hint (only shows on iOS) */}
        <div className="text-center">
          <p className="text-xs text-gray-400">Pull down to refresh</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-babyblue-100">
            <div className="text-xl font-bold text-babyblue-600">100+</div>
            <div className="text-xs text-gray-500">Profiles</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-babyblue-100">
            <div className="text-xl font-bold text-babyblue-600">50+</div>
            <div className="text-xs text-gray-500">Coaches</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-babyblue-100">
            <div className="text-xl font-bold text-babyblue-600">6</div>
            <div className="text-xs text-gray-500">Sports</div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-babyblue-100 px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/" className="flex flex-col items-center gap-0.5 py-2 px-6 text-babyblue-600">
            <HomeIcon className="w-6 h-6" />
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
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </PullToRefreshContainer>
  )
}
