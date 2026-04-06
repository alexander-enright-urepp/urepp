'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft, Building2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const PRIMARY_BLUE = '#51b5ff'

export default function RecruiterLogin() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Authentication failed')
        setLoading(false)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, recruiter_approved')
        .eq('user_id', authData.user.id)
        .single()

      if (profileError || !profile) {
        setError('Profile not found')
        setLoading(false)
        return
      }

      if (profile.role !== 'recruiter') {
        setError('Recruiter access only. Please use the athlete login.')
        setLoading(false)
        await supabase.auth.signOut()
        return
      }

      if (!profile.recruiter_approved) {
        setMessage('Your recruiter account is pending approval.')
        setLoading(false)
        return
      }

      router.push('/recruiter-dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <Link href="/recruiter-login" className="flex items-center gap-1">
          <span className="font-bold text-lg" style={{ color: PRIMARY_BLUE }}>UREPP</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Recruiters</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm">
          {/* Icon & Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: PRIMARY_BLUE }}>
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="inline-flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: PRIMARY_BLUE }}></span>
              <span className="text-xs font-medium" style={{ color: PRIMARY_BLUE }}>Invite-Only</span>
            </div>
            
            <h1 className="text-xl font-bold text-gray-900 mb-2">Recruiter Login</h1>
            <p className="text-sm text-gray-500">Verified coaches & scouts only</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Info */}
          {message && (
            <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {message}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <form onSubmit={handleSignIn} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="coach@university.edu"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#51b5ff] focus:ring-2 focus:ring-[#51b5ff]/20 outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#51b5ff] focus:ring-2 focus:ring-[#51b5ff]/20 outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                style={{ background: PRIMARY_BLUE }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                Need access?{' '}
                <Link href="/request-recruiter-access" className="font-medium hover:underline" style={{ color: PRIMARY_BLUE }}>
                  Request Invite
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              500+ Colleges
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              Verified
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
