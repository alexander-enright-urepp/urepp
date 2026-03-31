'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Team { id: string; name: string; position: string; years: string }

export default function TeamsPage() {
  const router = useRouter()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', position: '', years: '' })

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/login'); return }
    const { data } = await supabase.from('profiles').select('id, teams_played_for').eq('user_id', session.user.id).single()
    if (data) {
      setProfileId(data.id)
      if (data.teams_played_for) { try { setTeams(JSON.parse(data.teams_played_for)) } catch { setTeams([]) } }
    }
    setLoading(false)
  }

  const addTeam = () => { if (!newTeam.name) return; setTeams([...teams, { ...newTeam, id: Date.now().toString() }]); setNewTeam({ name: '', position: '', years: '' }) }
  const removeTeam = (id: string) => setTeams(teams.filter(t => t.id !== id))

  const handleSave = async () => {
    if (!profileId) return
    setSaving(true)
    await supabase.from('profiles').update({ teams_played_for: JSON.stringify(teams), updated_at: new Date().toISOString() }).eq('id', profileId)
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-babyblue-50 flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></Link>
            <div><h1 className="text-xl font-bold">Teams</h1><p className="text-sm text-gray-500">Team history</p></div>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <input value={newTeam.name} onChange={(e) => setNewTeam({...newTeam, name: e.target.value})} placeholder="Team name" className="px-3 py-2 rounded-xl border text-sm" />
            <input value={newTeam.position} onChange={(e) => setNewTeam({...newTeam, position: e.target.value})} placeholder="Position" className="px-3 py-2 rounded-xl border text-sm" />
            <input value={newTeam.years} onChange={(e) => setNewTeam({...newTeam, years: e.target.value})} placeholder="Years" className="px-3 py-2 rounded-xl border text-sm" />
          </div>
          <button onClick={addTeam} disabled={!newTeam.name} className="w-full mb-4 py-2 bg-babyblue-100 text-babyblue-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Plus className="w-4 h-4" />Add Team</button>
          <div className="space-y-2">
            {teams.length === 0 ? <p className="text-center text-gray-400 text-sm py-4">No teams added</p> : teams.map(team => (
              <div key={team.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <div className="flex-1"><p className="font-medium">{team.name}</p><p className="text-sm text-gray-500">{team.position} - {team.years}</p></div>
                <button onClick={() => removeTeam(team.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} className="w-full mt-6 bg-babyblue-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">{saving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : <><Save className="w-5 h-5" />Save Changes</>}</button>
        </div>
      </main>
    </div>
  )
}