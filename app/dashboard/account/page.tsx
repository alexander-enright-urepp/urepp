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
  Tv,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { restorePurchases } from '@/lib/iap'

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

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Restore purchases state
  const [restoring, setRestoring] = useState(false)
  const [restoreMessage, setRestoreMessage] = useState('')

  const handleRestorePurchases = async () => {
    setRestoring(true)
    setRestoreMessage('')
    
    // IAP DISABLED for App Store submission
    setRestoreMessage('In-app purchases are temporarily disabled.')
    setRestoring(false)
    return
    
    /*
    try {
      const result = await restorePurchases()
      if (result.success) {
        setRestoreMessage('Purchases restored successfully!')
      } else {
        setRestoreMessage(result.error || 'No purchases found to restore.')
      }
    } catch (err: any) {
      setRestoreMessage(err.message || 'Failed to restore purchases.')
    } finally {
      setRestoring(false)
    }
    */
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setDeleteError('Not logged in')
        setDeleting(false)
        return
      }

      // Call the soft delete function
      const { error } = await supabase.rpc('soft_delete_user', {
        user_uuid: user.id
      })

      if (error) {
        console.error('Delete error:', error)
        setDeleteError('Failed to delete account. Please try again.')
        setDeleting(false)
        return
      }

      // Sign out after successful deletion
      await supabase.auth.signOut()
      
      // Redirect to home
      router.push('/')
      
    } catch (err: any) {
      console.error('Delete error:', err)
      setDeleteError(err.message || 'Failed to delete account')
      setDeleting(false)
    }
  }

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

        {/* Restore Purchases Section - iOS only
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" id="restore-section">
          <div className="px-4 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Subscription</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-4">
              If you previously purchased a subscription, restore it here.
            </p>
            <button
              id="restore-purchases-btn"
              onClick={handleRestorePurchases}
              disabled={restoring}
              className="w-full py-3 px-4 bg-babyblue-500 hover:bg-babyblue-600 disabled:bg-babyblue-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {restoring ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Restoring...</>
              ) : (
                <><Key className="w-5 h-5" />Restore Purchases</>
              )}
            </button>
            {restoreMessage && (
              <p id="restore-message" className="text-sm mt-2 text-center text-gray-600">
                {restoreMessage}
              </p>
            )}
          </div>
        </div>
        */}

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

        {/* Delete Account Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
          <div className="px-4 py-4 border-b border-red-100">
            <h3 className="font-semibold text-red-600">Danger Zone</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-red-300"
            >
              <Trash2 className="w-5 h-5" />
              Delete Account
            </button>
          </div>
        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Account?</h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                This will permanently delete your account, profile, and all data. You will not be able to log in again.
              </p>
              
              {deleteError && (
                <p className="text-sm text-red-600 text-center mb-4">{deleteError}</p>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Deleting...</>
                  ) : (
                    'Yes, Delete My Account'
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
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
