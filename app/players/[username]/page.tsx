'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Mail,
  MapPin,
  Phone,
  GraduationCap,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Share2,
  ArrowLeft,
  FileText,
  Play,
  BarChart3,
  Trophy,
  Link as LinkIcon,
  Star,
  Users,
  Ruler,
  Activity,
  ClipboardList,
  Crown,
  ChevronRight,
  Award,
  Video,
  Calendar,
  MapPin as LocationIcon,
} from 'lucide-react'
import { YouTubeThumbnail } from '@/components/YouTubeThumbnail'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'
import { trackAnalytics } from '@/lib/analytics'
import { PREMIUM_THEMES, FREE_THEME, getThemeClasses, type ThemeConfig } from '@/lib/themes'

// Combine all themes
const ALL_THEMES: Record<string, ThemeConfig> = {
  [FREE_THEME.id]: FREE_THEME,
  ...PREMIUM_THEMES.reduce((acc, t) => ({ ...acc, [t.id]: t }), {}),
}

interface Profile {
  id: string
  first_name: string
  last_name: string
  username: string
  email?: string
  phone?: string
  high_school?: string
  hometown?: string
  state?: string
  grad_year?: number
  gpa?: string
  sat_score?: string
  act_score?: string
  bio?: string
  awards?: string
  profile_picture_url?: string
  college_name?: string
  college_city?: string
  college_state?: string
  college_grad_year?: number
  high_school_sports?: string[]
  college_sports?: string[]
  is_premium?: boolean
  role?: string
  theme?: string
  instagram?: string
  twitter?: string
  youtube?: string
  linkedin?: string
  tiktok?: string
  hudl?: string
  maxpreps?: string
  profile_links?: any[]
  teams?: any[]
  measurements?: {
    height?: string
    weight?: string
    forty_yard_dash?: string
    wingspan?: string
    vertical_jump?: string
    broad_jump?: string
    bench_press?: string
    squat?: string
    shuttle_run?: string
  }
  recruiting_status?: string
  offers?: string
  interested_schools?: string
  committed_school?: string
}

interface PlayerStat {
  id: string
  sport: string
  team_name: string
  season_year: string
  position: string
  stats: Record<string, number | string>
}

export default function PlayerProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'resume' | 'media' | 'stats'>('resume')
  const [copied, setCopied] = useState(false)
  const supabase = createClientComponentClient()

  const themeId = profile?.theme || 'default'
  const theme = ALL_THEMES[themeId] || FREE_THEME

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*, profile_links(*), profile_teams(*)')
        .eq('username', params.username.toLowerCase())
        .single()

      if (!profileData) {
        notFound()
        return
      }

      console.log('Profile fetched:', { id: profileData.id, user_id: (profileData as any).user_id, username: profileData.username })

      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('display_order', { ascending: true })

      // Query stats - try user_id first, then fall back to profile id
      const userId = (profileData as any).user_id || profileData.id
      console.log('Fetching stats for user_id:', userId)
      
      const { data: statsData, error: statsError } = await supabase
        .from('player_stats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      console.log('Stats fetched:', { count: statsData?.length || 0, error: statsError?.message, firstStat: statsData?.[0] })

      setProfile({
        ...profileData,
        teams: profileData.profile_teams || [],
        videos: videosData || [],
        measurements: {
          height: profileData.height,
          weight: profileData.weight,
          forty_yard_dash: profileData.forty_yard_dash,
          wingspan: profileData.wingspan,
          vertical_jump: profileData.vertical_jump,
          broad_jump: profileData.broad_jump,
          bench_press: profileData.bench_press,
          squat: profileData.squat,
          shuttle_run: profileData.shuttle_run
        }
      })
      
      setPlayerStats(statsData || [])
      setLoading(false)
    }

    fetchProfile()
  }, [params.username, supabase])

  // Track profile view
  useEffect(() => {
    if (profile) {
      trackAnalytics({
        profileUserId: profile.id,
        eventType: 'profile_view',
      })
    }
  }, [profile])

  const copyProfileLink = () => {
    const url = `${window.location.origin}/players/${params.username}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    
    if (profile) {
      trackAnalytics({
        profileUserId: profile.id,
        eventType: 'share_click',
      })
    }
  }

  const trackSocialClick = (platform: string) => {
    if (profile) {
      trackAnalytics({
        profileUserId: profile.id,
        eventType: 'social_click',
        clickedItem: platform,
      })
    }
  }

  const trackStatsView = () => {
    if (profile) {
      trackAnalytics({
        profileUserId: profile.id,
        eventType: 'stats_view',
      })
    }
  }

  const trackMediaClick = () => {
    if (profile) {
      trackAnalytics({
        profileUserId: profile.id,
        eventType: 'media_click',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-babyblue-500"></div>
      </div>
    )
  }

  if (!profile) {
    notFound()
  }

  // Render different layouts based on theme
  switch (theme.layout) {
    case 'horizontal-card':
      return <RecruiterCardLayout 
        profile={profile} 
        playerStats={playerStats}
        theme={theme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        copied={copied}
        copyProfileLink={copyProfileLink}
        trackSocialClick={trackSocialClick}
        trackStatsView={trackStatsView}
        trackMediaClick={trackMediaClick}
      />
    case 'minimal':
      return <CompactScoutLayout 
        profile={profile} 
        playerStats={playerStats}
        theme={theme}
        copied={copied}
        copyProfileLink={copyProfileLink}
        trackSocialClick={trackSocialClick}
      />
    case 'banner':
      return <BannerLayout 
        profile={profile} 
        playerStats={playerStats}
        theme={theme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        copied={copied}
        copyProfileLink={copyProfileLink}
        trackSocialClick={trackSocialClick}
        trackStatsView={trackStatsView}
        trackMediaClick={trackMediaClick}
      />
    case 'compact':
      return <AthleteDarkLayout 
        profile={profile} 
        playerStats={playerStats}
        theme={theme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        copied={copied}
        copyProfileLink={copyProfileLink}
        trackSocialClick={trackSocialClick}
        trackStatsView={trackStatsView}
        trackMediaClick={trackMediaClick}
      />
    default:
      return <DefaultLayout 
        profile={profile} 
        playerStats={playerStats}
        theme={theme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        copied={copied}
        copyProfileLink={copyProfileLink}
        trackSocialClick={trackSocialClick}
        trackStatsView={trackStatsView}
        trackMediaClick={trackMediaClick}
      />
  }
}

// DEFAULT LAYOUT (Centered, standard)
function DefaultLayout({ profile, playerStats, theme, activeTab, setActiveTab, copied, copyProfileLink, trackSocialClick, trackStatsView, trackMediaClick }: any) {
  const isDark = theme.background === 'dark' || theme.headerStyle === 'dark'
  const bgClass = isDark ? 'bg-[#0B0B0F] text-white' : 'bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100'
  
  return (
    <div className={`min-h-screen ${bgClass} pb-20`}>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => window.history.back()} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={copyProfileLink} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center relative">
              {copied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">Copied!</span>}
              <Share2 className={`w-5 h-5 ${copied ? 'text-green-600' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        <div className="rounded-3xl shadow-xl border overflow-hidden bg-white mx-4 mt-4">
          {/* Profile Header */}
          <div className="px-6 pt-8 pb-6 text-center relative">
            {profile.is_premium && (
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-current" />
                VERIFIED
              </div>
            )}

            <div className="relative mx-auto mb-4">
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-babyblue-100 to-babyblue-200 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {profile.profile_picture_url ? (
                  <img src={profile.profile_picture_url} alt={`${profile.first_name} ${profile.last_name}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-babyblue-600">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">{profile.first_name} {profile.last_name}</h1>
            <p className="text-babyblue-500 font-medium mt-1">@{profile.username}</p>
            {profile.bio && <p className="text-gray-600 mt-3 text-sm leading-relaxed px-2">{profile.bio}</p>}

            {/* Quick Info */}
            <div className="flex justify-center gap-3 mt-4 flex-wrap">
              {profile.high_school_sports?.[0] && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-babyblue-50 text-babyblue-700">
                  {profile.high_school_sports[0]}
                </span>
              )}
              {profile.grad_year && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  Class of {profile.grad_year}
                </span>
              )}
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-3 mt-5 flex-wrap">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="w-10 h-10 rounded-full bg-babyblue-50 flex items-center justify-center text-babyblue-600 hover:bg-babyblue-100">
                  <Mail className="w-5 h-5" />
                </a>
              )}
              {profile.instagram && (
                <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" 
                   onClick={() => trackSocialClick('instagram')}
                   className="w-10 h-10 rounded-full bg-babyblue-50 flex items-center justify-center text-babyblue-600 hover:bg-babyblue-100">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {profile.twitter && (
                <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                   onClick={() => trackSocialClick('twitter')}
                   className="w-10 h-10 rounded-full bg-babyblue-50 flex items-center justify-center text-babyblue-600 hover:bg-babyblue-100">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {profile.youtube && (
                <a href={profile.youtube} target="_blank" rel="noopener noreferrer"
                   onClick={() => trackSocialClick('youtube')}
                   className="w-10 h-10 rounded-full bg-babyblue-50 flex items-center justify-center text-babyblue-600 hover:bg-babyblue-100">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {profile.hudl && (
                <a href={profile.hudl} target="_blank" rel="noopener noreferrer"
                   onClick={() => trackSocialClick('hudl')}
                   className="w-10 h-10 rounded-full bg-babyblue-50 flex items-center justify-center text-babyblue-600 hover:bg-babyblue-100">
                  <span className="text-xs font-bold">HUDL</span>
                </a>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-babyblue-100">
            <div className="flex">
              <TabButton active={activeTab === 'resume'} onClick={() => setActiveTab('resume')} icon={<FileText className="w-4 h-4" />} label="Resume" />
              <TabButton active={activeTab === 'media'} onClick={() => setActiveTab('media')} icon={<Play className="w-4 h-4" />} label="Media" />
              <TabButton active={activeTab === 'stats'} onClick={() => { setActiveTab('stats'); trackStatsView(); }} icon={<BarChart3 className="w-4 h-4" />} label="Stats" />
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'resume' && <ResumeTab profile={profile} />}
            {activeTab === 'media' && <MediaTab videos={profile.videos} onVideoClick={trackMediaClick} />}
            {activeTab === 'stats' && <StatsTab stats={playerStats} />}
          </div>
        </div>
      </main>
    </div>
  )
}

// RECRUITER CARD LAYOUT (Horizontal card header)
function RecruiterCardLayout({ profile, playerStats, theme, activeTab, setActiveTab, copied, copyProfileLink, trackSocialClick, trackStatsView, trackMediaClick }: any) {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={copyProfileLink} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Share2 className={`w-5 h-5 ${copied ? 'text-green-600' : 'text-gray-600'}`} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* Horizontal Card Header */}
        <div className="mx-4 mt-4 bg-gradient-to-r from-babyblue-500 to-babyblue-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center overflow-hidden">
              {profile.profile_picture_url ? (
                <img 
                  src={profile.profile_picture_url} 
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold">{profile.first_name} {profile.last_name}</h1>
              <p className="text-white/80 text-sm">@{profile.username}</p>
              {profile.high_school_sports?.[0] && (
                <p className="text-white/70 text-xs mt-1">{profile.high_school_sports[0]}</p>
              )}
            </div>
            <div className="flex gap-1">
              {profile.instagram && (
                <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                   onClick={() => trackSocialClick('instagram')}
                   className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {profile.twitter && (
                <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                   onClick={() => trackSocialClick('twitter')}
                   className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
          
          {/* Segmented Control Tabs */}
          <div className="flex gap-1 mt-4 border-t border-white/20 pt-3">
            <button 
              onClick={() => setActiveTab('resume')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'resume' ? 'bg-white text-babyblue-600' : 'text-white/70 hover:text-white'
              }`}
            >
              Resume
            </button>
            <button 
              onClick={() => setActiveTab('media')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'media' ? 'bg-white text-babyblue-600' : 'text-white/70 hover:text-white'
              }`}
            >
              Media
            </button>
            <button 
              onClick={() => { setActiveTab('stats'); trackStatsView(); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'stats' ? 'bg-white text-babyblue-600' : 'text-white/70 hover:text-white'
              }`}
            >
              Stats
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'resume' && <ResumeTab profile={profile} minimal />}
          {activeTab === 'media' && <MediaTab videos={profile.videos} onVideoClick={trackMediaClick} />}
          {activeTab === 'stats' && (
            <>
              {console.log('Passing stats to StatsTab:', { playerStatsLength: playerStats?.length, firstStatId: playerStats?.[0]?.id })}
              <StatsTab stats={playerStats} compact />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// COMPACT SCOUT LAYOUT (Everything above fold)
function CompactScoutLayout({ profile, playerStats, theme, copied, copyProfileLink, trackSocialClick }: any) {
  const primaryStat = playerStats?.[0]
  
  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <button onClick={() => window.history.back()} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={copyProfileLink} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4">
        {/* Compact Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-babyblue-100 flex items-center justify-center">
            <span className="text-lg font-bold text-babyblue-600">
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">{profile.first_name} {profile.last_name}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {profile.high_school_sports?.[0] && <span>{profile.high_school_sports[0]}</span>}
              {primaryStat?.stats?.avg && (
                <>
                  <span>•</span>
                  <span className="font-medium text-babyblue-600">{primaryStat.stats.avg} AVG</span>
                </>
              )}
            </div>
          </div>
          {profile.is_premium && (
            <div className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-0.5">
              <Crown className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Social Icons Row */}
        <div className="flex gap-2 mt-3">
          {profile.instagram && (
            <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
               onClick={() => trackSocialClick('instagram')}
               className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-babyblue-100 hover:text-babyblue-600">
              IG
            </a>
          )}
          {profile.twitter && (
            <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
               onClick={() => trackSocialClick('twitter')}
               className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-babyblue-100 hover:text-babyblue-600">
              TW
            </a>
          )}
          {profile.youtube && (
            <a href={profile.youtube} target="_blank" rel="noopener noreferrer"
               onClick={() => trackSocialClick('youtube')}
               className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-babyblue-100 hover:text-babyblue-600">
              YT
            </a>
          )}
          {profile.hudl && (
            <a href={profile.hudl} target="_blank" rel="noopener noreferrer"
               onClick={() => trackSocialClick('hudl')}
               className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-babyblue-100 hover:text-babyblue-600">
              HD
            </a>
          )}
        </div>

        {/* Quick Resume */}
        <div className="mt-4 space-y-2">
          {profile.high_school && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              {profile.high_school}
            </div>
          )}
          {profile.grad_year && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              Class of {profile.grad_year}
            </div>
          )}
          {(profile.hometown || profile.state) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <LocationIcon className="w-4 h-4 text-gray-400" />
              {[profile.hometown, profile.state].filter(Boolean).join(', ')}
            </div>
          )}
        </div>

        {/* Stats Row */}
        {playerStats?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Latest Stats</h3>
            <div className="flex gap-3">
              {Object.entries(playerStats[0].stats).slice(0, 4).map(([key, value]: [string, any]) => (
                <div key={key} className="text-center">
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 uppercase">{key.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Resume Link */}
        <Link href={`/players/${profile.username}/resume`} className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-babyblue-500" />
            <span className="font-medium text-gray-900">View Full Resume</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
      </main>
    </div>
  )
}

// BANNER LAYOUT (Large gradient header, floating avatar)
function BannerLayout({ profile, playerStats, theme, activeTab, setActiveTab, copied, copyProfileLink, trackSocialClick, trackStatsView, trackMediaClick }: any) {
  const isDark = theme.background === 'dark'
  const headerBg = theme.backgroundGradient || 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pb-20`}>
      {/* Banner Header */}
      <div className={`${headerBg} h-32 relative`}>
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={copyProfileLink} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        
        {/* Floating Avatar */}
        <div className="absolute -bottom-10 left-6">
          <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-babyblue-600">
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 pt-12">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {profile.first_name} {profile.last_name}
        </h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>@{profile.username}</p>
        
        {profile.high_school_sports?.[0] && profile.grad_year && (
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {profile.high_school_sports[0]} • Class of {profile.grad_year}
          </p>
        )}

        {/* Stats Chips */}
        {playerStats?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {Object.entries(playerStats[0].stats).slice(0, 3).map(([key, value]: [string, any]) => (
              <span key={key} className="px-3 py-1 rounded-full bg-babyblue-100 text-babyblue-700 text-sm font-medium">
                {value} {key.replace('_', ' ').toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Social Links */}
        <div className="flex gap-2 mt-4">
          {profile.instagram && (
            <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
               onClick={() => trackSocialClick('instagram')}
               className="px-4 py-2 rounded-full bg-babyblue-500 text-white text-sm font-medium hover:bg-babyblue-600">
              Instagram
            </a>
          )}
          {profile.twitter && (
            <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
               onClick={() => trackSocialClick('twitter')}
               className="px-4 py-2 rounded-full bg-gray-800 text-white text-sm font-medium hover:bg-gray-900">
              Twitter
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-6 border-b border-gray-200">
          {['resume', 'media', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab as any)
                if (tab === 'stats') trackStatsView()
              }}
              className={`pb-3 text-sm font-medium capitalize ${
                activeTab === tab 
                  ? 'text-babyblue-500 border-b-2 border-babyblue-500' 
                  : isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'resume' && <ResumeTab profile={profile} minimal isDark={isDark} />}
          {activeTab === 'media' && <MediaTab videos={profile.videos} onVideoClick={trackMediaClick} />}
          {activeTab === 'stats' && <StatsTab stats={playerStats} />}
        </div>
      </div>
    </div>
  )
}

// ATHLETE DARK LAYOUT
function AthleteDarkLayout({ profile, playerStats, theme, activeTab, setActiveTab, copied, copyProfileLink, trackSocialClick, trackStatsView, trackMediaClick }: any) {
  const primaryStat = playerStats?.[0]
  
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0B0B0F]/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <button onClick={copyProfileLink} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-6">
        {/* Centered Header with Stats */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white/20 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold">
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </span>
          </div>
          
          <h1 className="text-3xl font-black text-white">{profile.first_name} {profile.last_name}</h1>
          <p className="text-white/60 mt-1">@{profile.username}</p>
          
          {/* Stats Row Under Name */}
          {primaryStat && (
            <div className="flex justify-center gap-4 mt-4">
              {Object.entries(primaryStat.stats).slice(0, 3).map(([key, value]: [string, any]) => (
                <div key={key} className="text-center">
                  <p className="text-xl font-bold text-cyan-400">{value}</p>
                  <p className="text-xs text-white/40 uppercase">{key.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Social Icons */}
          <div className="flex justify-center gap-3 mt-5">
            {profile.instagram && (
              <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                 onClick={() => trackSocialClick('instagram')}
                 className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20">
                <Instagram className="w-6 h-6 text-cyan-400" />
              </a>
            )}
            {profile.twitter && (
              <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                 onClick={() => trackSocialClick('twitter')}
                 className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20">
                <Twitter className="w-6 h-6 text-cyan-400" />
              </a>
            )}
            {profile.youtube && (
              <a href={profile.youtube} target="_blank" rel="noopener noreferrer"
                 onClick={() => trackSocialClick('youtube')}
                 className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20">
                <Youtube className="w-6 h-6 text-cyan-400" />
              </a>
            )}
          </div>
        </div>

        {/* Glass Cards */}
        <div className="mt-8 space-y-4">
          <button 
            onClick={() => setActiveTab('resume')}
            className="w-full p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span className="font-medium">Resume</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </button>
          
          <button 
            onClick={() => setActiveTab('media')}
            className="w-full p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-cyan-400" />
              <span className="font-medium">Media</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </button>
          
          <button 
            onClick={() => { setActiveTab('stats'); trackStatsView(); }}
            className="w-full p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span className="font-medium">Stats</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </button>
        </div>

        {/* Tab Content */}
        {activeTab !== 'resume' && (
          <div className="mt-6">
            {activeTab === 'media' && <MediaTab videos={profile.videos} onVideoClick={trackMediaClick} dark />}
            {activeTab === 'stats' && <StatsTab stats={playerStats} dark />}
          </div>
        )}
      </main>
    </div>
  )
}

// SHARED COMPONENTS

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
        active
          ? 'text-babyblue-600 border-b-2 border-babyblue-500'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function ResumeTab({ profile, minimal, isDark }: { profile: Profile; minimal?: boolean; isDark?: boolean }) {
  const textColor = isDark ? 'text-white' : 'text-gray-900'
  const mutedColor = isDark ? 'text-white/60' : 'text-gray-500'
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-babyblue-100'
  
  if (minimal) {
    return (
      <div className="space-y-3">
        {/* Bio */}
        {profile.bio && (
          <div className={`p-4 rounded-xl border ${cardBg}`}>
            <p className={`text-sm leading-relaxed ${mutedColor}`}>{profile.bio}</p>
          </div>
        )}

        {/* Quick Stats Row */}
        <div className={`grid grid-cols-2 gap-3`}>
          {profile.grad_year && (
            <div className={`p-3 rounded-xl border ${cardBg} flex items-center gap-2`}>
              <Calendar className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-babyblue-500'}`} />
              <div>
                <p className={`text-xs ${mutedColor}`}>Class</p>
                <p className={`font-semibold ${textColor}`}>{profile.grad_year}</p>
              </div>
            </div>
          )}
          {profile.high_school_sports?.[0] && (
            <div className={`p-3 rounded-xl border ${cardBg} flex items-center gap-2`}>
              <Trophy className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-babyblue-500'}`} />
              <div>
                <p className={`text-xs ${mutedColor}`}>Sport</p>
                <p className={`font-semibold ${textColor}`}>{profile.high_school_sports[0]}</p>
              </div>
            </div>
          )}
        </div>

        {/* School */}
        {profile.high_school && (
          <div className={`p-3 rounded-xl border ${cardBg}`}>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-babyblue-500'}`} />
              <span className={`text-xs font-medium ${mutedColor}`}>High School</span>
            </div>
            <p className={`text-sm font-medium ${textColor}`}>{profile.high_school}</p>
            {(profile.hometown || profile.state) && (
              <p className={`text-xs ${mutedColor} mt-1`}>{[profile.hometown, profile.state].filter(Boolean).join(', ')}</p>
            )}
          </div>
        )}

        {/* Academics */}
        {(profile.gpa || profile.sat_score || profile.act_score) && (
          <div className={`p-3 rounded-xl border ${cardBg}`}>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-babyblue-500'}`} />
              <span className={`text-xs font-medium ${mutedColor}`}>Academics</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {profile.gpa && (
                <div className="text-center">
                  <p className={`text-lg font-bold ${textColor}`}>{profile.gpa}</p>
                  <p className={`text-xs ${mutedColor}`}>GPA</p>
                </div>
              )}
              {profile.sat_score && (
                <div className="text-center">
                  <p className={`text-lg font-bold ${textColor}`}>{profile.sat_score}</p>
                  <p className={`text-xs ${mutedColor}`}>SAT</p>
                </div>
              )}
              {profile.act_score && (
                <div className="text-center">
                  <p className={`text-lg font-bold ${textColor}`}>{profile.act_score}</p>
                  <p className={`text-xs ${mutedColor}`}>ACT</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Awards */}
        {profile.awards && (
          <div className={`p-3 rounded-xl border ${cardBg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Award className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-yellow-500'}`} />
              <span className={`text-xs font-medium ${mutedColor}`}>Awards</span>
            </div>
            <div className="space-y-1">
              {profile.awards.split('\n').filter(a => a.trim()).slice(0, 3).map((award, index) => (
                <p key={index} className={`text-sm ${mutedColor}`}>• {award.trim()}</p>
              ))}
            </div>
          </div>
        )}

        {/* Recruiting Info */}
        {(profile.recruiting_status || profile.committed_school || profile.offers) && (
          <div className={`p-3 rounded-xl border ${cardBg}`}>
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-purple-500'}`} />
              <span className={`text-xs font-medium ${mutedColor}`}>Recruiting</span>
            </div>
            {profile.recruiting_status && (
              <p className={`text-sm ${textColor}`}>Status: {profile.recruiting_status}</p>
            )}
            {profile.committed_school && (
              <p className={`text-sm font-semibold text-purple-500`}>Committed: {profile.committed_school}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quick Info */}
      <div className="grid grid-cols-2 gap-3">
        {profile.grad_year && (
          <div className={`p-3 rounded-xl border ${cardBg} flex items-center gap-3`}>
            <div className={`w-9 h-9 rounded-lg ${isDark ? 'bg-cyan-500/20' : 'bg-babyblue-50'} flex items-center justify-center`}>
              <Calendar className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-babyblue-500'}`} />
            </div>
            <div>
              <p className={`text-xs ${mutedColor}`}>Class</p>
              <p className={`font-semibold text-sm ${textColor}`}>{profile.grad_year}</p>
            </div>
          </div>
        )}
        {profile.high_school_sports?.[0] && (
          <div className={`p-3 rounded-xl border ${cardBg} flex items-center gap-3`}>
            <div className={`w-9 h-9 rounded-lg ${isDark ? 'bg-cyan-500/20' : 'bg-babyblue-50'} flex items-center justify-center`}>
              <Trophy className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-babyblue-500'}`} />
            </div>
            <div>
              <p className={`text-xs ${mutedColor}`}>Sport</p>
              <p className="font-semibold text-sm text-gray-900">{profile.high_school_sports[0]}</p>
            </div>
          </div>
        )}
      </div>

      {/* Academics */}
      {(profile.gpa || profile.sat_score || profile.act_score) && (
        <div className={`rounded-xl p-4 border ${cardBg}`}>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-babyblue-500'}`} />
            <h3 className={`font-semibold ${textColor}`}>Academics</h3>
          </div>
          <div className="space-y-2 text-sm">
            {profile.gpa && (
              <div className="flex justify-between">
                <span className={mutedColor}>GPA</span>
                <span className={`font-medium ${textColor}`}>{profile.gpa}</span>
              </div>
            )}
            {profile.sat_score && (
              <div className="flex justify-between">
                <span className={mutedColor}>SAT</span>
                <span className={`font-medium ${textColor}`}>{profile.sat_score}</span>
              </div>
            )}
            {profile.act_score && (
              <div className="flex justify-between">
                <span className={mutedColor}>ACT</span>
                <span className={`font-medium ${textColor}`}>{profile.act_score}</span>
              </div>
            )}
            {profile.high_school && (
              <div className="flex justify-between">
                <span className={mutedColor}>School</span>
                <span className={`font-medium ${textColor}`}>{profile.high_school}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Awards */}
      {profile.awards && (
        <div className={`rounded-xl p-4 border ${cardBg}`}>
          <div className="flex items-center gap-2 mb-3">
            <Award className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-yellow-500'}`} />
            <h3 className={`font-semibold ${textColor}`}>Awards</h3>
          </div>
          <div className="space-y-2">
            {profile.awards.split('\n').filter(a => a.trim()).map((award, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${isDark ? 'bg-cyan-400' : 'bg-yellow-400'}`} />
                <span className={mutedColor}>{award.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams */}
      {profile.teams && profile.teams.length > 0 && (
        <div className={`rounded-xl p-4 border ${cardBg}`}>
          <div className="flex items-center gap-2 mb-3">
            <Users className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-green-500'}`} />
            <h3 className={`font-semibold ${textColor}`}>Teams</h3>
          </div>
          <div className="space-y-3">
            {profile.teams.map((team: any) => (
              <div key={team.id} className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`font-medium ${textColor}`}>{team.team_name}</p>
                <p className={`text-sm ${mutedColor}`}>
                  {team.sport} {team.position && `• ${team.position}`} {team.year_played && `• ${team.year_played}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High School Info */}
      {(profile.high_school || profile.hometown || profile.state) && (
        <div className={`rounded-xl p-4 border ${cardBg}`}>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-babyblue-500'}`} />
            <h3 className={`font-semibold ${textColor}`}>High School</h3>
          </div>
          {profile.high_school && (
            <p className={`font-medium ${textColor}`}>{profile.high_school}</p>
          )}
          {(profile.hometown || profile.state) && (
            <p className={`text-sm ${mutedColor}`}>
              {[profile.hometown, profile.state].filter(Boolean).join(', ')}
            </p>
          )}
          {profile.high_school_sports && profile.high_school_sports.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.high_school_sports.map((sport: string, idx: number) => (
                <span key={idx} className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-babyblue-100 text-babyblue-700'}`}>
                  {sport}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* College Info */}
      {(profile.college_name || profile.college_city) && (
        <div className={`rounded-xl p-4 border ${cardBg}`}>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-purple-500'}`} />
            <h3 className={`font-semibold ${textColor}`}>College</h3>
          </div>
          {profile.college_name && (
            <p className={`font-medium ${textColor}`}>{profile.college_name}</p>
          )}
          {(profile.college_city || profile.college_state) && (
            <p className={`text-sm ${mutedColor}`}>
              {[profile.college_city, profile.college_state].filter(Boolean).join(', ')}
            </p>
          )}
          {profile.college_grad_year && (
            <p className={`text-sm ${mutedColor} mt-1`}>Graduating {profile.college_grad_year}</p>
          )}
          {profile.college_sports && profile.college_sports.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.college_sports.map((sport: string, idx: number) => (
                <span key={idx} className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-purple-100 text-purple-700'}`}>
                  {sport}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Measurements */}
      {profile.measurements && Object.values(profile.measurements).some(v => v) && (
        <div className={`rounded-xl p-4 border ${cardBg}`}>
          <div className="flex items-center gap-2 mb-3">
            <Ruler className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-orange-500'}`} />
            <h3 className={`font-semibold ${textColor}`}>Measurements</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {profile.measurements.height && (
              <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-lg font-bold ${textColor}`}>{profile.measurements.height}</p>
                <p className={`text-xs ${mutedColor} uppercase`}>Height</p>
              </div>
            )}
            {profile.measurements.weight && (
              <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-lg font-bold ${textColor}`}>{profile.measurements.weight}</p>
                <p className={`text-xs ${mutedColor} uppercase`}>Weight</p>
              </div>
            )}
            {profile.measurements.forty_yard_dash && (
              <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-lg font-bold ${textColor}`}>{profile.measurements.forty_yard_dash}</p>
                <p className={`text-xs ${mutedColor} uppercase`}>40 Yard Dash</p>
              </div>
            )}
            {profile.measurements.wingspan && (
              <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-lg font-bold ${textColor}`}>{profile.measurements.wingspan}</p>
                <p className={`text-xs ${mutedColor} uppercase`}>Wingspan</p>
              </div>
            )}
            {profile.measurements.vertical_jump && (
              <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-lg font-bold ${textColor}`}>{profile.measurements.vertical_jump}</p>
                <p className={`text-xs ${mutedColor} uppercase`}>Vertical Jump</p>
              </div>
            )}
            {profile.measurements.broad_jump && (
              <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-lg font-bold ${textColor}`}>{profile.measurements.broad_jump}</p>
                <p className={`text-xs ${mutedColor} uppercase`}>Broad Jump</p>
              </div>
            )}
            {profile.measurements.bench_press && (
              <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-lg font-bold ${textColor}`}>{profile.measurements.bench_press}</p>
                <p className={`text-xs ${mutedColor} uppercase`}>Bench Press</p>
              </div>
            )}
            {profile.measurements.shuttle_run && (
              <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-lg font-bold ${textColor}`}>{profile.measurements.shuttle_run}</p>
                <p className={`text-xs ${mutedColor} uppercase`}>Shuttle Run</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recruiting Info */}
      {(profile.recruiting_status || profile.committed_school || profile.offers || profile.interested_schools) && (
        <div className={`rounded-xl p-4 border ${cardBg}`}>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-purple-500'}`} />
            <h3 className={`font-semibold ${textColor}`}>Recruiting</h3>
          </div>
          {profile.recruiting_status && (
            <div className="flex justify-between text-sm mb-2">
              <span className={mutedColor}>Status</span>
              <span className={`font-medium capitalize ${textColor}`}>{profile.recruiting_status}</span>
            </div>
          )}
          {profile.committed_school && (
            <div className="flex justify-between text-sm mb-2">
              <span className={mutedColor}>Committed To</span>
              <span className="font-medium text-purple-500">{profile.committed_school}</span>
            </div>
          )}
          {profile.offers && (
            <div className="mt-3">
              <p className={`text-sm font-medium ${textColor} mb-1`}>Offers</p>
              <p className={`text-sm ${mutedColor}`}>{profile.offers}</p>
            </div>
          )}
          {profile.interested_schools && (
            <div className="mt-3">
              <p className={`text-sm font-medium ${textColor} mb-1`}>Interested Schools</p>
              <p className={`text-sm ${mutedColor}`}>{profile.interested_schools}</p>
            </div>
          )}
        </div>
      )}

      {/* Links */}
      {profile.profile_links && profile.profile_links.filter((l: any) => l.is_visible).length > 0 && (
        <div className="space-y-3">
          <h3 className={`font-semibold ${textColor} flex items-center gap-2`}>
            <LinkIcon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-babyblue-500'}`} />
            Links
          </h3>
          {profile.profile_links.filter((l: any) => l.is_visible).map((link: any) => (
            <a 
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-4 p-4 border rounded-2xl transition-shadow ${
                isDark ? 'border-white/10 hover:shadow-lg' : 'border-babyblue-100 hover:shadow-md'
              }`}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: link.color || '#0ea5e9' }}
              >
                {link.icon || '🔗'}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${textColor}`}>{link.title}</h3>
                {link.subtitle && <p className={`text-sm ${mutedColor}`}>{link.subtitle}</p>}
              </div>
              <ChevronRight className={`w-5 h-5 ${mutedColor}`} />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function MediaTab({ videos, onVideoClick, dark }: { videos?: any[]; onVideoClick?: () => void; dark?: boolean }) {
  if (!videos || videos.length === 0) {
    return (
      <div className={`text-center py-8 ${dark ? 'text-white/40' : 'text-gray-500'}`}>
        <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No videos uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {videos.map((video) => (
        <div 
          key={video.id} 
          className={`rounded-xl overflow-hidden border ${dark ? 'border-white/10' : 'border-babyblue-100'} hover:border-babyblue-300 transition-colors cursor-pointer group`} 
          onClick={() => {
            if (onVideoClick) onVideoClick()
            window.open(video.url, '_blank')
          }}
        >
          <YouTubeThumbnail url={video.url} title={video.title} />
          <div className={`p-4 ${dark ? 'bg-white/5' : 'bg-white'}`}>
            <h3 className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{video.title}</h3>
            {video.description && <p className={`text-sm mt-1 ${dark ? 'text-white/60' : 'text-gray-500'}`}>{video.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

const SPORT_FIELDS: Record<string, { key: string; label: string }[]> = {
  basketball: [
    { key: 'games_played', label: 'Games' },
    { key: 'ppg', label: 'PPG' },
    { key: 'rpg', label: 'RPG' },
    { key: 'apg', label: 'APG' },
    { key: 'spg', label: 'SPG' },
    { key: 'bpg', label: 'BPG' },
    { key: 'ft_pct', label: 'FT%' },
    { key: 'three_pt_pct', label: '3PT%' },
    { key: 'fg_pct', label: 'FG%' },
  ],
  football: [
    { key: 'games_played', label: 'Games' },
    { key: 'passing_yards', label: 'Pass Yds' },
    { key: 'passing_tds', label: 'Pass TDs' },
    { key: 'rushing_yards', label: 'Rush Yds' },
    { key: 'rushing_tds', label: 'Rush TDs' },
  ],
  baseball: [
    { key: 'games_played', label: 'Games' },
    { key: 'avg', label: 'AVG' },
    { key: 'hits', label: 'Hits' },
    { key: 'home_runs', label: 'HRs' },
    { key: 'rbis', label: 'RBIs' },
  ],
  soccer: [
    { key: 'games_played', label: 'Games' },
    { key: 'goals', label: 'Goals' },
    { key: 'assists', label: 'Assists' },
    { key: 'shots', label: 'Shots' },
  ],
  volleyball: [
    { key: 'sets_played', label: 'Sets' },
    { key: 'kills', label: 'Kills' },
    { key: 'blocks', label: 'Blocks' },
    { key: 'aces', label: 'Aces' },
  ],
}

const SPORT_ICONS: Record<string, string> = {
  basketball: '🏀',
  football: '🏈',
  baseball: '⚾',
  soccer: '⚽',
  volleyball: '🏐',
}

const SPORT_LABELS: Record<string, string> = {
  basketball: 'Basketball',
  football: 'Football',
  baseball: 'Baseball',
  soccer: 'Soccer',
  volleyball: 'Volleyball',
}

function StatsTab({ stats, compact, dark }: { stats: PlayerStat[]; compact?: boolean; dark?: boolean }) {
  console.log('StatsTab rendering:', { statsCount: stats?.length || 0, compact, dark, firstStat: stats?.[0] })
  
  if (!stats || stats.length === 0) {
    console.log('StatsTab: No stats available')
    return (
      <div className={`text-center py-8 ${dark ? 'text-white/40' : 'text-gray-500'}`}>
        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No stats available yet</p>
      </div>
    )
  }

  const getFilteredStats = (sport: string, statData: Record<string, number | string>) => {
    const fields = SPORT_FIELDS[sport] || []
    console.log('DEBUG statData keys:', Object.keys(statData))
    console.log('DEBUG statData values:', statData)
    console.log('DEBUG expected fields:', fields.map(f => f.key))
    
    const filtered = fields
      .filter(field => {
        const value = statData[field.key]
        const hasValue = value !== undefined && value !== ''
        console.log('DEBUG checking', field.key, ': value="' + value + '" -> hasValue:', hasValue)
        return hasValue
      })
      .map(field => ({
        label: field.label,
        value: statData[field.key]
      }))
    console.log('Filtered stats for', sport, ':', filtered)
    return filtered
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {stats.slice(0, 2).map((stat) => {
          const filteredStats = getFilteredStats(stat.sport, stat.stats || {})
          return (
            <div key={stat.id} className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{SPORT_ICONS[stat.sport] || '🏆'}</span>
                <span className="font-medium text-sm">{stat.team_name}</span>
                <span className="text-xs text-gray-400">{stat.season_year}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {filteredStats.map((field, idx) => (
                  <div key={idx} className="text-center bg-gray-50 rounded p-2">
                    <p className="text-sm font-bold">{field.value}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{field.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {stats.map((stat) => {
        const filteredStats = getFilteredStats(stat.sport, stat.stats || {})
        const sportIcon = SPORT_ICONS[stat.sport] || '🏆'
        const sportLabel = SPORT_LABELS[stat.sport] || stat.sport
        
        return (
          <div key={stat.id} className={`rounded-xl border overflow-hidden ${dark ? 'border-white/10 bg-white/5' : 'border-babyblue-100 bg-white'}`}>
            <div className={`px-4 py-3 border-b ${dark ? 'border-white/10' : 'border-babyblue-50'}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{sportIcon}</span>
                <div>
                  <h4 className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>{stat.team_name}</h4>
                  <p className={`text-xs ${dark ? 'text-white/60' : 'text-gray-500'}`}>
                    {stat.season_year} • {sportLabel}
                    {stat.position && ` • ${stat.position}`}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {filteredStats.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {filteredStats.map((field, idx) => (
                    <div key={idx} className={`text-center p-2.5 rounded-xl ${dark ? 'bg-white/10' : 'bg-babyblue-50'}`}>
                      <p className={`text-lg font-bold ${dark ? 'text-white' : 'text-babyblue-700'} truncate`}>{field.value}</p>
                      <p className={`text-xs uppercase tracking-wide mt-0.5 truncate ${dark ? 'text-white/60' : 'text-babyblue-600'}`}>{field.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm text-center py-4 ${dark ? 'text-white/40' : 'text-gray-400'}`}>No stats recorded for this season</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
