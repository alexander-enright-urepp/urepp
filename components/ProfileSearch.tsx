'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SPORT_OPTIONS, getSportConfig, Sport, isValidSport } from '@/lib/sports'
import { Search, Filter, Loader2, User } from 'lucide-react'
import Link from 'next/link'

interface Profile {
  id: string
  first_name: string
  last_name: string
  username: string
  profile_picture_url: string | null
  sport: string
  grad_year: number
  primary_position: string
  city: string
  state: string
}

export default function ProfileSearch() {
  const [query, setQuery] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    sport: '',
    gradYear: '',
    position: '',
    state: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null)

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]

  const currentYear = new Date().getFullYear()
  const gradYears = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4]

  const sportConfig = selectedSport ? getSportConfig(selectedSport) : null

  useEffect(() => {
    searchProfiles()
  }, [])

  // Update positions when sport changes
  useEffect(() => {
    if (filters.sport) {
      setSelectedSport(filters.sport as Sport)
    } else {
      setSelectedSport(null)
    }
  }, [filters.sport])

  const searchProfiles = async () => {
    setLoading(true)
    try {
      let supabaseQuery = supabase
        .from('profiles')
        .select('id, first_name, last_name, username, profile_picture_url, sport, grad_year, primary_position, city, state')
        .order('created_at', { ascending: false })

      // Search by name or username
      if (query.trim()) {
        supabaseQuery = supabaseQuery.or(
          `first_name.ilike.%${query}%,last_name.ilike.%${query}%,username.ilike.%${query}%`
        )
      }

      // Apply filters
      if (filters.sport) {
        supabaseQuery = supabaseQuery.eq('sport', filters.sport)
      }
      if (filters.gradYear) {
        supabaseQuery = supabaseQuery.eq('grad_year', parseInt(filters.gradYear))
      }
      if (filters.position) {
        supabaseQuery = supabaseQuery.or(`primary_position.eq.${filters.position},secondary_position.eq.${filters.position}`)
      }
      if (filters.state) {
        supabaseQuery = supabaseQuery.eq('state', filters.state)
      }

      const { data, error } = await supabaseQuery.limit(50)

      if (error) throw error
      setProfiles(data || [])
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchProfiles()
  }

  const clearFilters = () => {
    setFilters({
      sport: '',
      gradYear: '',
      position: '',
      state: '',
    })
    setSelectedSport(null)
    setQuery('')
    searchProfiles()
  }

  const getSportDisplayName = (sport: string) => {
    const option = SPORT_OPTIONS.find(s => s.value === sport)
    return option?.label || sport
  }

  return (
    <div className="w-full">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or username..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border rounded-xl font-medium flex items-center gap-2 transition-colors ${
              showFilters
                ? 'bg-babyblue-50 border-babyblue-300 text-babyblue-700'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
          <button
            type="submit"
            className="bg-babyblue-500 hover:bg-babyblue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-md shadow-babyblue-200"
          >
            Search
          </button>
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white/80 backdrop-blur-sm border border-babyblue-200 rounded-xl p-4 mb-6 shadow-lg shadow-babyblue-100">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sport
              </label>
              <select
                value={filters.sport}
                onChange={(e) => setFilters({ ...filters, sport: e.target.value, position: '' })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
              >
                <option value="">Any Sport</option>
                {SPORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Graduation Year
              </label>
              <select
                value={filters.gradYear}
                onChange={(e) => setFilters({ ...filters, gradYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
              >
                <option value="">Any Year</option>
                {gradYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                value={filters.position}
                onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
              >
                <option value="">Any Position</option>
                {sportConfig?.positions.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                )) || SPORT_OPTIONS[0].value === 'baseball' && getSportConfig('baseball').positions.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
              >
                <option value="">Any State</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-babyblue-600 animate-spin" />
        </div>
      ) : profiles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <Link
              key={profile.id}
              href={`/players/${profile.username}`}
              className="bg-white/80 backdrop-blur-sm border border-babyblue-100 rounded-xl p-4 hover:border-babyblue-300 hover:shadow-lg hover:shadow-babyblue-100 transition-all"
            >
              <div className="flex items-start gap-3">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-babyblue-100 rounded-full flex items-center justify-center text-babyblue-600 font-bold">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {profile.first_name} {profile.last_name}
                    </h3>
                    <span className="text-xs bg-babyblue-100 text-babyblue-700 px-2 py-0.5 rounded-full">
                      {getSportDisplayName(profile.sport)}
                    </span>
                  </div>
                  <p className="text-sm text-babyblue-600">
                    @{profile.username}
                  </p>
                  <p className="text-sm text-gray-500">
                    {profile.primary_position} • Class of {profile.grad_year}
                  </p>
                  <p className="text-xs text-gray-400">
                    {profile.city}{profile.city && profile.state && ', '}{profile.state}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/50 rounded-2xl border border-babyblue-100">
          <User className="w-12 h-12 text-babyblue-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No athletes found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}