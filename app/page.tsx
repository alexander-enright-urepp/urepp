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
    // Simulate a small delay for smooth animation
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

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard number="100+" label="Profiles" />
          <StatCard number="50+" label="Coaches" />
          <StatCard number="6" label="Sports" />
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-babyblue-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="space-y-4">
            <StepItem
              number="1"
              icon={<User className="w-4 h-4" />}
              title="Create Profile"
              description="Sign up and build your profile in 30 seconds"
            />
            <StepItem
              number="2"
              icon={<Users className="w-4 h-4" />}
              title="Get Discovered"
              description="Coaches search and filter profiles daily"
            />
            <StepItem
              number="3"
              icon={<Trophy className="w-4 h-4" />}
              title="Connect & Commit"
              description="Share your profile and get recruited"
            />
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Features</h2>
          <div className="grid grid-cols-2 gap-3">
            <FeatureCard
              icon={<Trophy className="w-5 h-5" />}
              title="Stats"
              description="Track all your metrics"
              isPremium={true}
            />
            <FeatureCard
              icon={<Video className="w-5 h-5" />}
              title="Video"
              description="Showcase highlights"
            />
            <FeatureCard
              icon={<Share2 className="w-5 h-5" />}
              title="Share"
              description="Custom profile URL"
            />
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="Search"
              description="Get discovered easily"
            />
          </div>
        </div>

        {/* Profile Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-babyblue-100 overflow-hidden">
          <div className="p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Profile</h2>
            <p className="text-sm text-gray-600 mb-4">
              A clean, professional layout that puts your achievements front and center.
            </p>
          </div>
          <div className="bg-babyblue-50/50 p-5">
            {/* Mock Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-babyblue-100 overflow-hidden max-w-[280px] mx-auto">
              <div className="h-20 bg-gradient-to-r from-babyblue-400 to-babyblue-500"></div>
              <div className="px-4 pb-4">
                <div className="w-16 h-16 bg-babyblue-100 rounded-full border-4 border-white -mt-8 mb-3 mx-auto flex items-center justify-center text-babyblue-600 text-xl font-bold shadow-lg">
                  JD
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900">John Doe</h3>
                  <p className="text-babyblue-500 text-sm">@john-doe-2026</p>
                  <div className="flex justify-center gap-2 mt-2 text-xs text-gray-600">
                    <span>2026</span>
                    <span>•</span>
                    <span>RHP/SS</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                    <span className="bg-babyblue-100 text-babyblue-700 px-2 py-0.5 rounded-full text-xs">3.8 GPA</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">.325 AVG</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Profile Section */}
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-400 to-amber-500 rounded-2xl p-1 shadow-xl shadow-yellow-200">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 relative overflow-hidden">
            {/* Decorative sparkles */}
            <Sparkles className="absolute -top-2 -right-2 w-16 h-16 text-yellow-300/50" />
            <Sparkles className="absolute bottom-4 left-4 w-10 h-10 text-yellow-300/30" />
            
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                <Crown className="w-4 h-4 text-yellow-900 fill-current" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Premium Profile</h2>
            </div>
            
            {/* Price */}
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">$10</span>
              <span className="text-gray-600 font-medium">/month</span>
            </div>
            
            {/* Features */}
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Palette className="w-4 h-4 text-yellow-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Custom Profile Themes</h3>
                  <p className="text-xs text-gray-600">Stand out with personalized colors and layouts</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-yellow-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Advanced Stat Input</h3>
                  <p className="text-xs text-gray-600">Track detailed performance metrics and career stats</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-yellow-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">In-Depth Analytics</h3>
                  <p className="text-xs text-gray-600">See who views your profile and track your visibility</p>
                </div>
              </div>
            </div>
            
            {/* CTA Button */}
            {user ? (
              <Link
                href="/dashboard/subscription"
                className="block w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-200"
              >
                Upgrade to Premium
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/signup"
                className="block w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-yellow-200"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-babyblue-500 to-babyblue-600 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Ready to Get Recruited?
          </h2>
          <p className="text-babyblue-100 text-sm mb-4">
            Join thousands of athletes getting discovered.
          </p>
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-babyblue-600 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-babyblue-600 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              Create Free Profile
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-sm text-gray-500">
          <p>© 2024 UREPP. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy" className="hover:text-babyblue-600 transition-colors">Privacy</Link>
            <a href="mailto:alex@urepp.tv" className="hover:text-babyblue-600 transition-colors">Contact</a>
          </div>
        </footer>
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

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-babyblue-100">
      <div className="text-xl font-bold text-babyblue-600">{number}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

function StepItem({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 bg-babyblue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
          {number}
        </div>
        <div className="w-0.5 h-full bg-babyblue-100 my-1"></div>
      </div>
      <div className="pb-4 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-babyblue-50 flex items-center justify-center text-babyblue-500">
            {icon}
          </div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, isPremium }: { icon: React.ReactNode; title: string; description: string; isPremium?: boolean }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-babyblue-100 hover:border-babyblue-200 transition-colors relative">
      {isPremium && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
          <Crown className="w-3 h-3 text-yellow-900 fill-current" />
        </div>
      )}
      <div className="w-10 h-10 bg-babyblue-50 rounded-lg flex items-center justify-center text-babyblue-500 mb-2">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
  )
}
