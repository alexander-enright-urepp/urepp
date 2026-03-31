'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Upload, User, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProfileFormData {
  firstName: string
  lastName: string
  username: string
  bio: string
}

export default function CreateProfile() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    username: '',
    bio: ''
  })
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login?redirect=/profile/create')
        return
      }
      
      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', session.user.id)
        .single()
      
      if (existingProfile?.username) {
        router.push('/dashboard')
        return
      }
      
      setUser(session.user)
      
      // Pre-fill username from email
      const emailUsername = session.user.email?.split('@')[0].toLowerCase() || ''
      setFormData(prev => ({ ...prev, username: emailUsername }))
      
      setLoading(false)
    }
    
    checkAuth()
  }, [router])

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username || formData.username.length < 3) {
        setUsernameAvailable(null)
        return
      }
      
      setCheckingUsername(true)
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', formData.username.toLowerCase())
        .single()
      
      setUsernameAvailable(!data)
      setCheckingUsername(false)
    }
    
    const timeout = setTimeout(checkUsername, 500)
    return () => clearTimeout(timeout)
  }, [formData.username])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('Image must be less than 5MB')
        return
      }
      
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadProfileImage = async (userId: string): Promise<string | null> => {
    if (!profileImage) return null
    
    setUploadingImage(true)
    const fileExt = profileImage.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, profileImage)
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      setUploadingImage(false)
      return null
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName)
    
    setUploadingImage(false)
    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      if (!user) throw new Error('Not authenticated')
      if (!formData.firstName || !formData.lastName || !formData.username) {
        throw new Error('Please fill in all required fields')
      }
      if (usernameAvailable === false) {
        throw new Error('Username is already taken')
      }
      
      // Upload profile image if selected
      let profileImageUrl = null
      if (profileImage) {
        profileImageUrl = await uploadProfileImage(user.id)
      }
      
      const username = formData.username.toLowerCase().replace(/[^a-z0-9]/g, '')
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: username,
            bio: formData.bio || null,
            profile_picture_url: profileImageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
        
        if (updateError) throw updateError
      } else {
        // Create new profile (shouldn't happen, but just in case)
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            username: username,
            first_name: formData.firstName,
            last_name: formData.lastName,
            bio: formData.bio || null,
            profile_picture_url: profileImageUrl,
            grad_year: 2026,
            slug: username,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (insertError) throw insertError
      }
      
      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
      
    } catch (err: any) {
      console.error('Error creating profile:', err)
      setSubmitError(err.message || 'Failed to create profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-babyblue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-babyblue-50 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-babyblue-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create Profile</h1>
              <p className="text-sm text-gray-500">Set up your profile</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Profile Picture</h3>
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-babyblue-100 to-babyblue-200 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-babyblue-600" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-babyblue-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-babyblue-600 transition-colors">
                  <Upload className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-3">Tap to upload photo</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                    placeholder="johndoe"
                    className={`w-full px-4 py-3 pr-10 rounded-xl border outline-none transition-all ${
                      usernameAvailable === false 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                        : usernameAvailable === true
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-100'
                        : 'border-gray-200 focus:border-babyblue-500 focus:ring-babyblue-100'
                    }`}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername ? (
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    ) : usernameAvailable === true ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : usernameAvailable === false ? (
                      <span className="text-red-500 text-xs">Taken</span>
                    ) : null}
                  </div>
                </div>
                {usernameAvailable === false && (
                  <p className="text-sm text-red-500 mt-1">This username is already taken</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Letters and numbers only</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Bio</h3>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">{formData.bio.length}/500 characters</p>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-100 border border-red-200 rounded-xl p-4 text-red-900">
              {submitError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || uploadingImage || usernameAvailable === false}
            className="w-full bg-babyblue-500 hover:bg-babyblue-600 disabled:bg-babyblue-300 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting || uploadingImage ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
