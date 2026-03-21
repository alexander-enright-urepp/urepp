import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Mail, MapPin, GraduationCap, Calendar, Ruler, Scale, Instagram, Twitter, Youtube, User, Trophy } from 'lucide-react'

async function getProfile(username: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .single()
  
  if (error || !profile) {
    return null
  }
  
  return profile
}

interface PageProps {
  params: {
    username: string
  }
}

export default async function PlayerProfilePage({ params }: PageProps) {
  const profile = await getProfile(params.username)
  
  if (!profile) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-babyblue-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-babyblue-600">UREPP</Link>
            <div className="flex gap-3">
              <Link
                href="/search"
                className="text-gray-600 hover:text-babyblue-600 font-medium transition-colors px-3 py-2"
              >
                Search
              </Link>
              <Link
                href="/signup"
                className="bg-babyblue-500 hover:bg-babyblue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-md shadow-babyblue-200"
              >
                Create Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/search" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 overflow-hidden">
          {/* Cover Banner */}
          <div className="h-48 bg-gradient-to-r from-babyblue-400 via-babyblue-500 to-babyblue-600"></div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
              {/* Avatar */}
              <div className="relative">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-babyblue-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-babyblue-600 text-4xl font-bold">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </div>
                )}
              </div>
              
              {/* Name & Basic Info */}
              <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.first_name} {profile.last_name}
                </h1>
                <p className="text-babyblue-600 font-medium text-lg">@{profile.username}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-babyblue-500" />
                    Class of {profile.grad_year}
                  </span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{profile.primary_position}</span>
                  {profile.secondary_position && (
                    <>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{profile.secondary_position}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {profile.gpa && (
                <span className="bg-babyblue-100 text-babyblue-800 px-3 py-1 rounded-full text-sm font-medium">
                  GPA: {profile.gpa}
                </span>
              )}
              {(profile.bats || profile.throws) && (
                <span className="bg-babyblue-100 text-babyblue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {profile.bats && `${profile.bats}H`}{profile.bats && profile.throws && ' / '}{profile.throws && `${profile.throws}H`}
                </span>
              )}
              {(profile.city || profile.state) && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {profile.city}{profile.city && profile.state && ', '}{profile.state}
                </span>
              )}
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
          {/* Player Info */}
          <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-babyblue-500" />
              Player Info
            </h2>
            <div className="space-y-3">
              <InfoRow label="High School" value={profile.high_school} />
              <InfoRow label="City" value={profile.city} />
              <InfoRow label="State" value={profile.state} />
              <InfoRow label="Height" value={profile.height} />
              <InfoRow label="Weight" value={profile.weight ? `${profile.weight} lbs` : null} />
              <InfoRow label="Bats" value={profile.bats} />
              <InfoRow label="Throws" value={profile.throws} />
            </div>
          </div>

          {/* Baseball Metrics */}
          <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-babyblue-500" />
              Baseball Metrics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <StatBox label="Exit Velocity" value={profile.exit_velocity ? `${profile.exit_velocity} mph` : '-'} />
              <StatBox label="Pitch Velocity" value={profile.pitch_velocity ? `${profile.pitch_velocity} mph` : '-'} />
              <StatBox label="60 Yard Dash" value={profile.sixty_time ? `${profile.sixty_time}s` : '-'} />
              <StatBox label="GPA" value={profile.gpa || '-'} />
            </div>
          </div>

          {/* Teams */}
          {profile.teams_played_for && (
            <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-babyblue-500" />
                Teams
              </h2>
              <p className="text-gray-600">{profile.teams_played_for}</p>
            </div>
          )}

          {/* Social Links */}
          {(profile.instagram || profile.twitter || profile.youtube) && (
            <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
              <div className="space-y-3">
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
                    className="flex items-center gap-3 text-gray-600 hover:text-blue-500 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Twitter className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Twitter</p>
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
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-babyblue-200/50 bg-white/50 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>UREPP - The Baseball Recruitment Platform</p>
        </div>
      </footer>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-4 bg-babyblue-50 rounded-xl">
      <p className="text-xl font-bold text-babyblue-700">{value}</p>
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