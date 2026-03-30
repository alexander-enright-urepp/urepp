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

// Mock data for demo - would fetch from Supabase
function getProfile(slug: string) {
  if (slug === 'john-doe-2026') {
    return {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe2026',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      grad_year: 2026,
      position: 'RHP/SS',
      height: "6'1\"",
      weight: '185',
      throws: 'R',
      bats: 'R',
      high_school: 'Lincoln High School',
      hometown: 'Springfield',
      state: 'IL',
      gpa: '3.8',
      sat_score: '1350',
      act_score: '28',
      bio: 'Hard-working two-way player with strong arm strength and gap-to-gap power. Looking to compete at the Division I level while pursuing a degree in Business.',
      avatar_url: null,
      stats_json: {
        batting_avg: '.325',
        obp: '.415',
        slg: '.485',
        era: '2.45',
        whip: '1.12',
        k_per_9: '8.5',
        innings: '45.2'
      },
      videos: [
        { id: '1', title: 'Summer Showcase Highlights', url: '#', description: 'Pitching and hitting from Perfect Game showcase', thumbnail: null },
        { id: '2', title: 'Senior Year Skills Video', url: '#', description: '60-yard dash, throwing, fielding, and BP', thumbnail: null }
      ],
      awards: 'First-team All-Conference (2024)\nTeam MVP (2023)\nPerfect Game All-American',
      social_links: {
        instagram: '@johndoe2026',
        twitter: '@johndoe',
        youtube: null,
        linkedin: null
      },
      slug: 'john-doe-2026'
    }
  }
  return null
}

interface PageProps {
  params: {
    slug: string
  }
}

type TabType = 'resume' | 'media' | 'stats'

export default function ProfilePage({ params }: PageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('resume')
  const profile = getProfile(params.slug)
  
  if (!profile) {
    notFound()
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
                    {profile.first_name[0]}{profile.last_name[0]}
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
            <p className="text-gray-600 mt-3 text-sm leading-relaxed px-2">
              {profile.bio}
            </p>

            {/* Social Icons */}
            <div className="flex justify-center gap-3 mt-5">
              {profile.social_links?.instagram && (
                <a 
                  href={`https://instagram.com/${profile.social_links.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {profile.social_links?.twitter && (
                <a 
                  href={`https://twitter.com/${profile.social_links.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {profile.social_links?.youtube && (
                <a 
                  href={profile.social_links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {profile.social_links?.linkedin && (
                <a 
                  href={profile.social_links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              <a 
                href={`mailto:${profile.email}`}
                className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
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
            {activeTab === 'media' && <MediaTab videos={profile.videos} />}
            {activeTab === 'stats' && <StatsTab stats={profile.stats_json} profile={profile} />}
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
          <ActionCard 
            icon={<Trophy className="w-5 h-5" />}
            title="Awards & Achievements"
            subtitle={profile.awards ? `${profile.awards.split('\n').filter(a => a.trim()).length} awards` : 'No awards yet'}
            onClick={() => {}}
          />
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
function ResumeTab({ profile }: { profile: any }) {
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
          <div className="flex justify-between">
            <span className="text-gray-500">GPA</span>
            <span className="font-medium text-gray-900">{profile.gpa}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">SAT</span>
            <span className="font-medium text-gray-900">{profile.sat_score || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">ACT</span>
            <span className="font-medium text-gray-900">{profile.act_score || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">High School</span>
            <span className="font-medium text-gray-900">{profile.high_school}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Hometown</span>
            <span className="font-medium text-gray-900">{profile.hometown}, {profile.state}</span>
          </div>
        </div>
      </div>

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

// Media Tab Content
function MediaTab({ videos }: { videos: any[] }) {
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
function StatsTab({ stats, profile }: { stats: any, profile: any }) {
  return (
    <div className="space-y-4">
      {/* Hitting Stats */}
      <div className="bg-white rounded-xl p-4 border border-babyblue-100">
        <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Hitting</h3>
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="AVG" value={stats?.batting_avg || '-'} />
          <StatBox label="OBP" value={stats?.obp || '-'} />
          <StatBox label="SLG" value={stats?.slg || '-'} />
        </div>
        <div className="flex gap-2 mt-3">
          <span className="bg-babyblue-100 text-babyblue-700 px-3 py-1 rounded-full text-xs font-medium">
            Bats: {profile.bats}
          </span>
          <span className="bg-babyblue-100 text-babyblue-700 px-3 py-1 rounded-full text-xs font-medium">
            Throws: {profile.throws}
          </span>
        </div>
      </div>

      {/* Pitching Stats */}
      <div className="bg-white rounded-xl p-4 border border-babyblue-100">
        <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Pitching</h3>
        <div className="grid grid-cols-4 gap-2">
          <StatBox label="ERA" value={stats?.era || '-'} />
          <StatBox label="WHIP" value={stats?.whip || '-'} />
          <StatBox label="K/9" value={stats?.k_per_9 || '-'} />
          <StatBox label="IP" value={stats?.innings || '-'} />
        </div>
      </div>

      {/* Physical */}
      <div className="bg-white rounded-xl p-4 border border-babyblue-100">
        <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Physical</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{profile.height}</p>
            <p className="text-xs text-gray-500 uppercase">Height</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">{profile.weight} <span className="text-sm font-normal">lbs</span></p>
            <p className="text-xs text-gray-500 uppercase">Weight</p>
          </div>
        </div>
      </div>
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

// Stat Box Component
function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="text-center p-3 bg-babyblue-50 rounded-xl">
      <p className="text-xl font-bold text-babyblue-700">{value}</p>
      <p className="text-xs text-babyblue-600 uppercase tracking-wide mt-1">{label}</p>
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