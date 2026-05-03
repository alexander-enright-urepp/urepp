'use client'

import { useEffect, useState } from 'react'

export default function AppInit() {
  const [initStatus, setInitStatus] = useState<string>('checking...')

  useEffect(() => {
    const init = async () => {
      try {
        // Check if we're in a native Capacitor context
        const isNative = typeof window !== 'undefined' && 
                         (window as any).Capacitor && 
                         (window as any).Capacitor.isNativePlatform &&
                         (window as any).Capacitor.isNativePlatform()
        
        console.log('[AppInit] Is native app:', isNative)
        setInitStatus(`native: ${isNative}`)
        
        if (!isNative) {
          console.log('[AppInit] Not in native app, skipping native init')
          return
        }
        
        // Dynamically import to avoid errors on web
        const [{ UREPPApp }, { initializeIAP }, { initNotifications }] = await Promise.all([
          import('@/lib/ios-bridge'),
          import('@/lib/iap'),
          import('@/lib/onesignal')
        ])
        
        console.log('[AppInit] Starting native app initialization...')
        
        // Initialize iOS app features
        await UREPPApp.init().catch((e: any) => {
          console.error('[AppInit] UREPPApp.init failed:', e)
        })
        
        // IAP temporarily disabled - causing Application Error
        // await initializeIAP().catch((e: any) => {
        //   console.error('[AppInit] IAP init failed:', e)
        // })
        
        // Initialize notifications
        initNotifications()
        
        console.log('[AppInit] Native app initialization complete')
        setInitStatus('complete')
        
      } catch (error: any) {
        console.error('[AppInit] Critical error:', error)
        setInitStatus(`error: ${error.message}`)
      }
    }

    // Delay init to allow Capacitor bridge to inject
    const timer = setTimeout(init, 500)
    return () => clearTimeout(timer)
  }, [])

  // Debug indicator (only visible in development)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '4px 8px',
        fontSize: '10px',
        zIndex: 9999,
        fontFamily: 'monospace'
      }}>
        init: {initStatus}
      </div>
    )
  }

  return null
}
