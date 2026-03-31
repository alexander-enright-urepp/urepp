'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  GraduationCap,
  BookOpen,
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
  high_school?: string
  gpa?: string
  sat_score?: string
  act_score?: string
  grad_year?: number
}

export default function AcademicsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [academics, setAcademics] = useState({
    high_school: '',
    gpa: '',
    sat_score: '',
    act_score: '',
    grad_year: ''
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
      .select('id, high_school, gpa, sat_score, act_score, grad_year')
      .eq('user_id', session.user.id)
      .single()

    if (data) {
      setProfile(data)
      setAcademics({
        high_school: data.high_school || '',
        gpa: data.gpa || '',
        sat_score: data.sat_score || '',
        act_score: data.act_score || '',
        grad_year: data.grad_year?.toString() || ''
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
        high_school: academics.high_school || null,
        gpa: academics.gpa || null,
        sat_score: academics.sat_score || null,
        act_score: academics.act_score || null,
        grad_year: academics.grad_year ? parseInt(academics.grad_year) : null,
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

  const currentYear = new Date().getFullYear()
  const gradYears = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4]

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
              <h1 className="text-xl font-bold text-gray-900">Academics</h1>
              <p className="text-sm text-gray-500">Your academic information</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 text-babyblue-500" />
                High School
              </label>
              <input
                type="text"
                value={academics.high_school}
                onChange={(e) => setAcademics({...academics, high_school: e.target.value})}
                placeholder="Lincoln High School"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
                <select
                  value={academics.grad_year}
                  onChange={(e) => setAcademics({...academics, grad_year: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                >
                  <option value="">Select Year</option>
                  {gradYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPA</label>
                <input
                  type="text"
                  value={academics.gpa}
                  onChange={(e) => setAcademics({...academics, gpa: e.target.value})}
                  placeholder="3.8"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SAT Score</label>
                <input
                  type="text"
                  value={academics.sat_score}
                  onChange={(e) => setAcademics({...academics, sat_score: e.target.value})}
                  placeholder="1400"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ACT Score</label>
                <input
                  type="text"
                  value={academics.act_score}
                  onChange={(e) => setAcademics({...academics, act_score: e.target.value})}
                  placeholder="30"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                />
              </div>
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
