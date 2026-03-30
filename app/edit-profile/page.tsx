'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Upload, User } from 'lucide-react'
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
  highSchool: string
  highSchoolGradYear: string
  highSchoolSports: string[]
  teamsPlayedFor: string
  city: string
  state: string
  collegeName: string
  collegeGradYear: string
  collegeYearsPlayed: string[]
  collegeCity: string
  collegeState: string
  collegeSports: string[]
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
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  
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
        setImagePreview(profileData.profile_picture_url)
        setValue('firstName', profileData.first_name || '')
        setValue('lastName', profileData.last_name || '')
        setValue('username', profileData.username || '')
        setValue('highSchool', profileData.high_school || '')
        setValue('highSchoolGradYear', profileData.grad_year?.toString() || '')
        setValue('highSchoolSports', profileData.high_school_sports || [])
        setValue('teamsPlayedFor', profileData.teams_played_for || '')
        setValue('city', profileData.city || '')
        setValue('state', profileData.state || '')
        setValue('collegeName', profileData.college_name || '')
        setValue('collegeGradYear', profileData.college_grad_year?.toString() || '')
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploadingImage(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${profile.user_id}-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file)
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      setUploadingImage(false)
      return
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName)
    
    await supabase.from('profiles').update({ profile_picture_url: publicUrl }).eq('id', profile.id)
    setImagePreview(publicUrl)
    setUploadingImage(false)
  }

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true)
    setError('')
    
    try {
      const updateData = {
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
        high_school: data.highSchool,
        grad_year: data.highSchoolGradYear ? parseInt(data.highSchoolGradYear) : null,
        high_school_sports: data.highSchoolSports,
        teams_played_for: data.teamsPlayedFor,
        city: data.city,
        state: data.state,
        college_name: data.collegeName || null,
        college_grad_year: data.collegeGradYear ? parseInt(data.collegeGradYear) : null,
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
          {/* Profile Picture */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Profile Picture</h2>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600">
                  <Upload className="w-4 h-4" />
                  {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <p className="text-sm text-gray-500 mt-1">Max 5MB, JPG or PNG</p>
              </div>
            </div>
          </section>

          {/* Basic Info */}
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
            </div>
          </section>

          {/* High School */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">High School</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">High School Name</label>
                <input {...register('highSchool')} placeholder="High School Name" className="w-full border rounded-lg px-3 py-2" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">High School Graduation Year</label>
                <select {...register('highSchoolGradYear')} className="w-full border rounded-lg px-3 py-2">
                  <option value="">Select Year</option>
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
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
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input {...register('city')} placeholder="City" className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input {...register('state')} placeholder="State" className="w-full border rounded-lg px-3 py-2" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Teams Played For</label>
                <input {...register('teamsPlayedFor')} placeholder="Travel team, club, etc." className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
          </section>

          {/* College */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">College (Optional)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">College Name</label>
                <input {...register('collegeName')} placeholder="College Name" className="w-full border rounded-lg px-3 py-2" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">College Graduation Year</label>
                <select {...register('collegeGradYear')} className="w-full border rounded-lg px-3 py-2">
                  <option value="">Select Year</option>
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
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
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input {...register('collegeCity')} placeholder="City" className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input {...register('collegeState')} placeholder="State (CA, TX, etc.)" className="w-full border rounded-lg px-3 py-2" />
                </div>
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
            <h2 className="text-lg font-bold mb-4">Bio</h2>
            <textarea {...register('bio')} placeholder="Tell us about yourself..." rows={4} className="w-full border rounded-lg px-3 py-2" />
          </section>

          {/* Awards */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Awards & Achievements</h2>
            <textarea {...register('awards')} placeholder="List your awards and achievements..." rows={3} className="w-full border rounded-lg px-3 py-2" />
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
