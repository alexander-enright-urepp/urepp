'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { isIOSNative, purchaseIAPProduct, IAP_PRODUCTS, checkSubscriptionExpired, initializeIAP } from '@/lib/iap'
import { useNativePullToRefresh } from '@/lib/usePullToRefresh'
import { 
  LogOut, 
  Edit, 
  Eye, 
  Plus, 
  Loader2, 
  UserCircle, 
  Video, 
  Palette, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Crown, 
  Link as LinkIcon,
  Check, 
  Copy,
  Home,
  Search,
  User,
  ChevronRight,
  Share2,
  Award,
  TrendingUp,
  LayoutTemplate,
  Users,
  GraduationCap,
  Ruler,
  ClipboardList,
  Tv,
  Star,
  UserPlus
} from 'lucide-react'

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
  bio?: string
  stats_json?: any
  profile_views?: number
  role?: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [showPremiumPopup, setShowPremiumPopup] = useState(false)
  const [popupFeature, setPopupFeature] = useState('')
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    setIsIOS(isIOSNative())
    
    // Initialize IAP for iOS at app startup
    if (isIOSNative()) {
      initializeIAP()
    }
  }, [])

  // Pull to refresh for iOS
  const refreshData = useCallback(async () => {
    if (!profile || !user) return
    setLoading(true)
    // Re-run the data fetch logic
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }
      setUser(session.user)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      if (profileData) {
        const { data: analyticsData } = await supabase
          .from('profile_analytics')
          .select('id')
          .eq('profile_user_id', profileData.id)
          .eq('event_type', 'profile_view')
        const viewCount = analyticsData?.length || 0
        setProfile({
          ...profileData,
          profile_views: viewCount
        })
      }
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }, [profile, user, router])

  useNativePullToRefresh(refreshData)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          router.push('/login')
          return
        }
        
        setUser(session.user)
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
        // Check if account is deleted
        if (profileData?.is_deleted) {
          await supabase.auth.signOut()
          router.push('/login')
          return
        }
        
        if (profileError) {
          setError('Failed to load profile')
        } else {
          // Fetch actual profile views from analytics
          const { data: analyticsData, error: analyticsError } = await supabase
            .from('profile_analytics')
            .select('id')
            .eq('profile_user_id', profileData.id)
            .eq('event_type', 'profile_view')
          
          const viewCount = analyticsData?.length || 0
          console.log('Dashboard view count:', viewCount)
          
          // Check if subscription expired and update profile if needed
          const expired = await checkSubscriptionExpired()
          if (expired) {
            console.log('Dashboard: Subscription expired, updating profile')
            profileData.is_premium = false
          }
          
          setProfile({
            ...profileData,
            profile_views: viewCount
          })
        }
        
        setLoading(false)
      } catch (err: any) {
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

  const copyProfileUrl = () => {
    if (!profile?.username) return
    const url = `https://www.urepp.app/players/${profile.username}`
    navigator.clipboard.writeText(url)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handlePremiumFeatureClick = (feature: string) => {
    setPopupFeature(feature)
    setShowPremiumPopup(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-babyblue-500" />
      </div>
    )
  }

  const isPremium = profile?.is_premium

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {profile?.first_name || 'Athlete'}</p>
            </div>
            {isPremium && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Premium
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Upcoming Sessions - Athlete View */}
        <AthleteSessions />

        {/* Profile Card */}
        {profile ? (
          <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 overflow-hidden">
            {/* Profile Header */}
            <div className="p-6 text-center relative">
              {/* Verified Badge - Premium Only */}
              {isPremium && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3 fill-current" />
                  VERIFIED
                </div>
              )}

              {/* Avatar */}
              <div className="relative mx-auto mb-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-babyblue-100 to-babyblue-200 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {profile.profile_picture_url ? (
                    <img src={profile.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-babyblue-600">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Name */}
              <h2 className="text-xl font-bold text-gray-900">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-babyblue-500 font-medium text-sm mt-1">@{profile.username}</p>

              {/* Quick Stats */}
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{profile.profile_views || 0}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 justify-center">
                    <Eye className="w-3 h-3" />
                    Views
                  </p>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 capitalize">{profile.role || 'Athlete'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 justify-center">
                    <UserCircle className="w-3 h-3" />
                    Role
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-5">
                <Link 
                  href="/edit-profile"
                  className="flex-1 bg-babyblue-500 hover:bg-babyblue-600 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <Link 
                  href={`/players/${profile.username}`}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
              </div>

              {/* Copy Link */}
              <button
                onClick={copyProfileUrl}
                className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-babyblue-600 transition-colors py-2"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy profile link
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Create Profile CTA */
          <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-8 text-center">
            <div className="w-20 h-20 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-babyblue-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Create Your Profile</h2>
            <p className="text-gray-600 text-sm mb-4">Build your profile to get discovered by college coaches.</p>
            <Link 
              href="/profile/create"
              className="inline-flex items-center gap-2 bg-babyblue-500 text-white px-6 py-3 rounded-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              Get Started
            </Link>
          </div>
        )}

        {/* Quick Actions Grid */}
        {profile && (
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard 
              icon={<Video className="w-5 h-5" />}
              title="Videos"
              subtitle="Upload highlights"
              href="/dashboard/videos"
            />
            <QuickActionCard 
              icon={<Award className="w-5 h-5" />}
              title="Awards"
              subtitle="View achievements"
              href="/dashboard/awards"
            />
            {/* DISABLED: Stats - Shows popup for web premium */}
            <DisabledQuickActionCard 
              icon={<BarChart3 className="w-5 h-5" />}
              title="Stats"
              subtitle="Advanced Stats"
              onClick={() => handlePremiumFeatureClick('Stats')}
            />
            <QuickActionCard 
              icon={<LinkIcon className="w-5 h-5" />}
              title="Links"
              subtitle="Manage links"
              href="/dashboard/links"
            />
            {/* DISABLED: Analytics - Shows popup for web premium */}
            <DisabledQuickActionCard 
              icon={<TrendingUp className="w-5 h-5" />}
              title="Analytics"
              subtitle="View insights"
              onClick={() => handlePremiumFeatureClick('Analytics')}
            />
            {/* DISABLED: Themes - Shows popup for web premium */}
            <DisabledQuickActionCard 
              icon={<LayoutTemplate className="w-5 h-5" />}
              title="Themes"
              subtitle="Customize look"
              onClick={() => handlePremiumFeatureClick('Themes')}
            />
            <QuickActionCard 
              icon={<Users className="w-5 h-5" />}
              title="Teams"
              subtitle="Team history"
              href="/dashboard/teams"
            />
            <QuickActionCard 
              icon={<GraduationCap className="w-5 h-5" />}
              title="Academics"
              subtitle="GPA & scores"
              href="/dashboard/academics"
            />
            <QuickActionCard 
              icon={<Ruler className="w-5 h-5" />}
              title="Measurements"
              subtitle="Height & weight"
              href="/dashboard/measurements"
            />
            <QuickActionCard 
              icon={<ClipboardList className="w-5 h-5" />}
              title="Recruiting Info"
              subtitle="Status & offers"
              href="/dashboard/recruiting"
            />
          </div>
        )}

        {/* DISABLED: Premium Banner - Commented out for future use
        {!isPremium && profile && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5" />
                  <span className="font-bold">Upgrade to Premium</span>
                </div>
                <p className="text-sm text-yellow-100 mb-3">Get discovered faster</p>
                <ul className="text-sm space-y-1 text-yellow-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3" /> Add stats
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3" /> Analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3" /> Featured in search
                  </li>
                </ul>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">$10</p>
                <p className="text-sm text-yellow-100">/month</p>
              </div>
            </div>
            <Link
              href="/dashboard/subscription"
              className="mt-4 w-full bg-white text-yellow-600 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        )}
        */}

        {/* Settings Menu */}
        <div className="bg-white rounded-2xl shadow-sm border border-babyblue-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-babyblue-50">
            <h3 className="font-semibold text-gray-900">Settings</h3>
          </div>
          <div className="divide-y divide-babyblue-50">
            {/* DISABLED: Subscription - Shows popup for web premium */}
            <SettingsButton onClick={() => handlePremiumFeatureClick('Subscription')} icon={<CreditCard className="w-5 h-5" />} label="Subscription" />
            <SettingsLink href="/invite" icon={<UserPlus className="w-5 h-5" />} label="Invite" />
            <SettingsLink href="/dashboard/account" icon={<Settings className="w-5 h-5" />} label="Account Settings" />
            <SettingsButton onClick={handleSignOut} icon={<LogOut className="w-5 h-5" />} label="Sign Out" danger />
          </div>
        </div>

        {/* Help */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a 
              href="mailto:alex@urepp.tv?subject=UREPP Support Request" 
              className="text-babyblue-600 hover:underline"
            >
              Contact support
            </a>
          </p>
        </div>
      </main>

      {/* Premium Popup Modal */}
      {showPremiumPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Premium Feature</h3>
              <p className="text-sm text-gray-500 mt-2">
                {popupFeature} is available on the web.
              </p>
            </div>
            <div className="space-y-3">
              <a
                href="mailto:alex@urepp.tv?subject=UREPP Premium Support"
                className="w-full bg-babyblue-500 hover:bg-babyblue-600 text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                Contact Support
              </a>
              <button
                onClick={() => setShowPremiumPopup(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium text-sm transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-babyblue-100 px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          <BottomNavLink href="/dashboard/coaches" icon={<Home className="w-6 h-6" />} label="Home" />
          <BottomNavLink href="/tv" icon={<Tv className="w-6 h-6" />} label="TV" />
          <BottomNavLink href="/search" icon={<Search className="w-6 h-6" />} label="Search" />
          <BottomNavLink href="/dashboard" icon={<User className="w-6 h-6" />} label="Profile" active />
        </div>
      </nav>
    </div>
  )
}

// Component: Quick Action Card
function QuickActionCard({ icon, title, subtitle, href, isPremium }: { icon: React.ReactNode, title: string, subtitle: string, href: string, isPremium?: boolean }) {
  return (
    <Link href={href} className="bg-white rounded-2xl p-4 border border-babyblue-100 shadow-sm hover:shadow-md transition-shadow relative">
      {isPremium && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
          <Crown className="w-3 h-3 text-yellow-900 fill-current" />
        </div>
      )}
      <div className="w-10 h-10 rounded-xl bg-babyblue-50 flex items-center justify-center text-babyblue-500 mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </Link>
  )
}

// Component: Disabled Quick Action Card (shows popup on click)
function DisabledQuickActionCard({ icon, title, subtitle, onClick }: { icon: React.ReactNode, title: string, subtitle: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-babyblue-100 shadow-sm hover:shadow-md transition-shadow relative text-left w-full opacity-75"
    >
      <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
        <Crown className="w-3 h-3 text-yellow-900 fill-current" />
      </div>
      <div className="w-10 h-10 rounded-xl bg-babyblue-50 flex items-center justify-center text-babyblue-500 mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </button>
  )
}

// Component: Settings Link
function SettingsLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-gray-500">{icon}</div>
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </Link>
  )
}

// Component: Settings Button
function SettingsButton({ onClick, icon, label, danger }: { onClick: () => void, icon: React.ReactNode, label: string, danger?: boolean }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left">
      <div className="flex items-center gap-3">
        <div className={danger ? 'text-red-500' : 'text-gray-500'}>{icon}</div>
        <span className={`font-medium ${danger ? 'text-red-600' : 'text-gray-700'}`}>{label}</span>
      </div>
    </button>
  )
}

// Component: Athlete Sessions (shows bookings where user is the athlete)
function AthleteSessions() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Get user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('user_id', user.id)
        .single()

      if (!profile) {
        setLoading(false)
        return
      }

      // Fetch from BOTH appointments AND booked_sessions tables
      const [{ data: appointments }, { data: sessions }] = await Promise.all([
        // Legacy Calendly appointments
        supabase
          .from('appointments')
          .select(`
            id,
            coach_id,
            event_type_name,
            start_time,
            end_time,
            status,
            athlete_name,
            profiles!appointments_coach_id_fkey(first_name, last_name)
          `)
          .or(`athlete_id.eq.${profile.id},athlete_email.eq.${profile.email}`)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true }),
        // Native booked sessions
        supabase
          .from('booked_sessions')
          .select(`
            id,
            coach_id,
            session_date,
            start_time,
            end_time,
            status,
            athlete_name,
            video_room_url,
            profiles!booked_sessions_coach_id_fkey(first_name, last_name)
          `)
          .or(`athlete_id.eq.${profile.id},athlete_email.eq.${profile.email}`)
          .gte('session_date', new Date().toISOString().split('T')[0])
          .order('session_date', { ascending: true })
      ]);

      // Combine and format both types
      const combined = [
        ...(appointments || []).map((a: any) => ({
          ...a,
          source: 'calendly',
          display_date: a.start_time,
          coach_name: a.profiles?.first_name + ' ' + a.profiles?.last_name
        })),
        ...(sessions || []).map((s: any) => ({
          ...s,
          event_type_name: 'Coaching Session',
          source: 'native',
          display_date: `${s.session_date}T${s.start_time}`,
          start_time: `${s.session_date}T${s.start_time}`,
          end_time: `${s.session_date}T${s.end_time}`,
          coach_name: s.profiles?.first_name + ' ' + s.profiles?.last_name
        }))
      ].sort((a: any, b: any) => new Date(a.display_date).getTime() - new Date(b.display_date).getTime());

      setSessions(combined.slice(0, 5))
    }

    fetchSessions()
  }, [])

  if (loading) return null
  if (sessions.length === 0) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-babyblue-200/50 border border-babyblue-100 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-babyblue-100 flex items-center justify-center">
          <Video className="w-5 h-5 text-babyblue-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">My Sessions</h2>
          <p className="text-xs text-gray-500">{sessions.length} upcoming</p>
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((appt: any) => (
          <div key={appt.id} className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-babyblue-100 rounded-lg flex flex-col items-center justify-center">
                <span className="text-xs font-medium text-babyblue-600">
                  {formatDate(appt.start_time).split(' ')[0]}
                </span>
                <span className="text-sm font-bold text-babyblue-600">
                  {formatDate(appt.start_time).split(' ')[1]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  Coach {appt.coach_name || `${appt.profiles?.first_name} ${appt.profiles?.last_name}`}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(appt.start_time)} · {appt.event_type_name}
                </p>
              </div>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                appt.status === 'scheduled' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            
            <button
              onClick={() => router.push(appt.video_room_url ? `/video-call?url=${encodeURIComponent(appt.video_room_url)}` : `/dashboard/coaches`)}
              className="w-full mt-3 bg-babyblue-500 hover:bg-babyblue-600 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <Video className="w-3 h-3" />
              Join Call
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Component: Bottom Navigation Link
function BottomNavLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-0.5 py-2 px-6 ${active ? 'text-babyblue-600' : 'text-gray-400 hover:text-gray-600'}`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}
