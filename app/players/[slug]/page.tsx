import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, MapPin, GraduationCap, Calendar, Ruler, Scale, Trophy, Instagram, Twitter, Youtube } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getSportConfig, Sport } from '@/lib/sports'

// Fetch profile from Supabase
async function getProfile(slug: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', slug.toLowerCase())
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data
}

interface PageProps {
  params: {
    slug: string
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const profile = await getProfile(params.slug)
  
  if (!profile) {
    notFound()
  }

  const sport = (profile.sport || 'baseball') as Sport
  const sportConfig = getSportConfig(sport)

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-babyblue-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-babyblue-600">UREPP</Link>
            <Link
              href="/profile/create"
              className="bg-babyblue-500 hover:bg-babyblue-600 text-white px-4 py-2 rounded-xl font-medium text-sm transition-colors shadow-md shadow-babyblue-200"
            >
              Create Your Profile
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 overflow-hidden">
          {/* Cover Banner */}
          <div className="h-48 bg-gradient-to-r from-babyblue-400 via-babyblue-500 to-babyblue-600"></div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
              {/* Avatar */}
              {profile.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-babyblue-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-babyblue-600 text-4xl font-bold">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </div>
              )}
              
              {/* Name & Basic Info */}
              <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  {/* Sport Badge */}
                  <span className="bg-babyblue-100 text-babyblue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {sportConfig.displayName}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-babyblue-500" />
                    Class of {profile.grad_year}
                  </span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{profile.primary_position}{profile.secondary_position && `/${profile.secondary_position}`}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span className="flex items-center gap-1">
                    <Ruler className="w-4 h-4 text-babyblue-500" />
                    {profile.height}
                  </span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span className="flex items-center gap-1">
                    <Scale className="w-4 h-4 text-babyblue-500" />
                    {profile.weight} lbs
                  </span>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="mt-4 md:mt-0 flex gap-2">
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2 bg-babyblue-500 hover:bg-babyblue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-md shadow-babyblue-200"
                >
                  <Mail className="w-4 h-4" />
                  Contact
                </a>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {profile.gpa && (
                <span className="bg-babyblue-100 text-babyblue-800 px-3 py-1 rounded-full text-sm font-medium">
                  GPA: {profile.gpa}
                </span>
              )}
              {sport === 'baseball' && profile.bats && profile.throws && (
                <span className="bg-babyblue-100 text-babyblue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {profile.bats}H / {profile.throws}H
                </span>
              )}
              <span className="bg-babyblue-100 text-babyblue-800 px-3 py-1 rounded-full text-sm font-medium">
                {profile.city || profile.state ? `${profile.city || ''}${profile.city && profile.state ? ', ' : ''}${profile.state || ''}` : 'Location N/A'}
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
              <div className="mb-6 bg-babyblue-50/50 rounded-xl p-5 border border-babyblue-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-babyblue-600" />
                  Awards & Achievements
                </h2>
                <div className="space-y-2">
                  {profile.awards.split('\n').filter((line: string) => line.trim()).map((award: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-babyblue-400 rounded-full mt-2 flex-shrink-0"></span>
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
          <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-babyblue-100 rounded-xl flex items-center justify-center">
                <span className="text-babyblue-600 font-bold text-sm">%</span>
              </span>
              Statistics
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <StatBox 
                label={sportConfig.primaryStat.label} 
                value={profile.stat_primary || profile.exit_velocity || '-'} 
                unit={sportConfig.primaryStat.unit}
              />
              <StatBox 
                label={sportConfig.secondaryStat.label} 
                value={profile.stat_secondary || profile.pitch_velocity || '-'} 
                unit={sportConfig.secondaryStat.unit}
              />
              <StatBox 
                label={sportConfig.tertiaryStat.label} 
                value={profile.stat_tertiary || profile.sixty_time || '-'} 
                unit={sportConfig.tertiaryStat.unit}
              />
            </div>
          </div>

          {/* Academic Info */}
          <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-babyblue-500" />
              Academics
            </h2>
            <div className="space-y-4">
              {profile.gpa && <InfoRow label="GPA" value={profile.gpa.toString()} />}
              <InfoRow label="High School" value={profile.high_school} />
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-babyblue-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Hometown</p>
                  <p className="font-medium text-gray-900">{profile.city || 'N/A'}{profile.city && profile.state && ', '}{profile.state || ''}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links Section - FIXED: Shows all social links */}
        {(profile.instagram || profile.twitter || profile.youtube) && (
          <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-600 hover:text-pink-600 transition-colors"
                >
                  <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Instagram</p>
                    <p className="font-medium">{profile.instagram}</p>
                  </div>
                </a>
              )}
              {profile.twitter && (
                <a
                  href={`https://twitter.com/${profile.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-600 hover:text-sky-500 transition-colors"
                >
                  <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                    <Twitter className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Twitter / X</p>
                    <p className="font-medium">{profile.twitter}</p>
                  </div>
                </a>
              )}
              {profile.youtube && (
                <a
                  href={profile.youtube.startsWith('http') ? profile.youtube : `https://youtube.com/${profile.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <Youtube className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">YouTube</p>
                    <p className="font-medium truncate max-w-[200px]">{profile.youtube}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Videos Section */}
        <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Highlight Videos</h2>
          <p className="text-gray-500">No videos uploaded yet.</p>
        </div>
      </main>
    </div>
  )
}

function StatBox({ label, value, unit }: { label: string; value: string | number; unit: string }) {
  const displayValue = value === '-' || value === null || value === undefined ? '-' : value
  const displayUnit = displayValue === '-' ? '' : unit
  
  return (
    <div className="text-center p-3 bg-babyblue-50 rounded-xl">
      <p className="text-2xl font-bold text-babyblue-700">{String(displayValue)}{displayUnit && <span className="text-sm">{displayUnit}</span>}</p>
      <p className="text-xs text-babyblue-600 uppercase tracking-wide mt-1">{label}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between items-center py-2 border-b border-babyblue-100 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}