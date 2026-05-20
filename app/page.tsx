'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Dynamically import components to avoid SSR issues
const DesktopLandingPage = dynamic(() => import('@/components/DesktopLandingPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#51b5ff]/5 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#51b5ff]"></div>
    </div>
  )
})

const MobileApp = dynamic(() => import('@/components/MobileAppHome'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-babyblue-500"></div>
    </div>
  )
})

export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      
      // Check if running in Capacitor native app - ALWAYS show mobile app
      const isCapacitorNative = typeof (window as any).Capacitor !== 'undefined' && 
                                (window as any).Capacitor?.isNativePlatform?.()
      
      if (isCapacitorNative) {
        console.log('[Device Detection] Capacitor native app detected - showing mobile app')
        setIsMobile(true)
        return
      }
      
      // PHONES: iPhone, Android phones, etc. - exclude tablets
      const isPhone = /iPhone|iPod/.test(userAgent) || 
                      (/Android/.test(userAgent) && /Mobile/.test(userAgent)) ||
                      /webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      
      // TABLETS: iPad, Android tablets, touch devices that aren't phones
      // iPad reports as iPad in older versions, as Macintosh in iPadOS 13+
      // Android tablets don't have "Mobile" in UA
      const isTablet = /iPad/.test(userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                       (/Android/.test(userAgent) && !/Mobile/.test(userAgent))
      
      // Touch-capable devices (any size) that aren't traditional laptops/desktops
      const hasTouch = navigator.maxTouchPoints > 0
      const screenWidth = window.screen.width
      const screenHeight = window.screen.height
      const smallerScreenDimension = Math.min(screenWidth, screenHeight)
      
      // If it has touch AND screen is tablet-sized or smaller, treat as mobile
      const isTouchDevice = hasTouch && smallerScreenDimension < 1400
      
      console.log('[Device Detection]', {
        userAgent: userAgent.substring(0, 60),
        isPhone,
        isTablet,
        isTouchDevice,
        screenWidth,
        screenHeight,
        maxTouchPoints: navigator.maxTouchPoints
      })
      
      // Show mobile app for: phones, tablets, and any touch device (not desktop)
      // Desktop/laptops ALWAYS get landing page
      const shouldShowMobile = isPhone || isTablet || isTouchDevice
      
      setIsMobile(shouldShowMobile)
    }

    checkDevice()
    
    // Add resize listener for orientation changes on tablets
    const handleResize = () => {
      checkDevice()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Show loading state while detecting
  if (isMobile === null) {
    return (
      <div className="min-h-screen bg-[#51b5ff]/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#51b5ff]"></div>
      </div>
    )
  }

  // Desktop: Show landing page
  // Mobile/Tablet: Show app
  return isMobile ? <MobileApp /> : <DesktopLandingPage />
}
