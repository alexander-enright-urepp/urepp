'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Loader2, Mail, Lock, ArrowLeft, User, CheckCircle } from 'lucide-react'

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Date of Birth (optional)
  const [dateOfBirth, setDateOfBirth] = useState({ year: '', month: '', day: '' })
  const [ageError, setAgeError] = useState('')
  const [isUnder13, setIsUnder13] = useState(false)
  
  // Consent
  const [consentChecked, setConsentChecked] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Years from 2013 going back 100 years
  const years = Array.from({ length: 100 }, (_, i) => 2013 - i)
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))

  // Update DOB when changed
  const updateDOB = (field: 'year' | 'month' | 'day', value: string) => {
    const newDOB = { ...dateOfBirth, [field]: value }
    setDateOfBirth(newDOB)
    
    // If all DOB fields filled, validate age
    if (newDOB.year && newDOB.month && newDOB.day) {
      const birthDate = new Date(`${newDOB.year}-${newDOB.month}-${newDOB.day}`)
      const today = new Date()
      
      if (isNaN(birthDate.getTime()) || birthDate > today) {
        setAgeError('Please enter a valid date')
        setIsUnder13(false)
        return
      }

      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      if (age < 13) {
        setAgeError('You must be at least 13 years old to use UREPP')
        setIsUnder13(true)
      } else {
        setAgeError('')
        setIsUnder13(false)
      }
    } else {
      // Partial DOB - clear errors
      setAgeError('')
      setIsUnder13(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate age: either DOB shows 13+ OR user confirms via checkbox
    if (isUnder13) {
      setError('You must be at least 13 years old to create an account')
      setIsLoading(false)
      return
    }

    // Validate consent
    if (!consentChecked) {
      setError('You must agree to the Terms of Service and Privacy Policy')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    const { data, error } = await signUp(email, password)
    
    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else if (data.user) {
      // Store age verification in profile
      // If DOB provided, use it; otherwise just confirm age_verified with no DOB
      const birthDateStr = dateOfBirth.year && dateOfBirth.month && dateOfBirth.day
        ? `${dateOfBirth.year}-${dateOfBirth.month}-${dateOfBirth.day}`
        : null
      
      const { error: updateError } = await supabase.rpc('verify_user_age', {
        user_uuid: data.user.id,
        birth_date: birthDateStr,
        app_version: '1.0.0'
      })

      if (updateError) {
        console.error('Failed to store age verification:', updateError)
        // Continue anyway - user is signed up
      }
      
      // Auto sign in after signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (!signInError) {
        // Redirect to create profile
        router.push('/profile/create')
      } else {
        setSuccess(true)
        setIsLoading(false)
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100">
        <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Link 
                href="/" 
                className="w-10 h-10 rounded-xl bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Success</h1>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-8 text-center">
            <div className="w-20 h-20 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-babyblue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a confirmation link to{' '}
              <span className="font-medium text-gray-900">{email}</span>
            </p>
            <Link
              href="/login"
              className="inline-block w-full bg-babyblue-500 hover:bg-babyblue-600 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </main>
      </div>
    )
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
                <h1 className="text-xl font-bold text-gray-900">Sign Up</h1>
                <p className="text-sm text-gray-500">Create your account</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-babyblue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-babyblue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-500 mt-1">Join UREPP and get discovered</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            {/* Date of Birth (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date of Birth <span className="text-gray-400">(optional)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={dateOfBirth.month}
                  onChange={(e) => updateDOB('month', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all bg-white"
                >
                  <option value="">Month</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>

                <select
                  value={dateOfBirth.day}
                  onChange={(e) => updateDOB('day', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all bg-white"
                >
                  <option value="">Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>{parseInt(d)}</option>
                  ))}
                </select>

                <select
                  value={dateOfBirth.year}
                  onChange={(e) => updateDOB('year', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:border-babyblue-400 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all bg-white"
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              {ageError && (
                <p className="text-red-500 text-xs mt-1">{ageError}</p>
              )}
            </div>

            {/* Consent Checkbox */}
            <div className="bg-gray-50 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  required
                  className="mt-1 w-5 h-5 text-babyblue-600 border-gray-300 rounded focus:ring-babyblue-500"
                />
                <span className="text-sm text-gray-700">
                  I confirm I am at least 13 years old and agree to the{' '}
                  <Link href="/terms" className="text-babyblue-600 hover:underline" target="_blank">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-babyblue-600 hover:underline" target="_blank">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !consentChecked}
              className="w-full bg-babyblue-500 hover:bg-babyblue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-md shadow-babyblue-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-babyblue-600 hover:text-babyblue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-2">Free forever. No credit card required.</p>
          <div className="flex justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> 100% Free
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> COPPA Compliant
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
