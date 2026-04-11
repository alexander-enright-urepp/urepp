'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useNativePullToRefresh } from '@/lib/usePullToRefresh'
import { ArrowLeft, Crown, Check, Star, CreditCard, Loader2, AlertTriangle, X, ArrowRight, Smartphone } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { isIOSNative, purchaseIAPProduct, IAP_PRODUCTS } from '@/lib/iap'

interface Profile {
  id: string
  is_premium?: boolean
}

export default function SubscriptionPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [upgradingMonthly, setUpgradingMonthly] = useState(false)
  const [upgradingYearly, setUpgradingYearly] = useState(false)
  const [upgradeError, setUpgradeError] = useState<string | null>(null)
  const [isIOS, setIsIOS] = useState(false)

  // Pull to refresh for iOS
  const refreshData = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    await loadProfile()
    setLoading(false)
  }, [profile])
  
  useNativePullToRefresh(refreshData)

  useEffect(() => {
    loadProfile()
    setIsIOS(isIOSNative())
  }, [])

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/login')
      return
    }

    console.log('Looking for profile with user_id:', session.user.id)

    const { data, error } = await supabase
      .from('profiles')
      .select('id, is_premium')
      .eq('user_id', session.user.id)
      .maybeSingle() // Use maybeSingle instead of single to handle multiple rows

    if (error) {
      console.error('Supabase error:', error)
    }

    if (data) {
      console.log('Profile loaded:', data)
      setProfile(data)
    } else {
      console.log('No profile data found for user_id:', session.user.id)
    }
    setLoading(false)
  }

  const handleUpgrade = async (plan: 'monthly' | 'yearly' = 'monthly') => {
    if (plan === 'monthly') {
      setUpgradingMonthly(true)
    } else {
      setUpgradingYearly(true)
    }
    setUpgradeError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }

      // Check if iOS native app
      console.log('[Subscription] Checking platform, isIOSNative:', isIOSNative())
      if (isIOSNative()) {
        // Use IAP for iOS
        const productId = plan === 'yearly' ? IAP_PRODUCTS.YEARLY : IAP_PRODUCTS.MONTHLY
        console.log('[Subscription] Starting IAP purchase for product:', productId)
        const result = await purchaseIAPProduct(productId)
        console.log('[Subscription] IAP result:', result)
        
        if (result.success && result.receipt) {
          // Validate receipt with backend before updating state
          try {
            await fetch('/api/validate-apple-receipt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                receipt: result.receipt,
                productId,
                userId: session?.user?.id,
              }),
            })
          } catch (err) {
            console.error('[IAP] Receipt validation failed:', err)
            // Still update local state so UX isn't broken
            // Backend can retry validation on next app open
          }
          
          // Update local profile state (no page reload needed in Next.js)
          setProfile(prev => prev ? { ...prev, is_premium: true } : null)
        } else if (result.success) {
          // Success but no receipt (shouldn't happen with proper implementation)
          setProfile(prev => prev ? { ...prev, is_premium: true } : null)
        } else {
          throw new Error(result.error || 'Purchase failed')
        }
      } else {
        // Web: Use Stripe
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: session.user.id,
            email: session.user.email,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create checkout session')
        }

        if (data.url) {
          window.location.href = data.url
        } else {
          throw new Error('No checkout URL returned')
        }
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setUpgradeError(err.message || 'Something went wrong. Please try again.')
    } finally {
      if (plan === 'monthly') {
        setUpgradingMonthly(false)
      } else {
        setUpgradingYearly(false)
      }
    }
  }

  const handleCancel = async () => {
    if (!profile) return
    
    // Check if iOS native app
    if (isIOSNative()) {
      // For iOS: Direct user to App Store subscription management
      // Apple requires this - we cannot cancel subscriptions programmatically
      window.open('https://apps.apple.com/account/subscriptions', '_system')
      setShowCancelConfirm(false)
      return
    }
    
    // For web: Update Supabase (Stripe will handle the actual cancellation via webhook)
    setCancelling(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({
        is_premium: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
    
    if (!error) {
      setCancelSuccess(true)
      setProfile({ ...profile, is_premium: false })
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
  console.log('isPremium:', isPremium, 'profile:', profile)

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
              <span>Resume and achievements</span>
            </div>
          </div>

          {/* Show Cancel button only if Premium, otherwise show Upgrade */}
          {isPremium ? (
            <button 
              onClick={() => setShowCancelConfirm(true)}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel Subscription
            </button>
          ) : (
            <div className="text-sm text-gray-500 mt-2">
              Upgrade below to unlock premium features
            </div>
          )}
        </div>

        {/* Premium Plan Benefits - Now with Pay button inside */}
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-bold">{isPremium ? 'Your Premium Features' : 'Upgrade to Premium'}</span>
          </div>
          <p className="text-3xl font-bold mb-1">{isPremium ? 'Active' : '$10'}<span className="text-lg font-normal">{isPremium ? '' : '/month'}</span></p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4" /><span>Unlimited video uploads</span></div>
            <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4" /><span>Profile analytics</span></div>
            <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4" /><span>Featured in search results</span></div>
            <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4" /><span>Verified badge</span></div>
            <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4" /><span>Priority support</span></div>
          </div>
          
          {/* Pay button moved to gold box */}
          {!isPremium && (
            <button
              onClick={() => handleUpgrade('monthly')}
              disabled={upgradingMonthly}
              className="w-full bg-white text-yellow-600 hover:bg-gray-100 disabled:opacity-70 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              {upgradingMonthly ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Processing...</>
              ) : (
                <>Subscribe</>
              )}
            </button>
          )}
        </div>

        {/* Annual Plan - Baby Blue Box */}
        {!isPremium && (
          <div className="bg-gradient-to-br from-babyblue-400 to-babyblue-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-bold">Save with Annual</span>
            </div>
            <p className="text-lg font-medium mb-1">Get full access by paying $100/year and save $20.</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4" /><span>All premium features</span></div>
              <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4" /><span>Save $20 vs monthly</span></div>
              <div className="flex items-center gap-2 text-sm"><Check className="w-4 h-4" /><span>Billed annually</span></div>
            </div>
            
            <button
              onClick={() => handleUpgrade('yearly')}
              disabled={upgradingYearly}
              className="w-full bg-white text-babyblue-600 hover:bg-gray-100 disabled:opacity-70 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              {upgradingYearly ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Processing...</>
              ) : (
                <>Start Annual Plan</>
              )}
            </button>
          </div>
        )}

        {/* Upgrade Error Message */}
        {upgradeError && (
          <div className="bg-red-100 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Payment Error</p>
              <p className="text-sm text-red-700">{upgradeError}</p>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              {isIOSNative() ? (
                <>
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Manage Subscription</h3>
                  <p className="text-sm text-gray-500 text-center mb-6">
                    You'll be taken to the App Store to manage your subscription. 
                    Apple handles all subscription cancellations directly.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Cancel Subscription?</h3>
                  <p className="text-sm text-gray-500 text-center mb-6">
                    You'll lose premium features including video uploads, analytics, and your verified badge. 
                    Your profile will return to basic.
                  </p>
                </>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Processing...</>
                  ) : (
                    isIOSNative() ? 'Open App Store Settings' : 'Yes, Cancel Subscription'
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

        {/* Subscription Details - Required by Apple */}
        <div className="bg-white/50 rounded-2xl p-6 border border-babyblue-100">
          <h3 className="font-semibold text-gray-900 mb-3">Subscription Information</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Monthly Plan:</strong> $9.99/month, auto-renews monthly</p>
            <p><strong>Yearly Plan:</strong> $99.99/year, auto-renews yearly (save $20)</p>
            <p>Payment will be charged to your Apple ID account at confirmation of purchase.</p>
            <p>Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.</p>
            <p>Your account will be charged for renewal within 24 hours prior to the end of the current period.</p>
            <p>You can manage and cancel your subscriptions by going to your account settings on the App Store after purchase.</p>
          </div>
        </div>

        {/* Legal Links - Required by Apple */}
        <div className="text-center space-y-2 py-4">
          <a 
            href="https://www.urepp.app/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-babyblue-600 hover:text-babyblue-700 underline"
          >
            Terms of Use (EULA)
          </a>
          <span className="text-gray-400 mx-2">•</span>
          <a 
            href="https://www.urepp.app/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-babyblue-600 hover:text-babyblue-700 underline"
          >
            Privacy Policy
          </a>
        </div>
      </main>
    </div>
  )
}
