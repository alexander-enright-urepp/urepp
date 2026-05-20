'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onSuccess?: () => void
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        // Sign up user with auto-confirm (skip email verification)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: email.split('@')[0].toLowerCase(),
            }
          }
        })

        if (error) throw error

        if (data.user) {
          // Create profile
          await supabase.from('profiles').insert({
            user_id: data.user.id,
            email: email,
            username: email.split('@')[0].toLowerCase(),
            first_name: '',
            last_name: '',
            position: 'Athlete',
            high_school: '',
            slug: email.split('@')[0].toLowerCase(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          
          // Auto-sign in after signup
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (signInError) throw signInError
          
          // Redirect to create profile
          window.location.replace('/profile/create')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          onSuccess?.()
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {mode === 'signup'
            ? 'Join UREPP and create your recruitment profile'
            : 'Welcome back to UREPP'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-sm text-gray-500 mt-1">Must be at least 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
              </>
            ) : (
              mode === 'signup' ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link
              href={mode === 'signup' ? '/auth/signin' : '/auth/signup'}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {mode === 'signup' ? 'Sign in' : 'Create one'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
