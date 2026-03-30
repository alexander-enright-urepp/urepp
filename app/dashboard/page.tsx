'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { LogOut, Edit, Eye, Plus, Loader2, UserCircle, Video, Palette, BarChart3, CreditCard, Settings, Crown } from 'lucide-react'
import { ThemeCustomizer } from '@/components/ThemeCustomizer'

interface Profile {
  id: string
  first_name: string
  last_name: string
  username: string
  profile_picture_url: string | null
  primary_position: string
  grad_year: number
  high_school: string
  city: string
  state: string
  is_premium?: boolean
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          console.log('No session found, redirecting to login')
          router.push('/login')
          return
        }
        
        console.log('User ID:', session.user.id)
        setUser(session.user)
        
        // Fetch user's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
        if (profileError) {
          console.error('Profile fetch error:', profileError)
          setError('Failed to load profile: ' + profileError.message)
        } else {
          console.log('Profile data:', profileData)
          setProfile(profileData)
        }
        
        setLoading(false)
      } catch (err: any) {
        console.error('Error:', err)
        setError(err.message)
        setLoading(false)
      }
    }
    
    fetchData()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isPremium = profile?.is_premium

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">UREPP</Link>
            <div className="flex items-center gap-4">
              {isPremium && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  Premium
                </span>
              )}
              <button onClick={handleSignOut} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Debug Info */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 rounded-xl p-4 mb-4">
            {error}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {profile ? (
              <div>
                <div className="flex items-start gap-4 mb-6">
                  {profile.profile_picture_url ? (
                    <img 
                      src={profile.profile_picture_url} 
                      alt={`${profile.first_name} ${profile.last_name}`}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h2>
                    <p className="text-blue-600">@{profile.username}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{profile.primary_position}</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Class of {profile.grad_year}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">{profile.high_school} • {profile.city}, {profile.state}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link 
                    href="/edit-profile" 
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    <Edit className="w-4 h-4" /> Edit Profile
                  </Link>
                  <Link 
                    href={`/players/${profile.username}`}
                    className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4" /> View Public Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Create Your Profile</h2>
                <p className="text-gray-600 mb-4">Build your profile to get discovered by college coaches.</p>
                <Link 
                  href="/profile/create"
                  className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl"
                >
                  <Plus className="w-5 h-5" /> Create Profile
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Other tabs */}
        {activeTab === 'video' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Video</h2>
            <p className="text-gray-600">Video upload here</p>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Stats</h2>
            <p className="text-gray-600">Stats content here</p>
          </div>
        )}

        {activeTab === 'themes' && profile && (
          <ThemeCustomizer profile={profile} isPremium={isPremium || false} />
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Analytics</h2>
            <p className="text-gray-600">Analytics here</p>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Subscription</h2>
            {isPremium ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="font-bold text-lg">Premium Active</p>
                    <p className="text-gray-600">$10/month</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Upgrade to Premium</h3>
                <p className="text-3xl font-bold">$10<span className="text-base font-normal">/month</span></p>
                <ul className="mt-4 space-y-2">
                  <li>✓ Custom themes</li>
                  <li>✓ Video uploads</li>
                  <li>✓ Analytics</li>
                  <li>✓ Featured in search</li>
                </ul>
                <button className="mt-6 w-full bg-yellow-500 text-white py-3 rounded-xl font-semibold">Upgrade Now</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="space-y-4">
              <button className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                Change Password
              </button>
              <button className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-gray-50 text-red-600">
                Delete Account
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
