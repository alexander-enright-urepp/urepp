'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Upload, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SPORT_OPTIONS, getSportConfig, Sport, isValidSport } from '@/lib/sports'

interface ProfileFormData {
  firstName: string
  lastName: string
  username: string
  sport: Sport
  city: string
  state: string
  highSchool: string
  teamsPlayedFor: string
  primaryPosition: string
  secondaryPosition: string
  bats: string
  throws: string
  gradYear: string
  height: string
  weight: string
  statPrimary: string
  statSecondary: string
  statTertiary: string
  gpa: string
  instagram: string
  twitter: string
  youtube: string
  bio: string
  awards: string
}

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const currentYear = new Date().getFullYear()
const gradYears = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4]

export default function EditProfile() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedSport, setSelectedSport] = useState<Sport>('baseball')

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ProfileFormData>()

  const sportConfig = getSportConfig(selectedSport)

  // Watch sport changes to update positions
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'sport') {
        const newSport = value.sport as Sport
        if (isValidSport(newSport)) {
          setSelectedSport(newSport)
          // Clear positions when sport changes
          setValue('primaryPosition', '')
          setValue('secondaryPosition', '')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue])

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login?redirect=/edit-profile')
        return
      }
      setUser(session.user)

      // Fetch user's profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setImagePreview(profileData.profile_picture_url)
        
        // Set the sport
        const userSport = (profileData.sport || 'baseball') as Sport
        if (isValidSport(userSport)) {
          setSelectedSport(userSport)
        }
        
        // Reset form with existing data
        reset({
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          username: profileData.username,
          sport: userSport,
          city: profileData.city || '',
          state: profileData.state || '',
          highSchool: profileData.high_school,
          teamsPlayedFor: profileData.teams_played_for || '',
          primaryPosition: profileData.primary_position,
          secondaryPosition: profileData.secondary_position || '',
          bats: profileData.bats || '',
          throws: profileData.throws || '',
          gradYear: profileData.grad_year.toString(),
          height: profileData.height || '',
          weight: profileData.weight || '',
          statPrimary: profileData.stat_primary || profileData.exit_velocity?.toString() || '',
          statSecondary: profileData.stat_secondary || profileData.pitch_velocity?.toString() || '',
          statTertiary: profileData.stat_tertiary || profileData.sixty_time?.toString() || '',
          gpa: profileData.gpa?.toString() || '',
          instagram: profileData.instagram || '',
          twitter: profileData.twitter || '',
          youtube: profileData.youtube || '',
          bio: profileData.bio || '',
          awards: profileData.awards || '',
        })
      } else {
        // No profile exists, redirect to create
        router.push('/profile/create')
        return
      }
      
      setLoading(false)
    }
    fetchData()
  }, [router, reset])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Image must be less than 5MB')
        return
      }
      setProfileImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadProfileImage = async (userId: string): Promise<string | null> => {
    if (!profileImage) return profile?.profile_picture_url
    
    setUploadingImage(true)
    const fileExt = profileImage.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, profileImage)
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      setUploadingImage(false)
      return profile?.profile_picture_url
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName)
    
    setUploadingImage(false)
    return publicUrl
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Check if username changed and is taken
      if (data.username !== profile.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', data.username.toLowerCase())
          .single()

        if (existingUser) {
          setSubmitError('Username is already taken. Please choose another.')
          setIsSubmitting(false)
          return
        }
      }

      // Upload profile image if selected
      let profilePictureUrl = profile?.profile_picture_url
      if (profileImage) {
        profilePictureUrl = await uploadProfileImage(user.id)
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          username: data.username.toLowerCase(),
          profile_picture_url: profilePictureUrl,
          sport: data.sport,
          city: data.city || null,
          state: data.state || null,
          high_school: data.highSchool,
          teams_played_for: data.teamsPlayedFor || null,
          primary_position: data.primaryPosition,
          secondary_position: data.secondaryPosition || null,
          bats: data.bats || null,
          throws: data.throws || null,
          grad_year: parseInt(data.gradYear),
          height: data.height || null,
          weight: data.weight || null,
          stat_primary: data.statPrimary || null,
          stat_secondary: data.statSecondary || null,
          stat_tertiary: data.statTertiary || null,
          gpa: data.gpa ? parseFloat(data.gpa) : null,
          instagram: data.instagram || null,
          twitter: data.twitter || null,
          youtube: data.youtube || null,
          bio: data.bio || null,
          awards: data.awards || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error('Profile update error:', err)
      setSubmitError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-babyblue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-babyblue-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-babyblue-600">UREPP</Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Your Profile</h1>
          <p className="text-gray-600 mb-8">Update your recruiting profile information.</p>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Picture */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-babyblue-200">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-babyblue-100"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-babyblue-100 rounded-full flex items-center justify-center border-4 border-white">
                      <User className="w-10 h-10 text-babyblue-400" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block">
                    <span className="sr-only">Choose profile photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-babyblue-50 file:text-babyblue-700
                        hover:file:bg-babyblue-100
                        cursor-pointer"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>
            </div>

            {/* Sport Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-babyblue-200">Sport</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Your Sport *</label>
                <select
                  {...register('sport', { required: 'Sport is required' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                >
                  {SPORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.sport && <p className="text-red-500 text-sm mt-1">{errors.sport.message}</p>}
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-babyblue-200">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    {...register('firstName', { required: 'First name is required' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                    placeholder="John"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    {...register('lastName', { required: 'Last name is required' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    {...register('username', { 
                      required: 'Username is required',
                      pattern: { value: /^[a-zA-Z0-9-]+$/, message: 'Only letters, numbers, and hyphens' }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                    placeholder="john-doe-2026"
                  />
                  {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">This will be your public profile URL</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year *</label>
                  <select
                    {...register('gradYear', { required: 'Graduation year is required' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                  >
                    <option value="">Select Year</option>
                    {gradYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.gradYear && <p className="text-red-500 text-sm mt-1">{errors.gradYear.message}</p>}
                </div>
              </div>
            </div>

            {/* Location & School */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-babyblue-200">Location & School</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">High School *</label>
                  <input
                    {...register('highSchool', { required: 'High school is required' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                    placeholder="Lincoln High School"
                  />
                  {errors.highSchool && <p className="text-red-500 text-sm mt-1">{errors.highSchool.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    {...register('city')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                    placeholder="Springfield"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    {...register('state')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                  >
                    <option value="">Select State</option>
                    {states.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teams Played For</label>
                  <input
                    {...register('teamsPlayedFor')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                    placeholder="Travel team, summer league, etc."
                  />
                </div>
              </div>
            </div>


            {/* Social Links */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-babyblue-200">Social Links</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  <input
                    {...register('instagram')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
                  <input
                    {...register('twitter')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Channel</label>
                  <input
                    {...register('youtube')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                    placeholder="youtube.com/channel/..."
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-babyblue-200">Player Bio</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tell coaches about yourself</label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                  placeholder="I'm a hard-working player focused on developing my skills..."
                />
              </div>
            </div>

            {/* Awards & Achievements */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-babyblue-200">Awards & Achievements</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">List your awards and achievements (one per line)</label>
                <textarea
                  {...register('awards')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                  placeholder="First-team All-Conference (2024)
Team MVP (2023)
Perfect Game All-American..."
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || uploadingImage}
                className="flex-1 bg-babyblue-500 hover:bg-babyblue-600 disabled:bg-babyblue-300 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-babyblue-200"
              >
                {isSubmitting || uploadingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-4 rounded-xl font-semibold text-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}