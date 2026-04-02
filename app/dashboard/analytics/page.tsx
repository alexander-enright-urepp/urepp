'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Loader2, 
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  BarChart3,
  Calendar,
  Home,
  Search,
  User,
  Tv,
  Crown,
  MousePointer,
  FileText,
  Play,
  Share2,
  Activity,
  Smartphone,
  Monitor,
  Globe,
  Link as LinkIcon,
  ChevronDown
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getAnalyticsSummary } from '@/lib/analytics'

interface AnalyticsData {
  profileViews: number
  uniqueViewers: number
  recruiterViews: number
  linkClicks: number
  resumeClicks: number
  mediaViews: number
  socialClicks: number
  statsViews: number
  viewsByDay: Record<string, number>
  clickedItems: [string, number][]
  trafficSources: [string, number][]
  devices: [string, number][]
  recentActivity: {
    type: string
    viewerType: string
    clickedItem: string | null
    timestamp: string
  }[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeFilter, setTimeFilter] = useState(30)

  useEffect(() => {
    loadData()
  }, [timeFilter])

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, is_premium, first_name, last_name')
      .eq('user_id', session.user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      
      // Only fetch analytics if premium
      if (profileData.is_premium) {
        const summary = await getAnalyticsSummary(session.user.id, timeFilter)
        setAnalytics(summary)
      }
    }
    
    setLoading(false)
  }

  const getTrend = (current: number) => {
    // Mock trend calculation - would compare to previous period
    const percent = Math.floor(Math.random() * 20) + 5
    return { positive: true, value: `+${percent}%` }
  }

  const formatEventLabel = (event: AnalyticsData['recentActivity'][0]) => {
    const labels: Record<string, string> = {
      profile_view: 'viewed your profile',
      resume_click: 'clicked your resume',
      media_click: 'watched your video',
      social_click: `clicked your ${event.clickedItem || 'social link'}`,
      share_click: 'shared your profile',
      stats_view: 'viewed your stats',
    }
    
    const viewer = event.viewerType === 'recruiter' ? 'A recruiter' : 
                   event.viewerType === 'athlete' ? 'An athlete' : 'Someone'
    
    return `${viewer} ${labels[event.type] || 'interacted'}`
  }

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      direct: 'Direct',
      shared_link: 'Shared Link',
      social: 'Social Media',
      recruiter_search: 'Recruiter Search',
    }
    return labels[source] || source
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-babyblue-500" />
      </div>
    )
  }

  // Free user view
  if (!profile?.is_premium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="w-10 h-10 rounded-xl bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-12">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-8 text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
            <p className="text-yellow-100 mb-6">
              Unlock detailed analytics including profile views, recruiter activity, engagement metrics, and more.
            </p>
            <Link 
              href="/dashboard/subscription"
              className="inline-flex items-center gap-2 bg-white text-yellow-600 px-6 py-3 rounded-xl font-semibold"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Premium
            </Link>
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

  const trend = getTrend(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="w-10 h-10 rounded-xl bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-500">Profile insights</p>
              </div>
            </div>
            {/* Time Filter */}
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(Number(e.target.value))}
                className="appearance-none bg-white border border-babyblue-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-babyblue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            icon={<Eye className="w-5 h-5" />}
            value={analytics?.profileViews || 0}
            label="Profile Views"
            trend={trend}
          />
          <StatCard 
            icon={<Users className="w-5 h-5" />}
            value={analytics?.uniqueViewers || 0}
            label="Unique Visitors"
            trend={trend}
          />
          <StatCard 
            icon={<Crown className="w-5 h-5" />}
            value={analytics?.recruiterViews || 0}
            label="Recruiter Views"
            trend={trend}
          />
          <StatCard 
            icon={<MousePointer className="w-5 h-5" />}
            value={analytics?.linkClicks || 0}
            label="Link Clicks"
            trend={trend}
          />
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-4 gap-2">
          <SmallStatCard 
            icon={<FileText className="w-4 h-4" />}
            value={analytics?.resumeClicks || 0}
            label="Resume"
          />
          <SmallStatCard 
            icon={<Play className="w-4 h-4" />}
            value={analytics?.mediaViews || 0}
            label="Media"
          />
          <SmallStatCard 
            icon={<Share2 className="w-4 h-4" />}
            value={analytics?.socialClicks || 0}
            label="Social"
          />
          <SmallStatCard 
            icon={<Activity className="w-4 h-4" />}
            value={analytics?.statsViews || 0}
            label="Stats"
          />
        </div>

        {/* Views Over Time Chart */}
        {analytics?.viewsByDay && Object.keys(analytics.viewsByDay).length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-babyblue-100">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-babyblue-500" />
              <h3 className="font-semibold text-gray-900">Views Over Time</h3>
            </div>
            <div className="flex items-end gap-1 h-32">
              {Object.entries(analytics.viewsByDay).map(([date, count], idx) => {
                const max = Math.max(...Object.values(analytics.viewsByDay))
                const height = max > 0 ? (count / max) * 100 : 0
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-babyblue-500 rounded-t-sm transition-all duration-500"
                      style={{ height: `${height}%`, minHeight: count > 0 ? 4 : 0 }}
                    />
                    <span className="text-[10px] text-gray-400">{new Date(date).toLocaleDateString('en', { weekday: 'narrow' })}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Device Breakdown */}
        {analytics?.devices && analytics.devices.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-babyblue-100">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-babyblue-500" />
              <h3 className="font-semibold text-gray-900">Device Breakdown</h3>
            </div>
            <div className="space-y-3">
              {analytics.devices.map(([device, count]) => {
                const total = analytics.devices.reduce((sum, [, c]) => sum + c, 0)
                const percent = total > 0 ? (count / total) * 100 : 0
                return (
                  <div key={device}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        {device === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                        {device === 'mobile' ? 'Mobile' : 'Desktop'}
                      </span>
                      <span className="font-medium">{count} ({Math.round(percent)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-babyblue-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Traffic Sources */}
        {analytics?.trafficSources && analytics.trafficSources.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-babyblue-100">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-babyblue-500" />
              <h3 className="font-semibold text-gray-900">Traffic Sources</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {analytics.trafficSources.map(([source, count]) => (
                <div key={source} className="bg-babyblue-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-babyblue-700">{count}</p>
                  <p className="text-xs text-babyblue-600">{getSourceLabel(source)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Clicked Links */}
        {analytics?.clickedItems && analytics.clickedItems.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-babyblue-100">
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="w-5 h-5 text-babyblue-500" />
              <h3 className="font-semibold text-gray-900">Top Clicked Links</h3>
            </div>
            <div className="space-y-2">
              {analytics.clickedItems.map(([item, count], idx) => (
                <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-babyblue-100 text-babyblue-600 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-gray-900 capitalize">{item}</span>
                  </div>
                  <span className="text-sm text-gray-500">{count} clicks</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {analytics?.recentActivity && analytics.recentActivity.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-babyblue-100">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-babyblue-500" />
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {analytics.recentActivity.slice(0, 5).map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    event.viewerType === 'recruiter' ? 'bg-yellow-400' : 'bg-babyblue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{formatEventLabel(event)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(event.timestamp).toLocaleTimeString('en', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

function StatCard({ 
  icon, 
  value, 
  label, 
  trend 
}: { 
  icon: React.ReactNode
  value: number
  label: string
  trend: { positive: boolean; value: string }
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-babyblue-100 shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-babyblue-50 flex items-center justify-center text-babyblue-500 mb-3">
        {icon}
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <span className={`text-xs font-medium mb-1 ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
          {trend.positive ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
          {trend.value}
        </span>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

function SmallStatCard({ 
  icon, 
  value, 
  label 
}: { 
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <div className="bg-white rounded-xl p-3 border border-babyblue-100 text-center">
      <div className="w-8 h-8 rounded-lg bg-babyblue-50 flex items-center justify-center text-babyblue-500 mx-auto mb-2">
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}
