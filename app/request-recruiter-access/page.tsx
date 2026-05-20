'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Mail, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function RequestRecruiterAccess() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organization: '',
    title: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'recruiter'
          }
        }
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (authData.user) {
        // Create profile with recruiter status
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            username: formData.email.split('@')[0] + '_recruiter',
            role: 'recruiter',
            recruiter_approved: false,
            recruiter_paid: false,
            organization: formData.organization,
            // You might want to store additional recruiter-specific fields
            // Consider creating a recruiter_profiles table for extended data
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          setError('Account created but profile setup failed. Please contact support.')
          setLoading(false)
          return
        }

        // Send email notification
        await fetch('/api/send-recruiter-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            organization: formData.organization,
            title: formData.title,
            phone: formData.phone
          })
        })

        setSubmitted(true)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
          <p className="text-slate-600 mb-6">
            Thank you for your interest. Our team will review your application and email you within 24-48 hours.
          </p>
          <Link
            href="/recruiter-login"
            className="inline-flex items-center gap-2 text-[#51b5ff] hover:text-[#3a9ce6] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/recruiter-login" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#51b5ff] to-[#2d8fd9] mb-4">
            <Building2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Request Recruiter Access</h1>
          <p className="text-slate-500 mt-2">
            Verified coaches, scouts, and athletic directors can apply for access
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#51b5ff] focus:ring-2 focus:ring-[#51b5ff]/20 outline-none transition-all"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#51b5ff] focus:ring-2 focus:ring-[#51b5ff]/20 outline-none transition-all"
                  placeholder="Smith"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#51b5ff] focus:ring-2 focus:ring-[#51b5ff]/20 outline-none transition-all"
                  placeholder="coach@university.edu"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Use your organization email for faster verification</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Create Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#51b5ff] focus:ring-2 focus:ring-[#51b5ff]/20 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#51b5ff] focus:ring-2 focus:ring-[#51b5ff]/20 outline-none transition-all"
                  placeholder="University of Example"
                />
              </div>
            </div>

            {/* Title & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#51b5ff] focus:ring-2 focus:ring-[#51b5ff]/20 outline-none transition-all"
                  placeholder="Head Coach"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#51b5ff] focus:ring-2 focus:ring-[#51b5ff]/20 outline-none transition-all"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#51b5ff] to-[#2d8fd9] hover:from-[#3a9ce6] hover:to-[#1f7bc4] disabled:opacity-50 text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#51b5ff]/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>

            <p className="text-xs text-slate-500 text-center">
              By submitting, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🔍', title: 'Discover Talent', desc: 'Search thousands of verified athlete profiles' },
            { icon: '✉️', title: 'Direct Contact', desc: 'Message athletes and their families directly' },
            { icon: '📊', title: 'Advanced Analytics', desc: 'Track stats and performance metrics' }
          ].map((benefit, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
              <div className="text-2xl mb-2">{benefit.icon}</div>
              <h3 className="font-medium text-slate-900 text-sm">{benefit.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
