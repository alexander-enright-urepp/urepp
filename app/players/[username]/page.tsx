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
  ExternalLink,
  Star,
  Users,
  Ruler,
  Activity,
  ClipboardList
} from 'lucide-react'
import { YouTubeThumbnail } from '@/components/YouTubeThumbnail'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'

// Theme definitions - same as in themes page
const THEMES: Record<string, { color: string; accent: string; gradient?: string; dark?: boolean }> = {
  default: { color: '#ffffff', accent: '#0ea5e9', dark: false, textColor: '#0ea5e9' },
  midnight: { color: '#1f2937', accent: '#374151', dark: true },
  neon: { color: '#d946ef', accent: '#22d3ee', gradient: 'linear-gradient(135deg, #d946ef, #8b5cf6, #22d3ee)', dark: true },
  sunset: { color: '#f97316', accent: '#ec4899', gradient: 'linear-gradient(135deg, #f97316, #ec4899, #9333ea)', dark: false },
  forest: { color: '#059669', accent: '#84cc16', dark: false },
  ocean: { color: '#0284c7', accent: '#06b6d4', gradient: 'linear-gradient(135deg, #0284c7, #06b6d4, #14b8a6)', dark: false },
  lavender: { color: '#8b5cf6', accent: '#c084fc', dark: false },
  rose: { color: '#e11d48', accent: '#fb7185', dark: false },
  emerald: { color: '#059669', accent: '#34d399', dark: false },
  cyber: { color: '#06b6d4', accent: '#facc15', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6, #facc15)', dark: true },
  magma: { color: '#dc2626', accent: '#fb923c', gradient: 'linear-gradient(135deg, #dc2626, #ea580c, #fbbf24)', dark: false },
  aurora: { color: '#6366f1', accent: '#2dd4bf', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6, #2dd4bf)', dark: false },
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
  stats_json?: {
    batting_avg?: string
    obp?: string
    slg?: string
    era?: string
    whip?: string
    k_per_9?: string
    innings?: string
  }
  videos?: any[]
  instagram?: string
  twitter?: string
  youtube?: string
  linkedin?: string
  tiktok?: string
  hudl?: string
  maxpreps?: string
  profile_links?: any[]
  // New fields
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

export default function PlayerProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'resume' | 'media' | 'stats'>('resume')
  const [copied, setCopied] = useState(false)
  const supabase = createClientComponentClient()

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

      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .eq('profile_id', profileData.id)
        .order('display_order', { ascending: true })

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
      setLoading(false)
    }

    fetchProfile()
  }, [params.username, supabase])

  // Get theme colors
  const getThemeStyles = () => {
    const themeId = profile?.theme || 'default'
    const theme = THEMES[themeId] || THEMES.default
    return theme
  }

  const theme = getThemeStyles()

  // Determine text color based on theme darkness
  const getTextColor = () => theme.dark ? 'white' : 'black'
  const getTextClass = () => theme.dark ? 'text-white' : 'text-gray-900'
  const getMutedTextClass = () => theme.dark ? 'text-white/80' : 'text-gray-600'
  const getSocialBg = () => theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)'
  const getSocialColor = () => theme.dark ? 'white' : theme.color

  const copyProfileLink = () => {
    const url = `${window.location.origin}/players/${params.username}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  return (
    <div 
      className="min-h-screen"
      style={{
        background: theme.gradient || `linear-gradient(135deg, ${theme.color}10, ${theme.accent}05)`
      }}
    >
      <header 
        className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50"
        style={{ borderColor: 'rgba(0,0,0,0.1)' }}
      >
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.history.back()}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={copyProfileLink}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center relative"
            >
              {copied ? (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Copied!
                </span>
              ) : null}
              <Share2 className={`w-5 h-5 ${copied ? 'text-green-600' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        <div 
          className="rounded-3xl shadow-xl border overflow-hidden"
          style={{ 
            background: theme.gradient ? theme.color : theme.color,
            borderColor: theme.accent + '40',
            boxShadow: `0 20px 25px -5px ${theme.color}30, 0 8px 10px -6px ${theme.color}20`
          }}
        >
          <div className="px-6 pt-8 pb-6 text-center relative" style={{ background: theme.gradient || `linear-gradient(135deg, ${theme.color}, ${theme.accent})` }}>
            {/* Verified Badge - Premium Only */}
            {profile.is_premium && (
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-current" />
                VERIFIED
              </div>
            )}

            <div className="relative mx-auto mb-4">
              <div 
                className="w-28 h-28 mx-auto rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden"
                style={{ background: theme.gradient || theme.color }}
              >
                {profile.profile_picture_url ? (
                  <img src={profile.profile_picture_url} alt={`${profile.first_name} ${profile.last_name}`} className="w-full h-full object-cover" />
                ) : (
                  <span 
                    className="text-4xl font-bold text-white"
                    style={{ color: theme.gradient ? 'white' : 'white' }}
                  >
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </span>
                )}
              </div>
            </div>

            <h1 className={`text-2xl font-bold ${getTextClass()}`}>
              {profile.first_name} {profile.last_name}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <p 
                className={`font-medium ${getTextClass()}`}
              >@{profile.username}</p>
              {profile.role && (
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-medium uppercase"
                  style={{ 
                    backgroundColor: getTextColor() === 'white' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.1)',
                    color: getTextColor()
                  }}
                >
                  {profile.role}
                </span>
              )}
            </div>

            {profile.bio && (
              <p className={`text-sm mt-3 leading-relaxed ${getMutedTextClass()}`}>{profile.bio}</p>
            )}

            {/* Quick Info */}
            <div className="flex justify-center gap-3 mt-4 flex-wrap">
              {profile.high_school_sports?.[0] && (
                <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ 
                  backgroundColor: getTextColor() === 'white' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.1)',
                  color: getTextColor()
                }}>
                  {profile.high_school_sports[0]}
                </span>
              )}
            </div>

            {/* Social Links - All with baby blue color */}
            <div className="flex justify-center gap-3 mt-5 flex-wrap">
              {profile.email && (
                <a 
                  href={`mailto:${profile.email}`} 
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: getSocialBg(), color: getSocialColor() }}
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
              {profile.instagram && (
                <a 
                  href={`https://instagram.com/${profile.instagram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: getSocialBg(), color: getSocialColor() }}
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {profile.twitter && (
                <a 
                  href={`https://twitter.com/${profile.twitter.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: getSocialBg(), color: getSocialColor() }}
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {profile.youtube && (
                <a 
                  href={profile.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: getSocialBg(), color: getSocialColor() }}
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {profile.linkedin && (
                <a 
                  href={profile.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: getSocialBg(), color: getSocialColor() }}
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {profile.tiktok && (
                <a href={profile.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-babyblue-100 flex items-center justify-center text-babyblue-600 hover:bg-babyblue-200 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
              )}
              {profile.hudl && (
                <a href={profile.hudl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-babyblue-100 flex items-center justify-center text-babyblue-600 hover:bg-babyblue-200 transition-colors">
                  <span className="text-xs font-bold">HUDL</span>
                </a>
              )}
              {profile.maxpreps && (
                <a href={profile.maxpreps} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-babyblue-100 flex items-center justify-center text-babyblue-600 hover:bg-babyblue-200 transition-colors">
                  <span className="text-xs font-bold">MP</span>
                </a>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-babyblue-100">
            <div className="flex">
              <TabButton active={activeTab === 'resume'} onClick={() => setActiveTab('resume')} icon={<FileText className="w-4 h-4" />} label="Resume" />
              <TabButton active={activeTab === 'media'} onClick={() => setActiveTab('media')} icon={<Play className="w-4 h-4" />} label="Media" />
              <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 className="w-4 h-4" />} label="Stats" />
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'resume' && <ResumeTab profile={profile} />}
            {activeTab === 'media' && <MediaTab videos={profile.videos} />}
            {activeTab === 'stats' && <StatsTab stats={profile.stats_json} />}
          </div>
        </div>
      </main>
    </div>
  )
}

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

function ResumeTab({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-4">
      {/* High School */}
      {profile.high_school && (
        <div className="bg-white rounded-xl p-4 border border-babyblue-100">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-babyblue-500" />
            <h3 className="font-semibold text-gray-900">High School</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-900">{profile.high_school}</p>
            {(profile.hometown || profile.state) && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-babyblue-500" />
                {profile.hometown}, {profile.state}
              </div>
            )}
            {(profile.gpa || profile.sat_score || profile.act_score) && (
              <div className="flex gap-3 pt-2">
                {profile.gpa && <span className="bg-babyblue-50 text-babyblue-700 px-2 py-1 rounded text-xs">GPA: {profile.gpa}</span>}
                {profile.sat_score && <span className="bg-babyblue-50 text-babyblue-700 px-2 py-1 rounded text-xs">SAT: {profile.sat_score}</span>}
                {profile.act_score && <span className="bg-babyblue-50 text-babyblue-700 px-2 py-1 rounded text-xs">ACT: {profile.act_score}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* College */}
      {(profile.college_name || profile.college_city) && (
        <div className="bg-white rounded-xl p-4 border border-babyblue-100">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900">College</h3>
          </div>
          <div className="space-y-2 text-sm">
            {profile.college_name && <p className="font-medium text-gray-900">{profile.college_name}</p>}
            {(profile.college_city || profile.college_state) && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-purple-500" />
                {profile.college_city}, {profile.college_state}
              </div>
            )}
            {profile.college_grad_year && (
              <div className="flex gap-3 pt-2">
                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">Class of {profile.college_grad_year}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teams */}
      {profile.teams && profile.teams.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-babyblue-100">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Teams</h3>
          </div>
          <div className="space-y-3">
            {profile.teams.map((team: any) => (
              <div key={team.id} className="bg-gray-50 rounded-xl p-3">
                <p className="font-medium text-gray-900">{team.team_name}</p>
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-600">
                  <span>{team.sport}</span>
                  {team.position && <span>• {team.position}</span>}
                  {team.year_played && <span>• {team.year_played}</span>}
                  {(team.city || team.state) && (
                    <span>• {[team.city, team.state].filter(Boolean).join(', ')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Measurements */}
      {profile.measurements && Object.values(profile.measurements).some(v => v) && (
        <div className="bg-white rounded-xl p-4 border border-babyblue-100">
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900">Measurements</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {profile.measurements.height && (
              <div className="bg-orange-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Height</p>
                <p className="font-medium text-gray-900">{profile.measurements.height}</p>
              </div>
            )}
            {profile.measurements.weight && (
              <div className="bg-orange-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Weight</p>
                <p className="font-medium text-gray-900">{profile.measurements.weight}</p>
              </div>
            )}
            {profile.measurements.forty_yard_dash && (
              <div className="bg-orange-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">40 Yard Dash</p>
                <p className="font-medium text-gray-900">{profile.measurements.forty_yard_dash}</p>
              </div>
            )}
            {profile.measurements.wingspan && (
              <div className="bg-orange-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Wingspan</p>
                <p className="font-medium text-gray-900">{profile.measurements.wingspan}</p>
              </div>
            )}
            {profile.measurements.vertical_jump && (
              <div className="bg-orange-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Vertical Jump</p>
                <p className="font-medium text-gray-900">{profile.measurements.vertical_jump}</p>
              </div>
            )}
            {profile.measurements.broad_jump && (
              <div className="bg-orange-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Broad Jump</p>
                <p className="font-medium text-gray-900">{profile.measurements.broad_jump}</p>
              </div>
            )}
            {profile.measurements.bench_press && (
              <div className="bg-orange-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Bench Press</p>
                <p className="font-medium text-gray-900">{profile.measurements.bench_press}</p>
              </div>
            )}
            {profile.measurements.squat && (
              <div className="bg-orange-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Squat</p>
                <p className="font-medium text-gray-900">{profile.measurements.squat}</p>
              </div>
            )}
            {profile.measurements.shuttle_run && (
              <div className="bg-orange-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Shuttle Run</p>
                <p className="font-medium text-gray-900">{profile.measurements.shuttle_run}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Academic Info */}
      {(profile.gpa || profile.sat_score || profile.act_score) && (
        <div className="bg-white rounded-xl p-4 border border-babyblue-100">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Academic Info</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {profile.gpa && (
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">GPA</p>
                <p className="font-bold text-gray-900">{profile.gpa}</p>
              </div>
            )}
            {profile.sat_score && (
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">SAT</p>
                <p className="font-bold text-gray-900">{profile.sat_score}</p>
              </div>
            )}
            {profile.act_score && (
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">ACT</p>
                <p className="font-bold text-gray-900">{profile.act_score}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recruiting Info */}
      {(profile.recruiting_status || profile.offers || profile.interested_schools || profile.committed_school) && (
        <div className="bg-white rounded-xl p-4 border border-babyblue-100">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900">Recruiting Info</h3>
          </div>
          <div className="space-y-2 text-sm">
            {profile.recruiting_status && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Status:</span>
                <span className="font-medium capitalize">{profile.recruiting_status}</span>
              </div>
            )}
            {profile.committed_school && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Committed to:</span>
                <span className="font-medium text-purple-600">{profile.committed_school}</span>
              </div>
            )}
            {profile.offers && (
              <div className="mt-2">
                <p className="text-gray-500 mb-1">Offers:</p>
                <p className="text-gray-700 whitespace-pre-line">{profile.offers}</p>
              </div>
            )}
            {profile.interested_schools && (
              <div className="mt-2">
                <p className="text-gray-500 mb-1">Interested Schools:</p>
                <p className="text-gray-700 whitespace-pre-line">{profile.interested_schools}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Awards */}
      {profile.awards && (
        <div className="bg-white rounded-xl p-4 border border-babyblue-100">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900">Awards</h3>
          </div>
          <div className="space-y-2">
            {profile.awards.split('\n').filter(a => a.trim()).map((award, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>{award.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {profile.profile_links && profile.profile_links.filter((l: any) => l.is_visible).length > 0 && (
        <div className="space-y-3">
          {profile.profile_links?.filter((l: any) => l.is_visible).map((link: any) => (
            <a 
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-4 border border-babyblue-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer group"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: link.color || '#0ea5e9' }}
              >
                {link.icon || '🔗'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{link.title}</h3>
                {link.subtitle && <p className="text-sm text-gray-500">{link.subtitle}</p>}
              </div>
              <div className="text-gray-400 group-hover:text-babyblue-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Contact */}
      <div className="bg-white rounded-xl p-4 border border-babyblue-100">
        <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
        <div className="space-y-2">
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-babyblue-600 transition-colors">
              <Mail className="w-4 h-4 text-babyblue-500" />
              {profile.email}
            </a>
          )}
          {profile.phone && (
            <a href={`tel:${profile.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-babyblue-600 transition-colors">
              <Phone className="w-4 h-4 text-babyblue-500" />
              {profile.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function MediaTab({ videos }: { videos?: any[] }) {
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
        <div key={video.id} className="bg-white rounded-xl overflow-hidden border border-babyblue-100 hover:border-babyblue-300 transition-colors cursor-pointer group" onClick={() => window.open(video.url, '_blank')}>
          <YouTubeThumbnail url={video.url} title={video.title} />
          <div className="p-4">
            <h3 className="font-semibold text-gray-900">{video.title}</h3>
            {video.description && <p className="text-sm text-gray-500 mt-1">{video.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

function StatsTab({ stats }: { stats?: Profile['stats_json'] }) {
  if (!stats || (!stats.batting_avg && !stats.obp && !stats.slg && !stats.era && !stats.whip)) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-babyblue-200" />
        <p>No stats added yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Hitting Stats */}
      {(stats.batting_avg || stats.obp || stats.slg) && (
        <div className="bg-white rounded-xl p-4 border border-babyblue-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Hitting</h3>
          <div className="grid grid-cols-3 gap-3">
            {stats.batting_avg && (
              <div className="text-center p-3 bg-babyblue-50 rounded-xl">
                <p className="text-xl font-bold text-babyblue-700">{stats.batting_avg}</p>
                <p className="text-xs text-babyblue-600 uppercase tracking-wide mt-1">AVG</p>
              </div>
            )}
            {stats.obp && (
              <div className="text-center p-3 bg-babyblue-50 rounded-xl">
                <p className="text-xl font-bold text-babyblue-700">{stats.obp}</p>
                <p className="text-xs text-babyblue-600 uppercase tracking-wide mt-1">OBP</p>
              </div>
            )}
            {stats.slg && (
              <div className="text-center p-3 bg-babyblue-50 rounded-xl">
                <p className="text-xl font-bold text-babyblue-700">{stats.slg}</p>
                <p className="text-xs text-babyblue-600 uppercase tracking-wide mt-1">SLG</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pitching Stats */}
      {(stats.era || stats.whip || stats.k_per_9 || stats.innings) && (
        <div className="bg-white rounded-xl p-4 border border-babyblue-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Pitching</h3>
          <div className="grid grid-cols-4 gap-2">
            {stats.era && (
              <div className="text-center p-3 bg-babyblue-50 rounded-xl">
                <p className="text-lg font-bold text-babyblue-700">{stats.era}</p>
                <p className="text-xs text-babyblue-600 uppercase tracking-wide mt-1">ERA</p>
              </div>
            )}
            {stats.whip && (
              <div className="text-center p-3 bg-babyblue-50 rounded-xl">
                <p className="text-lg font-bold text-babyblue-700">{stats.whip}</p>
                <p className="text-xs text-babyblue-600 uppercase tracking-wide mt-1">WHIP</p>
              </div>
            )}
            {stats.k_per_9 && (
              <div className="text-center p-3 bg-babyblue-50 rounded-xl">
                <p className="text-lg font-bold text-babyblue-700">{stats.k_per_9}</p>
                <p className="text-xs text-babyblue-600 uppercase tracking-wide mt-1">K/9</p>
              </div>
            )}
            {stats.innings && (
              <div className="text-center p-3 bg-babyblue-50 rounded-xl">
                <p className="text-lg font-bold text-babyblue-700">{stats.innings}</p>
                <p className="text-xs text-babyblue-600 uppercase tracking-wide mt-1">IP</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}