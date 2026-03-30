'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const YEARS = Array.from({length: 81}, (_, i) => (1950 + i).toString())

const SPORTS = [
  'Baseball', 'Basketball', 'Football', 'Soccer', 'Volleyball',
  'Tennis', 'Golf', 'Swimming', 'Track & Field', 'Cross Country',
  'Wrestling', 'Hockey', 'Lacrosse', 'Softball', 'Gymnastics',
  'Cheerleading', 'Other'
]

interface ProfileForm {
  firstName: string
  lastName: string
  username: string
  gradYear: string
  collegeName: string
  collegeYearsPlayed: string[]
  collegeCity: string
  collegeState: string
  collegeSports: string[]
  highSchool: string
  highSchoolSports: string[]
  teamsPlayedFor: string
  city: string
  state: string
  instagram: string
  twitter: string
  youtube: string
  bio: string
  awards: string
}

export default function EditProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState('')
  
  const { register, handleSubmit, setValue, watch } = useForm<ProfileForm>()
  
  const watchedCollegeSports = watch('collegeSports') || []
  const watchedHighSchoolSports = watch('highSchoolSports') || []
  const watchedCollegeYears = watch('collegeYearsPlayed') || []

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData)
        setValue('firstName', profileData.first_name || '')
        setValue('lastName', profileData.last_name || '')
        setValue('username', profileData.username || '')
        setValue('gradYear', profileData.grad_year?.toString() || '')
        setValue('highSchool', profileData.high_school || '')
        setValue('highSchoolSports', profileData.high_school_sports || [])
        setValue('teamsPlayedFor', profileData.teams_played_for || '')
        setValue('city', profileData.city || '')
        setValue('state', profileData.state || '')
        setValue('collegeName', profileData.college_name || '')
        setValue('collegeYearsPlayed', profileData.college_years_played || [])
        setValue('collegeCity', profileData.college_city || '')
        setValue('collegeState', profileData.college_state || '')
        setValue('collegeSports', profileData.college_sports || [])
        setValue('instagram', profileData.instagram || '')
        setValue('twitter', profileData.twitter || '')
        setValue('youtube', profileData.youtube || '')
        setValue('bio', profileData.bio || '')
        setValue('awards', profileData.awards || '')
      }
      setLoading(false)
    }
    loadData()
  }, [router, setValue])

  const toggleArrayValue = (field: any, value: string) => {
    const current = watch(field) || []
    if (current.includes(value)) {
      setValue(field, current.filter((v: string) => v !== value))
    } else {
      setValue(field, [...current, value])
    }
  }

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true)
    setError('')
    
    try {
      const updateData = {
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
        grad_year: parseInt(data.gradYear),
        high_school: data.highSchool,
        high_school_sports: data.highSchoolSports,
        teams_played_for: data.teamsPlayedFor,
        city: data.city,
        state: data.state,
        college_name: data.collegeName || null,
        college_years_played: data.collegeYearsPlayed,
        college_city: data.collegeCity || null,
        college_state: data.collegeState || null,
        college_sports: data.collegeSports,
        instagram: data.instagram,
        twitter: data.twitter,
        youtube: data.youtube,
        bio: data.bio,
        awards: data.awards,
      }
      
      await supabase.from('profiles').update(updateData).eq('id', profile.id)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Edit Profile</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input {...register('firstName')} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input {...register('lastName')} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input {...register('username')} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Graduation Year</label>
                <input type="number" {...register('gradYear')} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
          </section>

          {/* College */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">College (Optional)</h2>
            <div className="space-y-4">
              <input {...register('collegeName')} placeholder="College Name" className="w-full border rounded-lg px-3 py-2" />
              
              <div>
                <label className="block text-sm font-medium mb-2">Years Played</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                  {YEARS.map(year => (
                    <button key={year} type="button" onClick={() => toggleArrayValue('collegeYearsPlayed', year)}
                      className={`px-2 py-1 rounded text-xs ${watchedCollegeYears.includes(year) ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                      {year}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <input {...register('collegeCity')} placeholder="City" className="border rounded-lg px-3 py-2" />
                <input {...register('collegeState')} placeholder="State (CA, TX, etc.)" className="border rounded-lg px-3 py-2" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Sports</label>
                <div className="flex flex-wrap gap-2">
                  {SPORTS.map(sport => (
                    <button key={sport} type="button" onClick={() => toggleArrayValue('collegeSports', sport)}
                      className={`px-3 py-1 rounded-full text-sm ${watchedCollegeSports.includes(sport) ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                      {sport}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* High School */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">High School</h2>
            <div className="space-y-4">
              <input {...register('highSchool')} placeholder="High School Name" className="w-full border rounded-lg px-3 py-2" />
              
              <div>
                <label className="block text-sm font-medium mb-2">Sports</label>
                <div className="flex flex-wrap gap-2">
                  {SPORTS.map(sport => (
                    <button key={sport} type="button" onClick={() => toggleArrayValue('highSchoolSports', sport)}
                      className={`px-3 py-1 rounded-full text-sm ${watchedHighSchoolSports.includes(sport) ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                      {sport}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <input {...register('city')} placeholder="City" className="border rounded-lg px-3 py-2" />
                <input {...register('state')} placeholder="State" className="border rounded-lg px-3 py-2" />
              </div>
              
              <input {...register('teamsPlayedFor')} placeholder="Teams Played For" className="w-full border rounded-lg px-3 py-2" />
            </div>
          </section>

          {/* Social */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Social Links</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <input {...register('instagram')} placeholder="Instagram" className="border rounded-lg px-3 py-2" />
              <input {...register('twitter')} placeholder="Twitter" className="border rounded-lg px-3 py-2" />
              <input {...register('youtube')} placeholder="YouTube" className="border rounded-lg px-3 py-2" />
            </div>
          </section>

          {/* Bio */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">About</h2>
            <textarea {...register('bio')} placeholder="Bio" rows={4} className="w-full border rounded-lg px-3 py-2 mb-4" />
            <textarea {...register('awards')} placeholder="Awards" rows={3} className="w-full border rounded-lg px-3 py-2" />
          </section>

          <div className="flex gap-4">
            <Link href="/dashboard" className="flex-1 py-3 border rounded-xl text-center hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-blue-500 text-white rounded-xl disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
