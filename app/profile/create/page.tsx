'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  gradYear: string
  position: string
  height: string
  weight: string
  throws: string
  bats: string
  highSchool: string
  hometown: string
  state: string
  gpa: string
  satScore: string
  actScore: string
  bio: string
}

const positions = [
  'RHP', 'LHP', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'OF', 'UTIL'
]

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const currentYear = new Date().getFullYear()
const gradYears = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4]

export default function CreateProfile() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileFormData>()

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push('/auth/signin?redirect=/profile/create')
        return
      }
      setUser(session.user)
      setValue('email', session.user.email || '')
      setLoading(false)
    })
  }, [router, setValue])

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Generate slug from name + grad year
      const baseSlug = `${data.firstName.toLowerCase()}-${data.lastName.toLowerCase()}-${data.gradYear}`
      const slug = baseSlug.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      // Check if slug exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('slug')
        .eq('slug', slug)
        .single()

      // If exists, add random suffix
      const finalSlug = existingProfile
        ? `${slug}-${Math.random().toString(36).substring(2, 6)}`
        : slug

      const { data: profile, error } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone || null,
            grad_year: parseInt(data.gradYear),
            position: data.position,
            height: data.height || null,
            weight: data.weight || null,
            throws: data.throws || null,
            bats: data.bats || null,
            high_school: data.highSchool,
            hometown: data.hometown || null,
            state: data.state || null,
            gpa: data.gpa || null,
            sat_score: data.satScore || null,
            act_score: data.actScore || null,
            bio: data.bio || null,
            slug: finalSlug,
          }
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Redirect to the new profile
      router.push(`/profile/${finalSlug}`)
      router.refresh()
    } catch (err: any) {
      console.error('Profile creation error:', err)
      setSubmitError(err.message || 'Failed to create profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-blue-600">UREPP</Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Profile</h1>
          <p className="text-gray-600 mb-8">Fill in your information to build your professional baseball recruitment profile.</p>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-babyblue-200">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    {...register('firstName', { required: 'First name is required' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-babyblue-400 focus:border-babyblue-400 transition-colors"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    {...register('lastName', { required: 'Last name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    placeholder="john@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email is linked to your account</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Athletic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-babyblue-200">Athletic Information</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year *</label>
                  <select
                    {...register('gradYear', { required: 'Graduation year is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Year</option>
                    {gradYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.gradYear && (
                    <p className="text-red-500 text-sm mt-1">{errors.gradYear.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Position *</label>
                  <select
                    {...register('position', { required: 'Position is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Position</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                  {errors.position && (
                    <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                  <input
                    {...register('height')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="6'1\"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    {...register('weight')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="185"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Throws</label>
                  <select
                    {...register('throws')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="R">Right</option>
                    <option value="L">Left</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bats</label>
                  <select
                    {...register('bats')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="R">Right</option>
                    <option value="L">Left</option>
                    <option value="S">Switch</option>
                  </select>
                </div>
              </div>
            </div>

            {/* School Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-babyblue-200">School Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">High School *</label>
                  <input
                    {...register('highSchool', { required: 'High school is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Lincoln High School"
                  />
                  {errors.highSchool && (
                    <p className="text-red-500 text-sm mt-1">{errors.highSchool.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hometown</label>
                    <input
                      {...register('hometown')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Springfield"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select
                      {...register('state')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">State</option>
                      {states.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-babyblue-200">Academic Information</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                  <input
                    {...register('gpa')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="3.8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SAT Score</label>
                  <input
                    {...register('satScore')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1350"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ACT Score</label>
                  <input
                    {...register('actScore')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="28"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="I'm a hard-working player focused on developing my skills..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-babyblue-500 hover:bg-babyblue-600 disabled:bg-babyblue-300 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-babyblue-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Create Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
