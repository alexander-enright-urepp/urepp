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
      
      // Check for mobile devices
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      
      // Check screen size - tablets and smaller should see mobile app
      const isSmallScreen = window.innerWidth < 1024
      
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkDevice()
    
    // Update on resize
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
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
