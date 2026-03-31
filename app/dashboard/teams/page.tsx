'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Users,
  Plus,
  Trash2,
  Save,
  Loader2,
  Home,
  Search,
  User,
  Tv
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Team {
  id: string
  name: string
  position: string
  years: string
}

interface Profile {
  id: string
  teams_played_for?: string
}

export default function TeamsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [newTeam, setNewTeam] = useState({ name: '', position: '', years: '' })

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
      .select('id, teams_played_for')
      .eq('user_id', session.user.id)
      .single()

    if (data) {
      setProfile(data)
      if (data.teams_played_for) {
        try {
          const parsed = JSON.parse(data.teams_played_for)
          setTeams(Array.isArray(parsed) ? parsed : [])
        } catch {
          setTeams([])
        }
      }
    }
    setLoading(false)
  }

  const addTeam = () => {
    if (!newTeam.name) return
    setTeams([...teams, { ...newTeam, id: Date.now().toString() }])
    setNewTeam({ name: '', position: '', years: '' })
  }

  const removeTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id))
  }

  const handleSave = async () => {
    if (!profile) return
    
    setSaving(true)
    await supabase
      .from('profiles')
      .update({
        teams_played_for: JSON.stringify(teams),
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
              <h1 className="text-xl font-bold text-gray-900">Teams</h1>
              <p className="text-sm text-gray-500">Manage your team history</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={newTeam.name}
                onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                placeholder="Team name"
                className="px-3 py-2 rounded-xl border border-gray-200 focus:border-babyblue-400 outline-none text-sm"
              />
              <input
                type="text"
                value={newTeam.position}
                onChange={(e) => setNewTeam({...newTeam, position: e.target.value})}
                placeholder="Position"
                className="px-3 py-2 rounded-xl border border-gray-200 focus:border-babyblue-400 outline-none text-sm"
              />
              <input
                type="text"
                value={newTeam.years}
                onChange={(e) => setNewTeam({...newTeam, years: e.target.value})}
                placeholder="Years (2022-24)"
                className="px-3 py-2 rounded-xl border border-gray-200 focus:border-babyblue-400 outline-none text-sm"
              />
            </div>
            <button
              onClick={addTeam}
              disabled={!newTeam.name}
              className="w-full py-2 bg-babyblue-100 hover:bg-babyblue-200 text-babyblue-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Team
            </button>
          </div>

          <div className="space-y-2">
            {teams.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">No teams added yet</p>
            ) : (
              teams.map(team => (
                <div key={team.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{team.name}</p>
                    <p className="text-sm text-gray-500">{team.position} • {team.years}</p>
                  </div>
                  <button
                    onClick={() => removeTeam(team.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
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
