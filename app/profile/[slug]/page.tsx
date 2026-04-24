'use client'

import { useState, useEffect } from 'react'
import { notFound, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  Ruler, 
  Scale, 
  Trophy,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Share2,
  ArrowLeft,
  FileText,
  Play,
  BarChart3,
  Loader2,
  Crown,
  ShieldCheck
} from 'lucide-react'
import ClaimProfileModal from '@/components/ClaimProfileModal'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  username: string
  email: string
  phone: string | null
  grad_year: number
  position: string
  height: string
  weight: string
  throws: string | null
  bats: string | null
  high_school: string
  hometown: string
  state: string
  gpa: string | null
  sat_score: string | null
  act_score: string | null
  bio: string | null
  avatar_url: string | null
  instagram: string | null
  twitter: string | null
  youtube: string | null
  awards: string | null
  is_premium?: boolean
}

interface StatEntry {
  id: string
  sport: string
  team_name: string
  season_year: string
  position: string
  stats: Record<string, number | string>
}

interface Video {
  id: string
  title: string
  url: string
  description: string
  thumbnail: string | null
}

type TabType = 'resume' | 'media' | 'stats'

const SPORT_FIELDS: Record<string, { key: string; label: string }[]> = {
  basketball: [
    { key: 'games_played', label: 'Games' },
    { key: 'ppg', label: 'PPG' },
    { key: 'rpg', label: 'RPG' },
    { key: 'apg', label: 'APG' },
    { key: 'spg', label: 'SPG' },
    { key: 'bpg', label: 'BPG' },
    { key: 'fg_pct', label: 'FG%' },
    { key: 'three_pt_pct', label: '3PT%' },
    { key: 'ft_pct', label: 'FT%' },
  ],
  football: [
    { key: 'games_played', label: 'Games' },
    { key: 'passing_yards', label: 'Pass Yds' },
    { key: 'passing_tds', label: 'Pass TDs' },
    { key: 'rushing_yards', label: 'Rush Yds' },
    { key: 'rushing_tds', label: 'Rush TDs' },
    { key: 'tackles', label: 'Tackles' },
    { key: 'sacks', label: 'Sacks' },
    { key: 'interceptions', label: 'INTs' },
  ],
  baseball: [
    { key: 'games_played', label: 'Games' },
    { key: 'avg', label: 'AVG' },
    { key: 'hits', label: 'Hits' },
    { key: 'home_runs', label: 'HRs' },
    { key: 'rbis', label: 'RBIs' },
    { key: 'stolen_bases', label: 'SB' },
    { key: 'era', label: 'ERA' },
    { key: 'strikeouts', label: 'K\'s' },
  ],
  soccer: [
    { key: 'games_played', label: 'Games' },
    { key: 'goals', label: 'Goals' },
    { key: 'assists', label: 'Assists' },
    { key: 'shots', label: 'Shots' },
    { key: 'shots_on_target', label: 'On Target' },
    { key: 'minutes_played', label: 'Minutes' },
  ],
  track: [
    { key: 'event', label: 'Event' },
    { key: 'best_time', label: 'Best' },
    { key: 'season_best', label: 'Season' },
    { key: 'personal_record', label: 'PR' },
    { key: 'meets', label: 'Meets' },
  ],
  volleyball: [
    { key: 'sets_played', label: 'Sets' },
    { key: 'kills', label: 'Kills' },
    { key: 'blocks', label: 'Blocks' },
    { key: 'aces', label: 'Aces' },
    { key: 'digs', label: 'Digs' },
    { key: 'assists', label: 'Assists' },
  ],
}

const SPORT_ICONS: Record<string, string> = {
  basketball: '🏀',
  football: '🏈',
  baseball: '⚾',
  soccer: '⚽',
  track: '🏃',
  volleyball: '🏐',
}

const SPORT_LABELS: Record<string, string> = {
  basketball: 'Basketball',
  football: 'Football',
  baseball: 'Baseball',
  soccer: 'Soccer',
  track: 'Track & Field',
  volleyball: 'Volleyball',
}

export default function ProfilePage() {
  const params = useParams()
  const slug = params?.slug as string
  
  const [activeTab, setActiveTab] = useState<TabType>('resume')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<StatEntry[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)

  useEffect(() => {
    if (slug) {
      loadProfileData()
    }
  }, [slug])

  const loadProfileData = async () => {
    setLoading(true)
    
    try {
      // Fetch profile - explicitly include user_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, username, email, phone, grad_year, position, height, weight, throws, bats, high_school, hometown, state, gpa, sat_score, act_score, bio, avatar_url, instagram, twitter, youtube, awards, is_premium')
        .eq('username', slug)
        .single()

      if (profileError || !profileData) {
        console.error('Profile error:', profileError)
        setLoading(false)
        return
      }

      setProfile(profileData as Profile)

      // Fetch player stats using the profile's id (profiles.id matches player_stats.user_id)
      const profileId = profileData.id
      
      const { data: statsData, error: statsError } = await supabase
        .from('player_stats')
        .select('*')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false })

      if (statsError) {
        console.error('Stats fetch error:', statsError)
      }

      if (statsData && statsData.length > 0) {
        setStats(statsData as StatEntry[])
      } else {
        setStats([])
      }

      // TODO: Fetch videos from database
      setVideos([])
    } catch (err) {
      console.error('Error loading profile data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSportIcon = (sport: string) => SPORT_ICONS[sport] || '🏆'
  const getSportLabel = (sport: string) => SPORT_LABELS[sport] || sport

  const getFilteredStats = (sport: string, statData: Record<string, number | string>) => {
    const fields = SPORT_FIELDS[sport] || []
    return fields
      .filter(field => statData[field.key] !== undefined && statData[field.key] !== '')
      .map(field => ({
        key: field.key,
        label: field.label,
        value: statData[field.key]
      }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-babyblue-500" />
      </div>
    )
  }

  if (!profile) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 py-8 px-4">
      {/* Navigation */}
      <nav className="max-w-md mx-auto mb-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-babyblue-600 hover:text-babyblue-700 flex items-center gap-1 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <button className="text-babyblue-600 hover:text-babyblue-700 p-2 rounded-full hover:bg-babyblue-100/50 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Profile Card */}
      <main className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 overflow-hidden">
          {/* Profile Header */}
          <div className="px-6 pt-8 pb-6 text-center">
            {/* Avatar */}
            <div className="relative mx-auto mb-4">
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-babyblue-100 to-babyblue-200 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={`${profile.first_name} ${profile.last_name}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-babyblue-600">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </span>
                )}
              </div>
              {profile.is_premium && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <Crown className="w-4 h-4 text-white fill-current" />
                </div>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.first_name} {profile.last_name}
            </h1>

            {/* Username */}
            <p className="text-babyblue-500 font-medium mt-1">@{profile.username}</p>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-600 mt-3 text-sm leading-relaxed px-2">
                {profile.bio}
              </p>
            )}

            {/* Social Icons */}
            <div className="flex justify-center gap-3 mt-5">
              {profile.instagram && (
                <a 
                  href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {profile.twitter && (
                <a 
                  href={`https://twitter.com/${profile.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {profile.youtube && (
                <a 
                  href={profile.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {profile.email && (
                <a 
                  href={`mailto:${profile.email}`}
                  className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
              <button className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-babyblue-100">
            <div className="flex">
              <TabButton 
                active={activeTab === 'resume'} 
                onClick={() => setActiveTab('resume')}
                icon={<FileText className="w-4 h-4" />}
                label="Resume"
              />
              <TabButton 
                active={activeTab === 'media'} 
                onClick={() => setActiveTab('media')}
                icon={<Play className="w-4 h-4" />}
                label="Media"
              />
              <TabButton 
                active={activeTab === 'stats'} 
                onClick={() => setActiveTab('stats')}
                icon={<BarChart3 className="w-4 h-4" />}
                label="Stats"
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 bg-gray-50/50 min-h-[200px]">
            {activeTab === 'resume' && <ResumeTab profile={profile} />}
            {activeTab === 'media' && <MediaTab videos={videos} />}
            {activeTab === 'stats' && <StatsTab stats={stats} getFilteredStats={getFilteredStats} getSportIcon={getSportIcon} getSportLabel={getSportLabel} />}
          </div>
        </div>

        {/* Action Cards */}
        <div className="mt-4 space-y-3">
          <ActionCard 
            icon={<FileText className="w-5 h-5" />}
            title="View Full Resume"
            subtitle="Download PDF"
            href="#"
          />
          {profile.awards && (
            <ActionCard 
              icon={<Trophy className="w-5 h-5" />}
              title="Awards & Achievements"
              subtitle={`${profile.awards.split('\n').filter(a => a.trim()).length} awards`}
              onClick={() => {}}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-8 pb-8 border-t border-gray-200 bg-white rounded-2xl px-6">
          {/* Claim Profile Link */}
          <div className="text-center mb-6">
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="text-babyblue-600 hover:text-babyblue-700 text-sm font-medium underline underline-offset-2"
            >
              Is this you? Claim this profile
            </button>
          </div>

          {/* Legal Links */}
          <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
            <Link 
              href="/terms" 
              className="hover:text-babyblue-600 transition-colors"
            >
              Terms
            </Link>
            <span className="text-gray-300">•</span>
            <Link 
              href="/privacy" 
              className="hover:text-babyblue-600 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Made with UREPP */}
          <div className="mt-6 text-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-babyblue-200 text-babyblue-600 font-medium hover:bg-babyblue-50 transition-colors shadow-sm"
            >
              <span className="text-lg">🏀</span>
              Made with UREPP
            </Link>
          </div>
        </footer>

        {/* Claim Profile Modal */}
        {profile && (
          <ClaimProfileModal
            isOpen={isClaimModalOpen}
            onClose={() => setIsClaimModalOpen(false)}
            profileUrl={`https://urepp.com/profile/${profile.username}`}
            profileUsername={profile.username}
          />
        )}
      </main>
    </div>
  )
}

// Tab Button Component
function TabButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string 
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
        active 
          ? 'text-babyblue-600 border-b-2 border-babyblue-500 bg-babyblue-50/50' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

// Resume Tab Content
function ResumeTab({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-4">
      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        <InfoCard 
          icon={<Calendar className="w-4 h-4" />}
          label="Class"
          value={`${profile.grad_year}`}
        />
        <InfoCard 
          icon={<Trophy className="w-4 h-4" />}
          label="Position"
          value={profile.position}
        />
        <InfoCard 
          icon={<Ruler className="w-4 h-4" />}
          label="Height"
          value={profile.height}
        />
        <InfoCard 
          icon={<Scale className="w-4 h-4" />}
          label="Weight"
          value={`${profile.weight} lbs`}
        />
      </div>

      {/* Academics */}
      <div className="bg-white rounded-xl p-4 border border-babyblue-100">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-5 h-5 text-babyblue-500" />
          <h3 className="font-semibold text-gray-900">Academics</h3>
        </div>
        <div className="space-y-2 text-sm">
          {profile.gpa && (
            <div className="flex justify-between">
              <span className="text-gray-500">GPA</span>
              <span className="font-medium text-gray-900">{profile.gpa}</span>
            </div>
          )}
          {profile.sat_score && (
            <div className="flex justify-between">
              <span className="text-gray-500">SAT</span>
              <span className="font-medium text-gray-900">{profile.sat_score}</span>
            </div>
          )}
          {profile.act_score && (
            <div className="flex justify-between">
              <span className="text-gray-500">ACT</span>
              <span className="font-medium text-gray-900">{profile.act_score}</span>
            </div>
          )}
          {profile.high_school && (
            <div className="flex justify-between">
              <span className="text-gray-500">High School</span>
              <span className="font-medium text-gray-900">{profile.high_school}</span>
            </div>
          )}
          {(profile.hometown || profile.state) && (
            <div className="flex justify-between">
              <span className="text-gray-500">Hometown</span>
              <span className="font-medium text-gray-900">{[profile.hometown, profile.state].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact */}
      {(profile.email || profile.phone) && (
        <div className="bg-white rounded-xl p-4 border border-babyblue-100">
          <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
          <div className="space-y-2">
            {profile.email && (
              <a 
                href={`mailto:${profile.email}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-babyblue-600 transition-colors"
              >
                <Mail className="w-4 h-4 text-babyblue-500" />
                {profile.email}
              </a>
            )}
            {profile.phone && (
              <a 
                href={`tel:${profile.phone}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-babyblue-600 transition-colors"
              >
                <Phone className="w-4 h-4 text-babyblue-500" />
                {profile.phone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Media Tab Content
function MediaTab({ videos }: { videos: Video[] }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Play className="w-12 h-12 mx-auto mb-3 text-babyblue-200" />
        <p>No videos uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {videos.map((video) => (
        <div 
          key={video.id} 
          className="bg-white rounded-xl overflow-hidden border border-babyblue-100 hover:border-babyblue-300 transition-colors cursor-pointer group"
        >
          {/* Video Thumbnail */}
          <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
            {video.thumbnail ? (
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
            <div className="relative w-14 h-14 bg-babyblue-500/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
            </div>
          </div>
          {/* Video Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900">{video.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{video.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Stats Tab Content
function StatsTab({ 
  stats, 
  getFilteredStats, 
  getSportIcon, 
  getSportLabel 
}: { 
  stats: StatEntry[]
  getFilteredStats: (sport: string, stats: Record<string, number | string>) => { label: string; value: number | string; key: string }[]
  getSportIcon: (sport: string) => string
  getSportLabel: (sport: string) => string
}) {
  console.log('StatsTab rendering with stats:', stats?.length || 0, 'entries')
  
  if (!stats || stats.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-babyblue-200" />
        <p>No stats available yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {stats.map((stat) => {
        console.log('Rendering stat entry:', stat.id, stat.sport, stat.team_name)
        const filteredStats = getFilteredStats(stat.sport, stat.stats || {})
        
        return (
          <div key={stat.id} className="bg-white rounded-xl border border-babyblue-100 overflow-hidden">
            {/* Card Header */}
            <div className="px-4 py-3 border-b border-babyblue-50 bg-babyblue-50/30">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getSportIcon(stat.sport)}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{stat.team_name}</h4>
                  <p className="text-xs text-gray-500">
                    {stat.season_year} • {getSportLabel(stat.sport)}
                    {stat.position && ` • ${stat.position}`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="p-4">
              {filteredStats.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {filteredStats.map((field, idx) => (
                    <div key={`${stat.id}-${idx}`} className="text-center p-2.5 bg-babyblue-50 rounded-xl">
                      <p className="text-lg font-bold text-babyblue-700 truncate">{field.value}</p>
                      <p className="text-xs text-babyblue-600 uppercase tracking-wide mt-0.5 truncate">{field.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No stats recorded for this season</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Info Card Component
function InfoCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-babyblue-100 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-babyblue-50 flex items-center justify-center text-babyblue-500">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-gray-900 text-sm">{value}</p>
      </div>
    </div>
  )
}

// Action Card Component
function ActionCard({ 
  icon, 
  title, 
  subtitle, 
  href,
  onClick
}: { 
  icon: React.ReactNode
  title: string
  subtitle: string
  href?: string
  onClick?: () => void
}) {
  const content = (
    <div className="bg-white rounded-2xl p-4 border border-babyblue-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer group">
      <div className="w-12 h-12 rounded-xl bg-babyblue-50 flex items-center justify-center text-babyblue-500 group-hover:bg-babyblue-100 transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="text-gray-400 group-hover:text-babyblue-500 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
  )
}
