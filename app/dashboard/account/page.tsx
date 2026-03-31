'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Key,
  LogOut,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Home,
  Search,
  User,
  Tv
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  // Password reset form
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    setError('')
    setMessage('')
    
    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (updateError) {
      setError(updateError.message)
    } else {
      setMessage('Password updated successfully!')
      setShowPasswordForm(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Account Settings</h1>
              <p className="text-sm text-gray-500">Manage your account</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Messages */}
        {message && (
          <div className="bg-green-100 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <Save className="w-5 h-5 text-green-600" />
            <p className="text-green-900 font-medium">{message}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <Key className="w-5 h-5 text-red-600" />
            <p className="text-red-900 font-medium">{error}</p>
          </div>
        )}

        {/* Reset Password Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Password</h3>
          </div>
          
          {!showPasswordForm ? (
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">Update your password to keep your account secure.</p>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="w-full py-3 px-4 bg-babyblue-500 hover:bg-babyblue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Key className="w-5 h-5" />
                Reset Password
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-babyblue-500 focus:ring-2 focus:ring-babyblue-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPasswordForm(false)
                    setError('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordReset}
                  disabled={loading || !newPassword || !confirmPassword}
                  className="flex-1 py-3 px-4 bg-babyblue-500 hover:bg-babyblue-600 disabled:bg-babyblue-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Session</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-4">Sign out of your account on this device.</p>
            <button
              onClick={handleSignOut}
              className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/tv" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <Tv className="w-6 h-6" />
            <span className="text-xs font-medium">TV</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center gap-0.5 py-2 px-6 text-gray-400 hover:text-gray-600">
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium">Search</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 py-2 px-6 text-babyblue-600">
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
