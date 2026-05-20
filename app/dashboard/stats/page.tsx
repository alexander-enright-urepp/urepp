'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useNativePullToRefresh } from '@/lib/usePullToRefresh'
import { 
  ArrowLeft, 
  Plus, 
  Trophy, 
  Crown,
  Loader2,
  Pencil,
  Trash2,
  X,
  Save,
  Calendar,
  Users,
  Activity
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Home, Search, User, Tv } from 'lucide-react'

interface Profile {
  id: string
  is_premium?: boolean
}

interface StatEntry {
  id: string
  sport: string
  team_name: string
  season_year: string
  position: string
  stats: Record<string, number | string>
  created_at: string
}

const SPORTS = [
  { value: 'basketball', label: 'Basketball' },
  { value: 'football', label: 'Football' },
  { value: 'baseball', label: 'Baseball' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'track', label: 'Track & Field' },
  { value: 'volleyball', label: 'Volleyball' },
]

const SPORT_FIELDS: Record<string, { key: string; label: string; type: 'number' | 'text' }[]> = {
  basketball: [
    { key: 'games_played', label: 'Games Played', type: 'number' },
    { key: 'ppg', label: 'Points Per Game', type: 'number' },
    { key: 'rpg', label: 'Rebounds Per Game', type: 'number' },
    { key: 'apg', label: 'Assists Per Game', type: 'number' },
    { key: 'spg', label: 'Steals Per Game', type: 'number' },
    { key: 'bpg', label: 'Blocks Per Game', type: 'number' },
    { key: 'fg_pct', label: 'FG %', type: 'number' },
    { key: 'three_pt_pct', label: '3PT %', type: 'number' },
    { key: 'ft_pct', label: 'FT %', type: 'number' },
  ],
  football: [
    { key: 'games_played', label: 'Games Played', type: 'number' },
    { key: 'position', label: 'Position', type: 'text' },
    { key: 'passing_yards', label: 'Passing Yards', type: 'number' },
    { key: 'passing_tds', label: 'Passing TDs', type: 'number' },
    { key: 'rushing_yards', label: 'Rushing Yards', type: 'number' },
    { key: 'rushing_tds', label: 'Rushing TDs', type: 'number' },
    { key: 'tackles', label: 'Tackles', type: 'number' },
    { key: 'sacks', label: 'Sacks', type: 'number' },
    { key: 'interceptions', label: 'Interceptions', type: 'number' },
  ],
  baseball: [
    { key: 'games_played', label: 'Games Played', type: 'number' },
    { key: 'avg', label: 'Batting Average', type: 'number' },
    { key: 'hits', label: 'Hits', type: 'number' },
    { key: 'home_runs', label: 'Home Runs', type: 'number' },
    { key: 'rbis', label: 'RBIs', type: 'number' },
    { key: 'stolen_bases', label: 'Stolen Bases', type: 'number' },
    { key: 'era', label: 'ERA', type: 'number' },
    { key: 'strikeouts', label: 'Strikeouts', type: 'number' },
  ],
  soccer: [
    { key: 'games_played', label: 'Games Played', type: 'number' },
    { key: 'goals', label: 'Goals', type: 'number' },
    { key: 'assists', label: 'Assists', type: 'number' },
    { key: 'shots', label: 'Shots', type: 'number' },
    { key: 'shots_on_target', label: 'Shots on Target', type: 'number' },
    { key: 'minutes_played', label: 'Minutes Played', type: 'number' },
  ],
  track: [
    { key: 'event', label: 'Event', type: 'text' },
    { key: 'best_time', label: 'Best Time', type: 'text' },
    { key: 'season_best', label: 'Season Best', type: 'text' },
    { key: 'personal_record', label: 'Personal Record', type: 'text' },
    { key: 'meets', label: 'Meets', type: 'number' },
  ],
  volleyball: [
    { key: 'sets_played', label: 'Sets Played', type: 'number' },
    { key: 'kills', label: 'Kills', type: 'number' },
    { key: 'blocks', label: 'Blocks', type: 'number' },
    { key: 'aces', label: 'Aces', type: 'number' },
    { key: 'digs', label: 'Digs', type: 'number' },
    { key: 'assists', label: 'Assists', type: 'number' },
  ],
}

export default function StatsDashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<StatEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStat, setEditingStat] = useState<StatEntry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    sport: 'baseball',
    team_name: '',
    season_year: '',
    position: '',
    stats: {} as Record<string, number | string>
  })

  // Pull to refresh for iOS
  const refreshData = useCallback(async () => {
    setLoading(true)
    await loadProfileAndStats()
    setLoading(false)
  }, [])
  
  useNativePullToRefresh(refreshData)

  useEffect(() => {
    loadProfileAndStats()
  }, [])

  const loadProfileAndStats = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, is_premium')
      .eq('user_id', session.user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
    }

    const { data: statsData } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', session.user.id)
      .order('season_year', { ascending: false })

    if (statsData) {
      setStats(statsData as StatEntry[])
    }

    setLoading(false)
  }

  const handleSportChange = (sport: string) => {
    setFormData(prev => ({
      ...prev,
      sport,
      stats: {}
    }))
  }

  const handleStatChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [key]: value
      }
    }))
  }

  const openAddModal = () => {
    setEditingStat(null)
    setFormData({
      sport: 'baseball',
      team_name: '',
      season_year: '',
      position: '',
      stats: {}
    })
    setShowModal(true)
  }

  const openEditModal = (stat: StatEntry) => {
    setEditingStat(stat)
    setFormData({
      sport: stat.sport,
      team_name: stat.team_name,
      season_year: stat.season_year,
      position: stat.position || '',
      stats: stat.stats || {}
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const payload = {
      user_id: session.user.id,
      sport: formData.sport,
      team_name: formData.team_name,
      season_year: formData.season_year,
      position: formData.position || null,
      stats: formData.stats
    }

    if (editingStat) {
      await supabase
        .from('player_stats')
        .update(payload)
        .eq('id', editingStat.id)
    } else {
      await supabase
        .from('player_stats')
        .insert(payload)
    }

    setShowModal(false)
    loadProfileAndStats()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await supabase.from('player_stats').delete().eq('id', id)
    setDeletingId(null)
    loadProfileAndStats()
  }

  const getSportLabel = (sport: string) => {
    return SPORTS.find(s => s.value === sport)?.label || sport
  }

  const getSportIcon = (sport: string) => {
    const icons: Record<string, string> = {
      basketball: '🏀',
      football: '🏈',
      baseball: '⚾',
      soccer: '⚽',
      track: '🏃',
      volleyball: '🏐',
    }
    return icons[sport] || '🏆'
  }

  const getFilteredStats = (sport: string, stats: Record<string, number | string>) => {
    const fields = SPORT_FIELDS[sport] || []
    return fields
      .filter(field => stats[field.key] !== undefined && stats[field.key] !== '')
      .map(field => ({
        label: field.label,
        value: stats[field.key]
      }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-babyblue-500" />
      </div>
    )
  }

  const isPremium = profile?.is_premium

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      {/* Header */}
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
              <h1 className="text-xl font-bold text-gray-900">Stats</h1>
              <p className="text-sm text-gray-500">Manage your performance</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Premium CTA for free users */}
        {!isPremium && (
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 fill-current" />
              <span className="font-bold">Premium Feature</span>
            </div>
            <p className="text-sm text-yellow-100 mb-4">
              Upgrade to Premium to add unlimited stat entries and showcase your performance across multiple seasons and sports.
            </p>
            <Link 
              href="/dashboard/subscription"
              className="inline-flex items-center gap-2 bg-white text-yellow-600 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Premium
            </Link>
          </div>
        )}

        {/* Add Stats Button - Premium Only */}
        {isPremium && (
          <button
            onClick={openAddModal}
            className="w-full bg-babyblue-500 hover:bg-babyblue-600 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-babyblue-200"
          >
            <Plus className="w-5 h-5" />
            Add Stats
          </button>
        )}

        {/* Stats List */}
        <div className="space-y-4">
          {stats.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-babyblue-100 p-8 text-center">
              <Trophy className="w-12 h-12 text-babyblue-200 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No Stats Yet</h3>
              <p className="text-sm text-gray-500">
                {isPremium 
                  ? "Add your first stat entry to showcase your performance."
                  : "Upgrade to Premium to add and display your stats."
                }
              </p>
            </div>
          ) : (
            stats.map((stat) => (
              <div 
                key={stat.id}
                className="bg-white rounded-2xl shadow-sm border border-babyblue-100 overflow-hidden"
              >
                {/* Card Header */}
                <div className="px-5 py-4 border-b border-babyblue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getSportIcon(stat.sport)}</span>
                      <div>
                        <h3 className="font-bold text-gray-900">{stat.team_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{stat.season_year}</span>
                          <span>•</span>
                          <span>{getSportLabel(stat.sport)}</span>
                          {stat.position && (
                            <>
                              <span>•</span>
                              <span>{stat.position}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions - Premium Only */}
                    {isPremium && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(stat)}
                          className="w-9 h-9 rounded-lg hover:bg-babyblue-50 flex items-center justify-center text-gray-400 hover:text-babyblue-600 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(stat.id)}
                          disabled={deletingId === stat.id}
                          className="w-9 h-9 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {deletingId === stat.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3">
                    {getFilteredStats(stat.sport, stat.stats).slice(0, 6).map((field, idx) => (
                      <div key={idx} className="text-center p-3 bg-babyblue-50 rounded-xl">
                        <p className="text-xl font-bold text-babyblue-700 truncate">{field.value}</p>
                        <p className="text-xs text-babyblue-600 uppercase tracking-wide mt-1 truncate">{field.label}</p>
                      </div>
                    ))}
                  </div>
                  {getFilteredStats(stat.sport, stat.stats).length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No stats recorded</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-babyblue-100 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingStat ? 'Edit Stats' : 'Add Stats'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Sport Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Activity className="w-4 h-4 text-babyblue-500" />
                  Sport
                </label>
                <select
                  value={formData.sport}
                  onChange={(e) => handleSportChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-200 outline-none"
                >
                  {SPORTS.map(sport => (
                    <option key={sport.value} value={sport.value}>{sport.label}</option>
                  ))}
                </select>
              </div>

              {/* Team Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 text-babyblue-500" />
                  Team Name
                </label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, team_name: e.target.value }))}
                  placeholder="e.g., Lincoln High School"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-200 outline-none"
                />
              </div>

              {/* Season Year */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-babyblue-500" />
                  Season Year
                </label>
                <input
                  type="text"
                  value={formData.season_year}
                  onChange={(e) => setFormData(prev => ({ ...prev, season_year: e.target.value }))}
                  placeholder="e.g., 2024-25"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-200 outline-none"
                />
              </div>

              {/* Position */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Trophy className="w-4 h-4 text-babyblue-500" />
                  Position (Optional)
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="e.g., Point Guard, Quarterback"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-200 outline-none"
                />
              </div>

              {/* Dynamic Stat Fields */}
              <div className="border-t border-gray-100 pt-5">
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Performance Stats
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(SPORT_FIELDS[formData.sport] || []).map((field) => (
                    <div key={field.key}>
                      <label className="text-xs text-gray-500 mb-1 block">{field.label}</label>
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        step={field.type === 'number' ? 'any' : undefined}
                        value={formData.stats[field.key] || ''}
                        onChange={(e) => handleStatChange(field.key, e.target.value)}
                        placeholder="—"
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-200 outline-none text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-babyblue-100 px-5 py-4">
              <button
                onClick={handleSave}
                disabled={!formData.team_name || !formData.season_year}
                className="w-full bg-babyblue-500 hover:bg-babyblue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {editingStat ? 'Save Changes' : 'Add Stats'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-babyblue-100 px-4 py-2 z-40">
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
