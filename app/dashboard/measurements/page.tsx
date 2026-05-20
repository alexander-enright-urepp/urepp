'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Ruler,
  Scale,
  Activity,
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

export default function MeasurementsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    forty_yard_dash: '',
    wingspan: '',
    vertical_jump: '',
    broad_jump: '',
    bench_press: '',
    squat: '',
    shuttle_run: ''
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
      .select('id, height, weight, forty_yard_dash, wingspan, vertical_jump, broad_jump, bench_press, squat, shuttle_run')
      .eq('user_id', session.user.id)
      .single()

    if (data) {
      setProfile(data)
      setMeasurements({
        height: data.height || '',
        weight: data.weight || '',
        forty_yard_dash: data.forty_yard_dash || '',
        wingspan: data.wingspan || '',
        vertical_jump: data.vertical_jump || '',
        broad_jump: data.broad_jump || '',
        bench_press: data.bench_press || '',
        squat: data.squat || '',
        shuttle_run: data.shuttle_run || ''
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
        height: measurements.height || null,
        weight: measurements.weight || null,
        forty_yard_dash: measurements.forty_yard_dash || null,
        wingspan: measurements.wingspan || null,
        vertical_jump: measurements.vertical_jump || null,
        broad_jump: measurements.broad_jump || null,
        bench_press: measurements.bench_press || null,
        squat: measurements.squat || null,
        shuttle_run: measurements.shuttle_run || null,
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
              <h1 className="text-xl font-bold text-gray-900">Measurements</h1>
              <p className="text-sm text-gray-500">Physical stats and metrics</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Ruler className="w-4 h-4 text-babyblue-500" />
                Height
              </label>
              <input
                type="text"
                value={measurements.height}
                onChange={(e) => setMeasurements({...measurements, height: e.target.value})}
                placeholder={"6'1"}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Scale className="w-4 h-4 text-babyblue-500" />
                Weight (lbs)
              </label>
              <input
                type="text"
                value={measurements.weight}
                onChange={(e) => setMeasurements({...measurements, weight: e.target.value})}
                placeholder="185"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Athletic Metrics */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-babyblue-500" />
              Athletic Measurements
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  40 Yard Dash (sec)
                </label>
                <input
                  type="text"
                  value={measurements.forty_yard_dash}
                  onChange={(e) => setMeasurements({...measurements, forty_yard_dash: e.target.value})}
                  placeholder="4.5"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wingspan
                </label>
                <input
                  type="text"
                  value={measurements.wingspan}
                  onChange={(e) => setMeasurements({...measurements, wingspan: e.target.value})}
                  placeholder={"6'5"}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vertical Jump (in)
                </label>
                <input
                  type="text"
                  value={measurements.vertical_jump}
                  onChange={(e) => setMeasurements({...measurements, vertical_jump: e.target.value})}
                  placeholder="32"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Broad Jump (ft/in)
                </label>
                <input
                  type="text"
                  value={measurements.broad_jump}
                  onChange={(e) => setMeasurements({...measurements, broad_jump: e.target.value})}
                  placeholder={"9'10"}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bench Press (lbs)
                </label>
                <input
                  type="text"
                  value={measurements.bench_press}
                  onChange={(e) => setMeasurements({...measurements, bench_press: e.target.value})}
                  placeholder="225"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Squat (lbs)
                </label>
                <input
                  type="text"
                  value={measurements.squat}
                  onChange={(e) => setMeasurements({...measurements, squat: e.target.value})}
                  placeholder="315"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shuttle Run (sec)
                </label>
                <input
                  type="text"
                  value={measurements.shuttle_run}
                  onChange={(e) => setMeasurements({...measurements, shuttle_run: e.target.value})}
                  placeholder="4.2"
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
