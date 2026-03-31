'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  ClipboardList,
  Briefcase,
  School,
  Trophy,
  Save,
  Loader2,
  Home,
  Search,
  User,
  Tv
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  recruiting_status?: string
  offers?: string
  interested_schools?: string
  primary_position?: string
  secondary_position?: string
}

const recruitingStatuses = [
  { value: 'uncommitted', label: 'Uncommitted', color: 'gray' },
  { value: 'committed', label: 'Committed', color: 'green' },
  { value: 'signed', label: 'Signed (NLI)', color: 'blue' },
  { value: 'considering', label: 'Considering Offers', color: 'yellow' },
]

export default function RecruitingPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [recruiting, setRecruiting] = useState({
    status: '',
    committed_school: '',
    offers: '',
    interested_schools: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, recruiting_status, offers, interested_schools')
      .eq('user_id', session.user.id)
      .single()

    if (data) {
      setProfile(data)
      setRecruiting({
        status: data.recruiting_status || '',
        committed_school: '',
        offers: data.offers || '',
        interested_schools: data.interested_schools || ''
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!profile) return
    
    setSaving(true)
    await supabase
      .from('profiles')
      .update({
        recruiting_status: recruiting.status || null,
        offers: recruiting.offers || null,
        interested_schools: recruiting.interested_schools || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-babyblue-500" />
      </div>
    )
  }

  const currentStatus = recruitingStatuses.find(s => s.value === recruiting.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="w-10 h-10 rounded-xl bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Recruiting Info</h1>
              <p className="text-sm text-gray-500">Your recruitment status</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <ClipboardList className="w-4 h-4 text-babyblue-500" />
                Recruitment Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {recruitingStatuses.map(status => (
                  <button
                    key={status.value}
                    onClick={() => setRecruiting({...recruiting, status: status.value})}
                    className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                      recruiting.status === status.value
                        ? 'border-babyblue-500 bg-babyblue-50 text-babyblue-700'
                        : 'border-gray-200 hover:border-babyblue-200'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {recruiting.status === 'committed' && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <School className="w-4 h-4 text-babyblue-500" />
                  Committed To
                </label>
                <input
                  type="text"
                  value={recruiting.committed_school}
                  onChange={(e) => setRecruiting({...recruiting, committed_school: e.target.value})}
                  placeholder="University of..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                />
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 text-babyblue-500" />
                Offers
              </label>
              <textarea
                value={recruiting.offers}
                onChange={(e) => setRecruiting({...recruiting, offers: e.target.value})}
                placeholder="List schools that have offered you..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Trophy className="w-4 h-4 text-babyblue-500" />
                Interested Schools
              </label>
              <textarea
                value={recruiting.interested_schools}
                onChange={(e) => setRecruiting({...recruiting, interested_schools: e.target.value})}
                placeholder="Schools you're interested in..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-6 bg-babyblue-500 hover:bg-babyblue-600 disabled:bg-babyblue-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-babyblue-100 px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/tv" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <Tv className="w-6 h-6" />
            <span className="text-xs font-medium">TV</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium">Search</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 py-2 px-6 text-babyblue-600">
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}