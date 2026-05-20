'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Phone, MapPin, GraduationCap, Calendar, Ruler, Scale, Trophy } from 'lucide-react'
import { AnalyticsWidget } from '@/components/AnalyticsWidget'

// This would normally fetch from Supabase
async function getProfile(slug: string) {
  // Mock data for demo
  if (slug === 'john-doe-2026') {
    return {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
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
      bio: 'Hard-working two-way player with strong arm strength and gap-to-gap power. Looking to compete at the Division I level while pursuing a degree in Business. First-team All-Conference selection as a junior.',
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
        { id: '1', title: 'Summer Showcase Highlights', url: '#', description: 'Pitching and hitting from Perfect Game showcase' },
        { id: '2', title: 'Senior Year Skills Video', url: '#', description: '60-yard dash, throwing, fielding, and BP' }
      ],
      awards: 'First-team All-Conference (2024)\nTeam MVP (2023)\nPerfect Game All-American',
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

export default function ProfilePage({ params }: PageProps) {
  const router = useRouter()
  const profile = getProfile(params.slug)
  
  if (!profile) {
    notFound()
  }

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1 && document.referrer.includes(window.location.hostname)) {
      window.history.back()
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2980cc] via-[#51b5ff] to-[#1a5a99]">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-[#51b5ff]/30 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-[#2980cc]">UREPP</Link>
            <Link
              href="/profile/create"
              className="bg-[#51b5ff] hover:bg-[#2980cc] text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors shadow-md shadow-[#51b5ff]/30"
            >
              Create Your Profile
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={handleBack}
          className="inline-flex items-center text-white hover:text-white/80 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl shadow-[#2980cc]/20 border border-[#51b5ff]/20 overflow-hidden">
          {/* Cover Banner */}
          <div className="h-48 bg-gradient-to-r from-[#2980cc] via-[#51b5ff] to-[#1a5a99]"></div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
              {/* Avatar */}
              <div className="w-32 h-32 bg-[#51b5ff]/20 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-[#2980cc] text-4xl font-bold">
                {profile.first_name[0]}{profile.last_name[0]}
              </div>
              
              {/* Name & Basic Info */}
              <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.first_name} {profile.last_name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-[#51b5ff]" />
                    Class of {profile.grad_year}
                  </span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{profile.position}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span className="flex items-center gap-1">
                    <Ruler className="w-4 h-4 text-[#51b5ff]" />
                    {profile.height}
                  </span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span className="flex items-center gap-1">
                    <Scale className="w-4 h-4 text-[#51b5ff]" />
                    {profile.weight} lbs
                  </span>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="mt-4 md:mt-0 flex gap-2">
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2 bg-[#51b5ff] hover:bg-[#2980cc] text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-md shadow-[#51b5ff]/30"
                >
                  <Mail className="w-4 h-4" />
                  Contact
                </a>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-[#51b5ff]/10 text-[#2980cc] px-3 py-1 rounded-full text-sm font-medium">
                GPA: {profile.gpa}
              </span>
              <span className="bg-[#51b5ff]/10 text-[#2980cc] px-3 py-1 rounded-full text-sm font-medium">
                {profile.bats}H / {profile.throws}H
              </span>
              <span className="bg-[#51b5ff]/10 text-[#2980cc] px-3 py-1 rounded-full text-sm font-medium">
                {profile.hometown}, {profile.state}
              </span>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
                <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Awards & Achievements */}
            {profile.awards && (
              <div className="mb-6 bg-[#51b5ff]/5 rounded-xl p-5 border border-[#51b5ff]/20">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#2980cc]" />
                  Awards & Achievements
                </h2>
                <div className="space-y-2">
                  {profile.awards.split('\n').filter(line => line.trim()).map((award, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-[#51b5ff] rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{award.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Stats Section */}
          <div className="bg-white rounded-2xl shadow-xl shadow-[#2980cc]/20 border border-[#51b5ff]/20 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#51b5ff]/10 rounded-xl flex items-center justify-center">
                <span className="text-[#2980cc] font-bold text-sm">%</span>
              </span>
              Statistics
            </h2>
            
            {/* Hitting Stats */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Hitting</h3>
              <div className="grid grid-cols-3 gap-4">
                <StatBox label="AVG" value={profile.stats_json?.batting_avg || '-'} />
                <StatBox label="OBP" value={profile.stats_json?.obp || '-'} />
                <StatBox label="SLG" value={profile.stats_json?.slg || '-'} />
              </div>
            </div>

            {/* Pitching Stats */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Pitching</h3>
              <div className="grid grid-cols-4 gap-3">
                <StatBox label="ERA" value={profile.stats_json?.era || '-'} />
                <StatBox label="WHIP" value={profile.stats_json?.whip || '-'} />
                <StatBox label="K/9" value={profile.stats_json?.k_per_9 || '-'} />
                <StatBox label="IP" value={profile.stats_json?.innings || '-'} />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="bg-white rounded-2xl shadow-xl shadow-[#2980cc]/20 border border-[#51b5ff]/20 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#51b5ff]" />
              Academics
            </h2>
            <div className="space-y-4">
              <InfoRow label="GPA" value={profile.gpa} />
              <InfoRow label="SAT Score" value={profile.sat_score} />
              <InfoRow label="ACT Score" value={profile.act_score} />
              <InfoRow label="High School" value={profile.high_school} />
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#51b5ff] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Hometown</p>
                  <p className="font-medium text-gray-900">{profile.hometown}, {profile.state}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Analytics */}
        <div className="mt-6">
          <AnalyticsWidget playerId={profile.id} />
        </div>

        {/* Videos Section */}
        <div className="bg-white rounded-2xl shadow-xl shadow-[#2980cc]/20 border border-[#51b5ff]/20 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Highlight Videos</h2>
          {profile.videos && profile.videos.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {profile.videos.map((video) => (
                <div key={video.id} className="border border-[#51b5ff]/30 rounded-xl p-4 hover:border-[#2980cc] hover:shadow-md transition-all cursor-pointer bg-[#51b5ff]/5">
                  <div className="aspect-video bg-gray-900 rounded-lg mb-3 flex items-center justify-center group">
                    <div className="w-12 h-12 bg-[#51b5ff]/30 rounded-full flex items-center justify-center group-hover:bg-[#51b5ff]/50 transition-colors">
                      <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[12px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900">{video.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{video.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No videos uploaded yet.</p>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl shadow-xl shadow-[#2980cc]/20 border border-[#51b5ff]/20 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-3 text-gray-600 hover:text-[#2980cc] transition-colors"
              >
                <div className="w-10 h-10 bg-[#51b5ff]/10 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#2980cc]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
              </a>
            )}
            {profile.phone && (
              <a
                href={`tel:${profile.phone}`}
                className="flex items-center gap-3 text-gray-600 hover:text-[#2980cc] transition-colors"
              >
                <div className="w-10 h-10 bg-[#51b5ff]/10 rounded-xl flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#2980cc]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 bg-[#51b5ff]/10 rounded-xl">
      <p className="text-2xl font-bold text-[#2980cc]">{value}</p>
      <p className="text-xs text-[#51b5ff] uppercase tracking-wide mt-1">{label}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#51b5ff]/20 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
