'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Trophy, Video, Share2, User, LogOut, Plus } from 'lucide-react'
import { getCurrentUser, signOut } from '@/lib/auth'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser()
      setUser(user)
      setLoading(false)
    }
    fetchUser()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100">
      {/* Navigation */}
      <nav className="border-b border-babyblue-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-babyblue-600">UREPP</span>
              <span className="ml-2 text-sm text-babyblue-500">Baseball Recruitment</span>
            </div>
            <div className="flex gap-3 items-center">
              {!loading && (
                <>
                  <Link
                    href="/search"
                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors px-3 py-2"
                  >
                    Search
                  </Link>
                  {user ? (
                    <>
                      <Link
                        href="/profile/create"
                        className="hidden sm:flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-md shadow-blue-200"
                      >
                        <Plus className="w-4 h-4" />
                        Create Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-babyblue-600 hover:text-babyblue-700 px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="bg-babyblue-500 hover:bg-babyblue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-md shadow-babyblue-200"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Build Your{' '}
            <span className="text-babyblue-500">Recruitment Profile</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Create a professional baseball recruitment profile. Share your stats, 
            videos, and achievements with college coaches and recruiters.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            {user ? (
              <Link
                href="/profile/create"
                className="bg-babyblue-500 hover:bg-babyblue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-colors flex items-center gap-2 shadow-xl shadow-babyblue-200"
              >
                Create Your Profile
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="bg-babyblue-500 hover:bg-babyblue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-colors flex items-center gap-2 shadow-xl shadow-babyblue-200"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/profile/john-doe-2026"
                  className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-2xl font-semibold text-lg transition-colors flex items-center gap-2"
                >
                  View Demo
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Trophy className="w-8 h-8 text-babyblue-500" />}
            title="Showcase Stats"
            description="Display your batting average, ERA, fielding percentage, and more in a clean, professional format."
          />
          <FeatureCard
            icon={<Video className="w-8 h-8 text-babyblue-500" />}
            title="Highlight Videos"
            description="Upload and organize your game footage, showcases, and skills videos for coaches to review."
          />
          <FeatureCard
            icon={<Share2 className="w-8 h-8 text-babyblue-500" />}
            title="Easy Sharing"
            description="Get a custom profile URL you can share with coaches, post on social media, or include in emails."
          />
        </div>

        {/* Sample Profile Preview */}
        <div className="mt-24 bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-babyblue-100 shadow-xl shadow-babyblue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sample Profile Layout</h2>
          <div className="bg-white rounded-2xl overflow-hidden max-w-3xl mx-auto shadow-lg">
            <div className="h-32 bg-gradient-to-r from-babyblue-400 via-babyblue-500 to-babyblue-600"></div>
            <div className="px-6 pb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-babyblue-100 rounded-full border-4 border-white -mt-12 mb-4 flex items-center justify-center text-babyblue-600 text-2xl font-bold">
                  JD
                </div>
                <h3 className="text-2xl font-bold text-gray-900">John Doe</h3>
                <p className="text-gray-600">Class of 2026 • RHP/SS • 6'1" 185 lbs</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <span className="bg-babyblue-100 text-babyblue-800 px-3 py-1 rounded-full text-sm font-medium">3.8 GPA</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">.325 AVG</span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">92 MPH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-babyblue-200/50 bg-white/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>UREPP - Built for baseball players chasing their college dreams</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm border border-babyblue-100 rounded-2xl p-6 hover:bg-white/90 transition-all shadow-lg shadow-babyblue-100/50 hover:shadow-xl hover:shadow-babyblue-200/50">
      <div className="w-12 h-12 bg-babyblue-100 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
