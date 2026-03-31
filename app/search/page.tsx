'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, 
  ArrowLeft, 
  User, 
  Home,
  User as UserIcon,
  Filter,
  MapPin,
  Calendar,
  Loader2,
  ChevronRight,
  Tv
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  first_name: string
  last_name: string
  username: string
  profile_picture_url: string | null
  grad_year: number | null
  position: string | null
  high_school: string | null
  hometown: string | null
  state: string | null
  sport?: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    gradYear: '',
    position: '',
    state: '',
  })

  const gradYears = [2025, 2026, 2027, 2028, 2029]
  const states = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    
    setProfiles(data || [])
    setLoading(false)
  }

  const handleSearch = async () => {
    setLoading(true)
    let queryBuilder = supabase.from('profiles').select('*')
    
    if (query.trim()) {
      queryBuilder = queryBuilder.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,username.ilike.%${query}%`
      )
    }
    
    if (filters.gradYear) {
      queryBuilder = queryBuilder.eq('grad_year', parseInt(filters.gradYear))
    }
    if (filters.state) {
      queryBuilder = queryBuilder.eq('state', filters.state)
    }
    
    const { data } = await queryBuilder.limit(20)
    setProfiles(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/" 
                className="w-10 h-10 rounded-xl bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Search</h1>
                <p className="text-sm text-gray-500">Find athletes</p>
              </div>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                showFilters ? 'bg-babyblue-100 text-babyblue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4">
        {/* Search Input */}
        <div className="relative mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name or username..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <button 
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-babyblue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
          >
            Go
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-babyblue-100 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Grad Year</label>
                <select
                  value={filters.gradYear}
                  onChange={(e) => setFilters(f => ({ ...f, gradYear: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-babyblue-400 outline-none text-sm"
                >
                  <option value="">Any</option>
                  {gradYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">State</label>
                <select
                  value={filters.state}
                  onChange={(e) => setFilters(f => ({ ...f, state: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-babyblue-400 outline-none text-sm"
                >
                  <option value="">Any</option>
                  {states.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <button 
              onClick={handleSearch}
              className="w-full mt-3 bg-babyblue-500 text-white py-2 rounded-xl text-sm font-medium"
            >
              Apply Filters
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">
            {loading ? 'Searching...' : `${profiles.length} athletes found`}
          </p>
          {(filters.gradYear || filters.state) && (
            <button 
              onClick={() => { setFilters({ gradYear: '', position: '', state: '' }); handleSearch(); }}
              className="text-xs text-babyblue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-babyblue-500" />
            </div>
          ) : (
            profiles.map(profile => (
              <ProfileCard key={profile.id} profile={profile} />
            ))
          )}
          
          {!loading && profiles.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto mb-3 text-babyblue-200" />
              <p className="text-gray-500 mb-1">No profiles found</p>
              <p className="text-sm text-gray-400">Try adjusting your search</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
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
          <Link href="/search" className="flex flex-col items-center gap-0.5 py-2 px-6 text-babyblue-600">
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium">Search</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <UserIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Link 
      href={`/players/${profile.username}`}
      className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-babyblue-100 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Avatar */}
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-babyblue-100 to-babyblue-200 flex items-center justify-center text-babyblue-600 font-bold text-lg flex-shrink-0 overflow-hidden">
        {profile.profile_picture_url ? (
          <img src={profile.profile_picture_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <span>{profile.first_name?.[0]}{profile.last_name?.[0]}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {profile.first_name} {profile.last_name}
        </h3>
        <p className="text-sm text-babyblue-500">@{profile.username}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          {profile.grad_year && (
            <span className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              Class of {profile.grad_year}
            </span>
          )}
          {(profile.high_school_sports?.[0] || profile.position) && (
            <span className="bg-babyblue-50 text-babyblue-600 px-1.5 py-0.5 rounded">
              {profile.high_school_sports?.[0] || profile.position}
            </span>
          )}
          {profile.state && (
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              {profile.state}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
    </Link>
  )
}
