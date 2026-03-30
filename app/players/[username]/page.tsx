import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, MapPin, GraduationCap, Instagram, Twitter, Youtube, Link as LinkIcon, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getProfile(username: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, profile_links(*)')
    .eq('username', username.toLowerCase())
    .single()
  
  if (!profile) return null
  return profile
}

export default async function PlayerProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfile(params.username)
  if (!profile) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">UREPP</Link>
            <Link href="/signup" className="bg-blue-500 text-white px-4 py-2 rounded-xl">Create Profile</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/search" className="inline-flex items-center text-gray-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>

        {/* Header with Profile Picture */}
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {profile.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt="" className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg" />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 bg-blue-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-blue-600">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold">{profile.first_name} {profile.last_name}</h1>
              <p className="text-blue-600 text-lg">@{profile.username}</p>
              {profile.bio && <p className="mt-3 text-gray-600">{profile.bio}</p>}

              <div className="flex flex-wrap gap-2 mt-3">
                {profile.grad_year && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Class of {profile.grad_year}</span>
                )}
                {profile.high_school_sports?.map((s: string) => (
                  <span key={s} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 space-y-6">
            {/* High School */}
            {profile.high_school && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-500" /> High School
                </h2>
                <div className="space-y-3">
                  <p className="font-semibold text-lg">{profile.high_school}</p>
                  <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4" /> {profile.city}, {profile.state}</div>
                  {profile.grad_year && <p className="text-gray-600">Graduating {profile.grad_year}</p>}
                  {profile.high_school_sports?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="text-sm text-gray-500">Sports:</span>
                      {profile.high_school_sports.map((s: string) => (
                        <span key={s} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                  {profile.teams_played_for && <p className="text-gray-600">Teams: {profile.teams_played_for}</p>}
                </div>
              </div>
            )}

            {/* College */}
            {profile.college_name && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-500" /> College
                </h2>
                <div className="space-y-3">
                  <p className="font-semibold text-lg">{profile.college_name}</p>
                  <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4" /> {profile.college_city}, {profile.college_state}</div>
                  {profile.college_grad_year && <p className="text-gray-600">Graduating {profile.college_grad_year}</p>}
                  {profile.college_years_played?.length > 0 && <p className="text-gray-600">Years Played: {profile.college_years_played.join(', ')}</p>}
                  {profile.college_sports?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="text-sm text-gray-500">Sports:</span>
                      {profile.college_sports.map((s: string) => (
                        <span key={s} className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Awards */}
            {profile.awards && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" /> Awards
                </h2>
                <div className="whitespace-pre-wrap text-gray-600">{profile.awards}</div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Social */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold mb-4">Connect</h2>
              <div className="space-y-3">
                {profile.instagram && (
                  <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-pink-50"
                  >
                    <Instagram className="w-5 h-5 text-pink-600" /> <span className="font-medium">Instagram</span>
                  </a>
                )}
                {profile.twitter && (
                  <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50"
                  >
                    <Twitter className="w-5 h-5 text-blue-400" /> <span className="font-medium">Twitter</span>
                  </a>
                )}
                {profile.youtube && (
                  <a href={profile.youtube} target="_blank" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-red-50"
                  >
                    <Youtube className="w-5 h-5 text-red-600" /> <span className="font-medium">YouTube</span>
                  </a>
                )}
              </div>
            </div>

            {/* Links */}
            {profile.profile_links?.filter((l: any) => l.is_visible).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-blue-500" /> Links
                </h2>
                <div className="space-y-3">
                  {profile.profile_links.filter((l: any) => l.is_visible).map((link: any) => (
                    <a key={link.id} href={link.url} target="_blank" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <span className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: link.color || '#3b82f6', color: 'white' }}>{link.icon || '🔗'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{link.title}</p>
                        {link.subtitle && <p className="text-sm text-gray-500 truncate">{link.subtitle}</p>}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
