'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Ruler, Scale, Activity, Save, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  height?: string
  weight?: string
  exit_velocity?: number
  pitch_velocity?: number
  sixty_time?: number
}

export default function MeasurementsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [measurements, setMeasurements] = useState({ height: '', weight: '', exit_velocity: '', pitch_velocity: '', sixty_time: '' })

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    const { data } = await supabase.from('profiles').select('id, height, weight, exit_velocity, pitch_velocity, sixty_time').eq('user_id', session.user.id).single()
    if (data) {
      setProfile(data)
      setMeasurements({ height: data.height || '', weight: data.weight || '', exit_velocity: data.exit_velocity?.toString() || '', pitch_velocity: data.pitch_velocity?.toString() || '', sixty_time: data.sixty_time?.toString() || '' })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({ height: measurements.height || null, weight: measurements.weight || null, exit_velocity: measurements.exit_velocity ? parseInt(measurements.exit_velocity) : null, pitch_velocity: measurements.pitch_velocity ? parseInt(measurements.pitch_velocity) : null, sixty_time: measurements.sixty_time ? parseFloat(measurements.sixty_time) : null, updated_at: new Date().toISOString() }).eq('id', profile.id)
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-babyblue-50 flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></Link>
            <div><h1 className="text-xl font-bold">Measurements</h1><p className="text-sm text-gray-500">Physical stats and metrics</p></div>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="flex items-center gap-2 text-sm font-medium mb-2"><Ruler className="w-4 h-4 text-babyblue-500" />Height</label><input type="text" value={measurements.height} onChange={(e) => setMeasurements({...measurements, height: e.target.value})} placeholder="6'1" className="w-full px-4 py-3 rounded-xl border" /></div>
            <div><label className="flex items-center gap-2 text-sm font-medium mb-2"><Scale className="w-4 h-4 text-babyblue-500" />Weight (lbs)</label><input type="text" value={measurements.weight} onChange={(e) => setMeasurements({...measurements, weight: e.target.value})} placeholder="185" className="w-full px-4 py-3 rounded-xl border" /></div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-babyblue-500" />Baseball Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-2">Exit Velocity (mph)</label><input type="number" value={measurements.exit_velocity} onChange={(e) => setMeasurements({...measurements, exit_velocity: e.target.value})} placeholder="95" className="w-full px-4 py-3 rounded-xl border" /></div>
              <div><label className="block text-sm font-medium mb-2">Pitch Velocity (mph)</label><input type="number" value={measurements.pitch_velocity} onChange={(e) => setMeasurements({...measurements, pitch_velocity: e.target.value})} placeholder="88" className="w-full px-4 py-3 rounded-xl border" /></div>
              <div><label className="block text-sm font-medium mb-2">60 Yard Dash (sec)</label><input type="number" step="0.01" value={measurements.sixty_time} onChange={(e) => setMeasurements({...measurements, sixty_time: e.target.value})} placeholder="6.8" className="w-full px-4 py-3 rounded-xl border" /></div>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="w-full mt-6 bg-babyblue-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">{saving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : <><Save className="w-5 h-5" />Save Changes</>}</button>
        </div>
      </main>
    </div>
  )
}