'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Filter, Loader2, User } from 'lucide-react'
import Link from 'next/link'

interface Profile {
  id: string
  first_name: string
  last_name: string
  grad_year: number
  position: string
  high_school: string
  hometown: string
  state: string
  slug: string
}

export default function ProfileSearch() {
  const [query, setQuery] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    gradYear: '',
    position: '',
    state: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const positions = [
    'RHP', 'LHP', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'OF', 'UTIL'
  ]

  const currentYear = new Date().getFullYear()
  const gradYears = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4]

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]

  useEffect(() => {
    searchProfiles()
  }, [])

  const searchProfiles = async () => {
    setLoading(true)
    try {
      let supabaseQuery = supabase
        .from('profiles')
        .select('id, first_name, last_name, grad_year, position, high_school, hometown, state, slug')
        .order('created_at', { ascending: false })

      // Full-text search on name
      if (query.trim()) {
        supabaseQuery = supabaseQuery.or(
          `first_name.ilike.%${query}%,last_name.ilike.%${query}%`
        )
      }

      // Apply filters
      if (filters.gradYear) {
        supabaseQuery = supabaseQuery.eq('grad_year', parseInt(filters.gradYear))
      }
      if (filters.position) {
        supabaseQuery = supabaseQuery.eq('position', filters.position)
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
    setFilters({ gradYear: '', position: '', state: '' })
    setQuery('')
    searchProfiles()
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
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border rounded-lg font-medium flex items-center gap-2 transition-colors ${
              showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Search
          </button>
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Graduation Year
              </label>
              <select
                value={filters.gradYear}
                onChange={(e) => setFilters({ ...filters, gradYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Year</option>
                {gradYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Position</option>
                {positions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any State</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
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
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : profiles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <Link
              key={profile.id}
              href={`/profile/${profile.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {profile.first_name[0]}{profile.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {profile.first_name} {profile.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {profile.position} • Class of {profile.grad_year}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {profile.high_school}
                  </p>
                  <p className="text-xs text-gray-400">
                    {profile.hometown}, {profile.state}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No profiles found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
