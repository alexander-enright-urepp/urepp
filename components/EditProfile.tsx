"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Check, User, School, MapPin } from "lucide-react"

interface Profile {
  id: string
  first_name: string
  last_name: string
  username: string
  high_school: string
  city: string
  state: string
  grad_year: number
  primary_position: string
  secondary_position: string | null
  height: string | null
  weight: string | null
  exit_velocity: number | null
  pitch_velocity: number | null
  sixty_time: number | null
  gpa: number | null
  bio: string | null
  instagram: string | null
  twitter: string | null
  youtube: string | null
}

export function EditProfile({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    setProfile(data)
    setLoading(false)
  }

  async function handleSave() {
    if (!profile) return
    
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          high_school: profile.high_school,
          city: profile.city,
          state: profile.state,
          grad_year: profile.grad_year,
          primary_position: profile.primary_position,
          secondary_position: profile.secondary_position,
          height: profile.height,
          weight: profile.weight,
          exit_velocity: profile.exit_velocity,
          pitch_velocity: profile.pitch_velocity,
          sixty_time: profile.sixty_time,
          gpa: profile.gpa,
          bio: profile.bio,
          instagram: profile.instagram,
          twitter: profile.twitter,
          youtube: profile.youtube,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      setMessage({ type: "success", text: "Profile updated successfully!" })
      setTimeout(onSuccess, 1500)
    } catch (err: any) {
      setMessage({ type: "error", text: err.message })
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: keyof Profile, value: any) {
    setProfile(prev => prev ? { ...prev, [field]: value } : null)
  }

  const positions = [
    "Pitcher", "Catcher", "First Base", "Second Base", "Third Base",
    "Shortstop", "Left Field", "Center Field", "Right Field", "Designated Hitter"
  ]

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-babyblue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <p className="text-gray-600">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-babyblue-200/50 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2">
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-babyblue-500 text-white px-4 py-2 rounded-xl font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? "Saving..." : <><Check size={18} /> Save</>}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-6 pb-24">
        {message && (
          <div className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        {/* Basic Info */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-babyblue-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={20} className="text-babyblue-500" />
            Basic Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={profile.first_name}
                  onChange={(e) => updateField("first_name", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={profile.last_name}
                  onChange={(e) => updateField("last_name", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={`@${profile.username}`}
                disabled
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-100 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={profile.bio || ""}
                onChange={(e) => updateField("bio", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent h-24 resize-none"
                placeholder="Tell coaches about yourself..."
              />
            </div>
          </div>
        </section>

        {/* School & Location */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-babyblue-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <School size={20} className="text-babyblue-500" />
            School & Location
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">High School</label>
              <input
                type="text"
                value={profile.high_school}
                onChange={(e) => updateField("high_school", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={profile.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
                >
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={profile.grad_year}
                  onChange={(e) => updateField("grad_year", parseInt(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GPA (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={profile.gpa || ""}
                  onChange={(e) => updateField("gpa", e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
                  placeholder="3.50"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Position */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-babyblue-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Position</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Position</label>
              <select
                value={profile.primary_position}
                onChange={(e) => updateField("primary_position", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
              >
                {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Position (Optional)</label>
              <select
                value={profile.secondary_position || ""}
                onChange={(e) => updateField("secondary_position", e.target.value || null)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
              >
                <option value="">None</option>
                {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Physical Stats */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-babyblue-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Physical Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <input
                type="text"
                value={profile.height || ""}
                onChange={(e) => updateField("height", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
                placeholder="6ft 2in"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
              <input
                type="text"
                value={profile.weight || ""}
                onChange={(e) => updateField("weight", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
                placeholder="180"
              />
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-babyblue-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
          <div className="space-y-4">
            {["instagram", "twitter", "youtube"].map((platform) => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {platform}
                </label>
                <input
                  type="text"
                  value={profile[platform as keyof Profile] || ""}
                  onChange={(e) => updateField(platform as keyof Profile, e.target.value || null)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
                  placeholder={`@${platform} handle`}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}