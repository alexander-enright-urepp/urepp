'use client'

import { useEffect } from 'react'
import { UREPPApp } from '@/lib/ios-bridge'
import { initializeIAP } from '@/lib/iap'
import { initNotifications } from '@/lib/onesignal'

export default function AppInit() {
  useEffect(() => {
    // Initialize iOS app features and IAP on startup
    if (typeof window !== 'undefined') {
      UREPPApp.init().catch(console.error)
      initializeIAP().catch(console.error)
      initNotifications() // Initialize OneSignal push notifications
    }
  }, [])

  return null
}
