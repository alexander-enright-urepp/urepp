"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { MobileDashboard } from "@/components/MobileDashboard"
import { MobileLogin } from "@/components/MobileLogin"

export default function MobileApp() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-babyblue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return session ? <MobileDashboard /> : <MobileLogin />
}