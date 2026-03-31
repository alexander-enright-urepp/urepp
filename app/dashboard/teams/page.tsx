'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  X,
  Home,
  Search,
  User,
  Tv,
  Trophy
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface TeamItem {
  id: string
  profile_id: string
  team_name: string
  sport: string
  position: string
  year_played: string
  city?: string
  state?: string
}

const sports = [
  'Baseball',
  'Basketball',
  'Football',
  'Soccer',
  'Hockey',
  'Lacrosse',
  'Volleyball',
  'Track & Field',
  'Swimming',
  'Tennis',
  'Golf',
  'Wrestling',
  'Other'
]

const positions = [
  'RHP', 'LHP', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'OF', 'UTIL',
  'Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center',
  'Quarterback', 'Running Back', 'Wide Receiver', 'Tight End', 'Offensive Line', 'Defensive Line', 'Linebacker', 'Defensive Back',
  'Goalkeeper', 'Defender', 'Midfielder', 'Forward',
  'Other'
]

export default function TeamsPage() {
  const router = useRouter()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [teams, setTeams] = useState<TeamItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState<TeamItem | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    team_name: '',
    sport: '',
    position: '',
    year_played: '',
    city: '',
    state: ''
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

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (profile) {
      setProfileId(profile.id)
      // Load teams from profile_teams table
      const { data: teamsData } = await supabase
        .from('profile_teams')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: true })

      if (teamsData) {
        setTeams(teamsData)
      }
    }
    setLoading(false)
  }

  const addTeam = async () => {
    if (!formData.team_name || !formData.sport || !profileId) return

    const { data, error } = await supabase
      .from('profile_teams')
      .insert({
        profile_id: profileId,
        team_name: formData.team_name,
        sport: formData.sport,
        position: formData.position || null,
        year_played: formData.year_played || null,
        city: formData.city || null,
        state: formData.state || null
      })
      .select()
      .single()

    if (data && !error) {
      setTeams([...teams, data])
    }

    // Reset form
    setFormData({ team_name: '', sport: '', position: '', year_played: '', city: '', state: '' })
    setShowAddModal(false)
  }

  const updateTeam = async () => {
    if (!editingTeam) return

    const { error } = await supabase
      .from('profile_teams')
      .update({
        team_name: formData.team_name,
        sport: formData.sport,
        position: formData.position || null,
        year_played: formData.year_played || null,
        city: formData.city || null,
        state: formData.state || null
      })
      .eq('id', editingTeam.id)

    if (!error) {
      const updatedTeams = teams.map(team =>
        team.id === editingTeam.id
          ? { ...team, ...formData }
          : team
      )
      setTeams(updatedTeams)
    }

    setEditingTeam(null)
    setFormData({ team_name: '', sport: '', position: '', year_played: '', city: '', state: '' })
    setShowAddModal(false)
  }

  const deleteTeam = async (id: string) => {
    const { error } = await supabase
      .from('profile_teams')
      .delete()
      .eq('id', id)

    if (!error) {
      setTeams(teams.filter(team => team.id !== id))
    }
  }

  const openEditModal = (team: TeamItem) => {
    setEditingTeam(team)
    setFormData({
      team_name: team.team_name,
      sport: team.sport,
      position: team.position || '',
      year_played: team.year_played || '',
      city: team.city || '',
      state: team.state || ''
    })
    setShowAddModal(true)
  }

  const openAddModal = () => {
    setEditingTeam(null)
    setFormData({ team_name: '', sport: '', position: '', year_played: '', city: '', state: '' })
    setShowAddModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-babyblue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-lg font-bold text-gray-900">Teams</h1>
            </div>
            <button
              onClick={openAddModal}
              className="w-10 h-10 bg-babyblue-500 hover:bg-babyblue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-3">
        {/* Add Team Button (Dashed) */}
        <button
          onClick={openAddModal}
          className="w-full py-6 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:border-babyblue-400 hover:text-babyblue-500 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Team</span>
        </button>

        {/* Teams List */}
        <div className="space-y-3">
          {teams.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No teams yet. Add your first team!</p>
          ) : (
            teams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                {/* Header with drag and actions */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-300 cursor-grab">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-babyblue-100 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-babyblue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{team.team_name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(team)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteTeam(team.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Team Details */}
                <div className="grid grid-cols-2 gap-3 ml-8">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Sport</p>
                    <p className="font-medium text-gray-900 text-sm">{team.sport}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Position</p>
                    <p className="font-medium text-gray-900 text-sm">{team.position || '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Years</p>
                    <p className="font-medium text-gray-900 text-sm">{team.year_played || '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {team.city && team.state ? `${team.city}, ${team.state}` : team.city || team.state || '-'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTeam ? 'Edit Team' : 'Add Team'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingTeam(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Team Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.team_name}
                onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                placeholder="e.g., Lincoln High School"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
              />
            </div>

            {/* Sport */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sport <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value, position: '' })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
              >
                <option value="">Select Sport</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
              >
                <option value="">Select Position</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            {/* Year Played */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Played
              </label>
              <input
                type="text"
                value={formData.year_played}
                onChange={(e) => setFormData({ ...formData, year_played: e.target.value })}
                placeholder="e.g., 2022-2024"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g., Los Angeles"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
              >
                <option value="">Select State</option>
                {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingTeam(null)
                }}
                className="py-3 px-6 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingTeam ? updateTeam : addTeam}
                disabled={!formData.team_name || !formData.sport}
                className="py-3 px-6 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {editingTeam ? 'Save Changes' : 'Add Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
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
