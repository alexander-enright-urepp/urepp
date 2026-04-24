'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Preferences } from '@capacitor/preferences'

interface AgeVerificationState {
  isVerified: boolean
  isLoading: boolean
  showGate: boolean
  needsReconsent: boolean
}

const CURRENT_APP_VERSION = '1.0.0' // Update this when terms change
const AGE_VERIFIED_KEY = 'urepp_age_verified'
const CONSENT_VERSION_KEY = 'urepp_consent_version'

export function useAgeVerification() {
  const [state, setState] = useState<AgeVerificationState>({
    isVerified: false,
    isLoading: true,
    showGate: false,
    needsReconsent: false,
  })

  const checkVerification = useCallback(async () => {
    try {
      // Check local storage first (Capacitor Preferences for native)
      const { value: localVerified } = await Preferences.get({ key: AGE_VERIFIED_KEY })
      const { value: consentVersion } = await Preferences.get({ key: CONSENT_VERSION_KEY })

      // If never verified or storage cleared, show gate
      if (!localVerified) {
        setState(prev => ({ ...prev, showGate: true, isLoading: false }))
        return
      }

      // Check if app version changed (requires re-consent)
      if (consentVersion && consentVersion !== CURRENT_APP_VERSION) {
        setState(prev => ({ 
          ...prev, 
          showGate: true, 
          needsReconsent: true,
          isLoading: false 
        }))
        return
      }

      // Verify with server (in case user cleared local but not DB)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('age_verified, consent_app_version')
          .eq('user_id', session.user.id)
          .single()

        if (profile?.age_verified) {
          // Check if server version matches current
          if (profile.consent_app_version !== CURRENT_APP_VERSION) {
            setState(prev => ({ 
              ...prev, 
              showGate: true, 
              needsReconsent: true,
              isLoading: false 
            }))
            return
          }

          setState(prev => ({ 
            ...prev, 
            isVerified: true, 
            showGate: false,
            isLoading: false 
          }))
        } else {
          setState(prev => ({ ...prev, showGate: true, isLoading: false }))
        }
      } else {
        // No session - show gate but allow anonymous browsing
        setState(prev => ({ 
          ...prev, 
          isVerified: localVerified === 'true',
          showGate: !localVerified,
          isLoading: false 
        }))
      }
    } catch (error) {
      console.error('Age verification check failed:', error)
      setState(prev => ({ ...prev, showGate: true, isLoading: false }))
    }
  }, [])

  const verifyAge = useCallback(async (dateOfBirth: Date): Promise<boolean> => {
    try {
      const today = new Date()
      const birthDate = new Date(dateOfBirth)
      let age = today.getFullYear() - birthDate.getFullYear()
      
      // Adjust age if birthday hasn't occurred this year
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      return age >= 13
    } catch {
      return false
    }
  }, [])

  const completeVerification = useCallback(async (dateOfBirth: Date) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Use the database function
        const { data, error } = await supabase.rpc('verify_user_age', {
          user_uuid: session.user.id,
          birth_date: dateOfBirth.toISOString().split('T')[0],
          app_version: CURRENT_APP_VERSION
        })

        if (error) throw error
        if (!data) return false
      }

      // Store locally
      await Preferences.set({ key: AGE_VERIFIED_KEY, value: 'true' })
      await Preferences.set({ key: CONSENT_VERSION_KEY, value: CURRENT_APP_VERSION })

      setState(prev => ({ 
        ...prev, 
        isVerified: true, 
        showGate: false,
        needsReconsent: false 
      }))

      return true
    } catch (error) {
      console.error('Failed to complete verification:', error)
      return false
    }
  }, [])

  const clearVerification = useCallback(async () => {
    await Preferences.remove({ key: AGE_VERIFIED_KEY })
    await Preferences.remove({ key: CONSENT_VERSION_KEY })
    setState(prev => ({ ...prev, isVerified: false, showGate: true }))
  }, [])

  useEffect(() => {
    checkVerification()
  }, [checkVerification])

  return {
    ...state,
    verifyAge,
    completeVerification,
    clearVerification,
    currentAppVersion: CURRENT_APP_VERSION,
  }
}