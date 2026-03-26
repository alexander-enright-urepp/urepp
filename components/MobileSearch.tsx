"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Search, MapPin, GraduationCap, Filter } from "lucide-react"

interface Profile {
  id: string
  first_name: string
  last_name: string
  username: string
  profile_picture_url: string | null
  primary_position: string
  grad_year: number
  high_school: string
  city: string
  state: string
}

export function MobileSearch({ onBack }: { onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [positionFilter, setPositionFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")

  const positions = [
    "All Positions", "Pitcher", "Catcher", "First Base", "Second Base", 
    "Third Base", "Shortstop", "Left Field", "Center Field", "Right Field"
  ]

  const currentYear = new Date().getFullYear()
  const gradYears = ["All Years", ...Array.from({ length: 8 }, (_, i) => (currentYear + i).toString())]

  useEffect(() => {
    searchProfiles()
  }, [searchQuery, positionFilter, yearFilter])

  async function searchProfiles() {
    setLoading(true)
    
    try {
      let query = supabase
        .from("profiles")
        .select("*")
        .limit(50)

      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,high_school.ilike.%${searchQuery}%`)
      }

      if (positionFilter && positionFilter !== "All Positions") {
        query = query.eq("primary_position", positionFilter)
      }

      if (yearFilter && yearFilter !== "All Years") {
        query = query.eq("grad_year", parseInt(yearFilter))
      }

      const { data, error } = await query

      if (error) throw error
      setProfiles(data || [])
    } catch (err) {
      console.error("Search error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-babyblue-200/50 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Search Players</h1>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
          >
            {positions.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
          
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
          >
            {gradYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-babyblue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No players found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-3">{profiles.length} players found</p>
            {profiles.map(profile => (
              <div
                key={profile.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-babyblue-100 p-4"
              >
                <div className="flex items-center gap-3">
                  {profile.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={`${profile.first_name} ${profile.last_name}`}
                      className="w-14 h-14 rounded-full object-cover border-2 border-babyblue-100"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-babyblue-100 rounded-full flex items-center justify-center text-babyblue-600 font-bold">
                      {profile.first_name[0]}{profile.last_name[0]}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {profile.first_name} {profile.last_name}
                    </h3>
                    <p className="text-sm text-babyblue-600">@{profile.username}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{profile.primary_position}</span>
                      <span>•</span>
                      <span>Class of {profile.grad_year}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <MapPin size={12} />
                      <span className="truncate">{profile.city}, {profile.state}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <GraduationCap size={14} />
                    {profile.high_school}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
