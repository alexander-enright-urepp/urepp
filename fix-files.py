#!/usr/bin/env python3
import re

# Fix subscription page
subscription_content = ''''use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Crown, Check, Star, CreditCard, Loader2, AlertTriangle, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  is_premium?: boolean
  subscription_status?: string
}

export default function SubscriptionPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelSuccess, setCancelSuccess] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, is_premium, subscription_status')
      .eq('user_id', session.user.id)
      .single()

    if (data) {
      setProfile(data)
    }
    setLoading(false)
  }

  const handleCancel = async () => {
    if (!profile) return
    
    setCancelling(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({
        is_premium: false,
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
    
    if (!error) {
      setCancelSuccess(true)
      setProfile({ ...profile, is_premium: false, subscription_status: 'cancelled' })
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
    
    setCancelling(false)
    setShowCancelConfirm(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-babyblue-500" />
      </div>
    )
  }

  const isPremium = profile?.is_premium

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-babyblue-50 hover:bg-babyblue-100 flex items-center justify-center text-babyblue-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Subscription</h1>
              <p className="text-sm text-gray-500">Manage your plan</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Current Plan */}
        <div className="bg-white rounded-2xl shadow-xl shadow-babyblue-200/50 border border-babyblue-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-babyblue-100 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-babyblue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <h2 className="text-xl font-bold text-gray-900">{isPremium ? 'Premium' : 'Free'}</h2>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500" />
              <span>Basic profile</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500" />
              <span>Search visibility</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500" />
              <span>Stats and achievements</span>
            </div>
          </div>

          {isPremium ? (
            <button 
              onClick={() => setShowCancelConfirm(true)}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel Subscription
            </button>
          ) : (
            <button className="w-full bg-babyblue-500 hover:bg-babyblue-600 text-white py-3 rounded-xl font-semibold transition-colors">
              Upgrade to Premium
            </button>
          )}
        </div>

        {/* Premium Plan */}
        {!isPremium && (
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-bold">Premium</span>
            </div>
            <p className="text-3xl font-bold mb-1">$10<span className="text-lg font-normal">/month</span></p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4" /><span>Unlimited video uploads</span></div>
              <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4" /><span>Profile analytics</span></div>
              <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4" /><span>Featured in search results</span></div>
              <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4" /><span>Verified badge</span></div>
              <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4" /><span>Priority support</span></div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="bg-white rounded-2xl shadow-sm border border-babyblue-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-babyblue-50">
            <h3 className="font-semibold text-gray-900">Payment Method</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 text-gray-500">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">No payment method on file</span>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Cancel Subscription?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                You'll lose premium features including video uploads, analytics, and your verified badge. Your profile will return to basic.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Cancelling...</>
                  ) : (
                    'Yes, Cancel Subscription'
                  )}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
                >
                  Keep Premium
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {cancelSuccess && (
          <div className="bg-green-100 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Subscription cancelled</p>
              <p className="text-sm text-green-700">Returning to dashboard...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
'''

# Write subscription page
with open('/Users/alexenright/.openclaw/workspace/urepp/app/dashboard/subscription/page.tsx', 'w') as f:
    f.write(subscription_content)

print("Subscription page updated with Cancel Subscription")
