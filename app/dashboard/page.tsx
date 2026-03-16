'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { User, LogOut, Edit, Eye, Plus, Loader2, UserCircle } from 'lucide-react'

interface Profile {
  id: string
  first_name: string
  last_name: string
  username: string
  profile_picture_url: string | null
  primary_position: string
  secondary_position: string | null
  grad_year: number
  high_school: string
  city: string
  state: string
  slug: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        router.push('/login')
        return
      }
      
      setUser(session.user)
      
      // Fetch user's profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      
      setProfile(profileData)
      setLoading(false)
    }
    
    fetchData()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-babyblue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-babyblue-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-babyblue-600">
              UREPP
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/search"
                className="text-gray-600 hover:text-babyblue-600 font-medium transition-colors"
              >
                Search
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.first_name || 'Player'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your recruiting profile and track your progress.
          </p>
        </div>

        {profile ? (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="md:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
              <div className="flex items-start gap-4">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-babyblue-100"
                  />
                ) : (
                  <div className="w-24 h-24 bg-babyblue-100 rounded-full flex items-center justify-center text-babyblue-600 text-2xl font-bold border-4 border-white">
                    {profile.first_name[0]}{profile.last_name[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <p className="text-babyblue-600 font-medium">
                    @{profile.username}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-babyblue-100 text-babyblue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {profile.primary_position}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      Class of {profile.grad_year}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    {profile.high_school} • {profile.city}, {profile.state}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Link
                  href="/edit-profile"
                  className="flex items-center gap-2 bg-babyblue-500 hover:bg-babyblue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-md shadow-babyblue-200"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Link>
                <Link
                  href={`/players/${profile.username}`}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Public Profile
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Status</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Profile Active</p>
                    <p className="text-sm text-gray-500">Visible to coaches</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-babyblue-100 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-babyblue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Public URL</p>
                    <p className="text-sm text-gray-500 truncate max-w-[150px]">
                      urepp.vercel.app/players/{profile.username}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-12 text-center">
            <div className="w-20 h-20 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-babyblue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Your Profile
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't created a recruiting profile yet. Build your profile to get discovered by college coaches.
            </p>
            <Link
              href="/profile/create"
              className="inline-flex items-center gap-2 bg-babyblue-500 hover:bg-babyblue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-babyblue-200"
            >
              <Plus className="w-5 h-5" />
              Create Profile
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}