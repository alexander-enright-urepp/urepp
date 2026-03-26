"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, User, School, MapPin, Calendar, Check } from "lucide-react"

interface ProfileFormData {
  first_name: string
  last_name: string
  username: string
  high_school: string
  city: string
  state: string
  grad_year: string
  primary_position: string
  bio: string
}

export function CreateProfile({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    username: "",
    high_school: "",
    city: "",
    state: "",
    grad_year: "",
    primary_position: "",
    bio: "",
  })

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

  const currentYear = new Date().getFullYear()
  const gradYears = Array.from({ length: 8 }, (_, i) => (currentYear + i).toString())

  function updateField(field: keyof ProfileFormData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Check username availability
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", formData.username.toLowerCase())
        .single()

      if (existing) {
        throw new Error("Username already taken")
      }

      const { error: insertError } = await supabase.from("profiles").insert({
        user_id: user.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username.toLowerCase(),
        high_school: formData.high_school,
        city: formData.city,
        state: formData.state,
        grad_year: parseInt(formData.grad_year),
        primary_position: formData.primary_position,
        bio: formData.bio || null,
      })

      if (insertError) throw insertError

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => updateField("first_name", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => updateField("last_name", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
            placeholder="Smith"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => updateField("username", e.target.value.replace(/\s/g, "").toLowerCase())}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
            placeholder="johnsmith2026"
          />
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!formData.first_name || !formData.last_name || !formData.username}
        className="w-full bg-babyblue-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">School & Location</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">High School</label>
        <div className="relative">
          <School className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={formData.high_school}
            onChange={(e) => updateField("high_school", e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
            placeholder="Lincoln High School"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
              placeholder="Oakland"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <select
            value={formData.state}
            onChange={(e) => updateField("state", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
          >
            <option value="">Select</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={formData.grad_year}
            onChange={(e) => updateField("grad_year", e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
          >
            <option value="">Select</option>
            {gradYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold"
        >
          Back
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!formData.high_school || !formData.city || !formData.state || !formData.grad_year}
          className="flex-1 bg-babyblue-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Position & Bio</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Position</label>
        <select
          value={formData.primary_position}
          onChange={(e) => updateField("primary_position", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent"
        >
          <option value="">Select Position</option>
          {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio (Optional)</label>
        <textarea
          value={formData.bio}
          onChange={(e) => updateField("bio", e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-babyblue-500 focus:border-transparent h-32 resize-none"
          placeholder="Tell coaches about yourself..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.primary_position}
          className="flex-1 bg-babyblue-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "Creating..." : <><Check size={20} /> Create Profile</>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-babyblue-200/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Create Profile</h1>
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-4">
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${s <= step ? "bg-babyblue-500" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="px-4 pb-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  )
}