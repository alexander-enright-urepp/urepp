"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { User, LogOut, Edit, Eye, Plus, UserCircle } from "lucide-react"

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

export function MobileDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setProfile(data)
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-babyblue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-babyblue-200/50 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-babyblue-600">UREPP</h1>
          <button
            onClick={signOut}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {profile ? (
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-babyblue-100 p-6">
              <div className="flex items-center gap-4">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="w-20 h-20 rounded-full object-cover border-4 border-babyblue-100"
                  />
                ) : (
                  <div className="w-20 h-20 bg-babyblue-100 rounded-full flex items-center justify-center text-babyblue-600 text-2xl font-bold">
                    {profile.first_name[0]}{profile.last_name[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <p className="text-babyblue-600 font-medium">@{profile.username}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-babyblue-100 text-babyblue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {profile.primary_position}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      Class of {profile.grad_year}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    {profile.high_school} • {profile.city}, {profile.state}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => alert('Edit profile coming soon!')}
                  className="flex-1 flex items-center justify-center gap-2 bg-babyblue-500 text-white px-4 py-3 rounded-xl font-medium"
                >
                  <Edit size={18} />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-babyblue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Status</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <UserCircle size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Profile Active</p>
                    <p className="text-sm text-gray-500">Visible to coaches</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-babyblue-100 rounded-xl flex items-center justify-center">
                    <Eye size={20} className="text-babyblue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Public URL</p>
                    <button
                      onClick={() => window.open(`https://urepp.vercel.app/players/${profile.username}`, '_system')}
                      className="text-sm text-babyblue-600 truncate"
                    >
                      urepp.vercel.app/players/{profile.username}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-babyblue-100 p-12 text-center">
            <div className="w-20 h-20 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={40} className="text-babyblue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Profile</h2>
            <p className="text-gray-600 mb-6">Build your profile to get discovered by college coaches.</p>
            <button
              onClick={() => alert('Create profile coming soon!')}
              className="bg-babyblue-500 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Create Profile
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
