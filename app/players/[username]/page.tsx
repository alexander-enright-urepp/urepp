'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
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
  BarChart3
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'

interface Profile {
  id: string
  first_name: string
  last_name: string
  username: string
  email?: string
  phone?: string
  grad_year?: number
  position?: string
  height?: string
  weight?: string
  throws?: string
  bats?: string
  high_school?: string
  hometown?: string
  state?: string
  gpa?: string
  sat_score?: string
  act_score?: string
  bio?: string
  awards?: string
  profile_picture_url?: string
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
  profile_links?: any[]
}

export default function PlayerProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*, profile_links(*)')
        .eq('username', params.username.toLowerCase())
        .single()
      
      if (!data) {
        notFound()
      }
      
      setProfile(data)
      setLoading(false)
    }
    fetchProfile()
  }, [params.username])

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
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 py-8 px-4">
      {/* Navigation */}
      <nav className="max-w-md mx-auto mb-6">
        <div className="flex justify-between items-center">
          <Link href="/search" className="text-babyblue-600 hover:text-babyblue-700 flex items-center gap-1 text-sm font-medium">
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
                {profile.profile_picture_url ? (
                  <img src={profile.profile_picture_url} alt={`${profile.first_name} ${profile.last_name}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-babyblue-600">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </span>
                )}
              </div>
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

            {/* Tags */}
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              {profile.grad_year && (
                <span className="bg-babyblue-100 text-babyblue-700 px-3 py-1 rounded-full text-sm font-medium">
                  Class of {profile.grad_year}
                </span>
              )}
              {profile.position && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {profile.position}
                </span>
              )}
            </div>

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
              {profile.linkedin && (
                <a 
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Content Sections */}
          <div className="border-t border-babyblue-100">
            <ProfileContent profile={profile} />
          </div>
        </div>

        {/* Action Cards */}
        <div className="mt-4 space-y-3">
          {profile.profile_links?.filter((l: any) => l.is_visible).map((link: any) => (
            <a 
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-4 border border-babyblue-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer group"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ background: link.color || '#0ea5e9', color: 'white' }}
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
          
          {profile.awards && (
            <div className="bg-white rounded-2xl p-4 border border-babyblue-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900">Awards & Achievements</h3>
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
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-babyblue-200 text-babyblue-600 font-medium hover:bg-babyblue-50 transition-colors shadow-sm"
          >
            <span className="text-lg">🏀</span>
            Made with UREPP
          </Link>
        </div>
      </main>
    </div>
  )
}

function ProfileContent({ profile }: { profile: Profile }) {
  const [activeTab, setActiveTab] = useState<'resume' | 'media' | 'stats'>('resume')

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-babyblue-100">
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

      {/* Tab Content */}
      <div className="p-6 bg-gray-50/50 min-h-[200px]">
        {activeTab === 'resume' && <ResumeTab profile={profile} />}
        {activeTab === 'media' && <MediaTab videos={profile.videos} />}
        {activeTab === 'stats' && <StatsTab stats={profile.stats_json} profile={profile} />}
      </div>
    </div>
  )
}

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

function ResumeTab({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-4">
      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        {profile.grad_year && (
          <InfoCard 
            icon={<Calendar className="w-4 h-4" />}
            label="Class"
            value={`${profile.grad_year}`}
          />
        )}
        {profile.position && (
          <InfoCard 
            icon={<Trophy className="w-4 h-4" />}
            label="Position"
            value={profile.position}
          />
        )}
        {profile.height && (
          <InfoCard 
            icon={<Ruler className="w-4 h-4" />}
            label="Height"
            value={profile.height}
          />
        )}
        {profile.weight && (
          <InfoCard 
            icon={<Scale className="w-4 h-4" />}
            label="Weight"
            value={`${profile.weight} lbs`}
          />
        )}
      </div>

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
                {profile.gpa && (
                  <span className="bg-babyblue-50 text-babyblue-700 px-2 py-1 rounded text-xs">
                    GPA: {profile.gpa}
                  </span>
                )}
                {profile.sat_score && (
                  <span className="bg-babyblue-50 text-babyblue-700 px-2 py-1 rounded text-xs">
                    SAT: {profile.sat_score}
                  </span>
                )}
                {profile.act_score && (
                  <span className="bg-babyblue-50 text-babyblue-700 px-2 py-1 rounded text-xs">
                    ACT: {profile.act_score}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact */}
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
        <div 
          key={video.id} 
          className="bg-white rounded-xl overflow-hidden border border-babyblue-100 hover:border-babyblue-300 transition-colors cursor-pointer group"
        >
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
          <div className="p-4">
            <h3 className="font-semibold text-gray-900">{video.title}</h3>
            {video.description && <p className="text-sm text-gray-500 mt-1">{video.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

function StatsTab({ stats, profile }: { stats?: Profile['stats_json'], profile: Profile }) {
  return (
    <div className="space-y-4">
      {/* Hitting Stats */}
      {(stats?.batting_avg || stats?.obp || stats?.slg) && (
        <div className="bg-white rounded-xl p-4 border border-babyblue-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Hitting</h3>
          <div className="grid grid-cols-3 gap-3">
            {stats?.batting_avg && <StatBox label="AVG" value={stats.batting_avg} />}
            {stats?.obp && <StatBox label="OBP" value={stats.obp} />}
            {stats?.slg && <StatBox label="SLG" value={stats.slg} />}
          </div>
          {(profile.bats || profile.throws) && (
            <div className="flex gap-2 mt-3">
              {profile.bats && (
                <span className="bg-babyblue-100 text-babyblue-700 px-3 py-1 rounded-full text-xs font-medium">
                  Bats: {profile.bats}
                </span>
              )}
              {profile.throws && (
                <span className="bg-babyblue-100 text-babyblue-700 px-3 py-1 rounded-full text-xs font-medium">
                  Throws: {profile.throws}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pitching Stats */}
      {(stats?.era || stats?.whip || stats?.k_per_9 || stats?.innings) && (
        <div className="bg-white rounded-xl p-4 border border-babyblue-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Pitching</h3>
          <div className="grid grid-cols-4 gap-2">
            {stats?.era && <StatBox label="ERA" value={stats.era} />}
            {stats?.whip && <StatBox label="WHIP" value={stats.whip} />}
            {stats?.k_per_9 && <StatBox label="K/9" value={stats.k_per_9} />}
            {stats?.innings && <StatBox label="IP" value={stats.innings} />}
          </div>
        </div>
      )}

      {/* Physical */}
      {(profile.height || profile.weight) && (
        <div className="bg-white rounded-xl p-4 border border-babyblue-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Physical</h3>
          <div className="grid grid-cols-2 gap-3">
            {profile.height && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{profile.height}</p>
                <p className="text-xs text-gray-500 uppercase">Height</p>
              </div>
            )}
            {profile.weight && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{profile.weight} <span className="text-sm font-normal">lbs</span></p>
                <p className="text-xs text-gray-500 uppercase">Weight</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!stats?.batting_avg && !stats?.era && !profile.height && !profile.weight && (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-babyblue-200" />
          <p>No stats added yet</p>
        </div>
      )}
    </div>
  )
}

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

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="text-center p-3 bg-babyblue-50 rounded-xl">
      <p className="text-xl font-bold text-babyblue-700">{value}</p>
      <p className="text-xs text-babyblue-600 uppercase tracking-wide mt-1">{label}</p>
    </div>
  )
}
