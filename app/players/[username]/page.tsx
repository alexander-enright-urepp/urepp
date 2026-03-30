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
  Play
} from 'lucide-react'
import { YouTubeThumbnail } from '@/components/YouTubeThumbnail'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'

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
  profile_picture_url?: string
  college_name?: string
  college_city?: string
  college_state?: string
  college_grad_year?: number
  high_school_sports?: string[]
  college_sports?: string[]
  videos?: any[]
  instagram?: string
  twitter?: string
  youtube?: string
  linkedin?: string
  tiktok?: string
  hudl?: string
  maxpreps?: string
}

export default function PlayerProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
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
        videos: videosData || []
      })
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

      <main className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 overflow-hidden">
          <div className="px-6 pt-8 pb-6 text-center">
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

            <h1 className="text-2xl font-bold text-gray-900">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-babyblue-500 font-medium mt-1">@{profile.username}</p>

            {profile.bio && (
              <p className="text-gray-600 mt-3 text-sm leading-relaxed px-2">
                {profile.bio}
              </p>
            )}

            {(profile.high_school_sports?.length || profile.college_sports?.length) && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Sports Played</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {Array.from(new Set([...(profile.high_school_sports || []), ...(profile.college_sports || [])])).map((sport, idx) => (
                    <span key={idx} className="bg-babyblue-100 text-babyblue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3 mt-5 flex-wrap">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              )}
              {profile.instagram && (
                <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {profile.twitter && (
                <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {profile.tiktok && (
                <a href={`https://tiktok.com/@${profile.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
              )}
              {profile.youtube && (
                <a href={profile.youtube} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {profile.hudl && (
                <a href={profile.hudl} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors">
                  <span className="text-xs font-bold">HUDL</span>
                </a>
              )}
              {profile.maxpreps && (
                <a href={profile.maxpreps} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-500 hover:text-babyblue-600 transition-colors">
                  <span className="text-xs font-bold">MP</span>
                </a>
              )}
            </div>
          </div>

          <div className="border-t border-babyblue-100">
            <ProfileContent profile={profile} />
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-babyblue-200 text-babyblue-600 font-medium hover:bg-babyblue-50 transition-colors shadow-sm">
            <span className="text-lg">🏀</span>
            Made with UREPP
          </Link>
        </div>
      </main>
    </div>
  )
}

function ProfileContent({ profile }: { profile: Profile }) {
  const [activeTab, setActiveTab] = useState<'resume' | 'media'>('resume')

  return (
    <div>
      <div className="flex border-b border-babyblue-100">
        <TabButton active={activeTab === 'resume'} onClick={() => setActiveTab('resume')} icon={<FileText className="w-4 h-4" />} label="Resume" />
        <TabButton active={activeTab === 'media'} onClick={() => setActiveTab('media')} icon={<Play className="w-4 h-4" />} label="Media" />
      </div>

      <div className="p-6 bg-gray-50/50 min-h-[200px]">
        {activeTab === 'resume' && <ResumeTab profile={profile} />}
        {activeTab === 'media' && <MediaTab videos={profile.videos} />}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
        active ? 'text-babyblue-600 border-b-2 border-babyblue-500 bg-babyblue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
