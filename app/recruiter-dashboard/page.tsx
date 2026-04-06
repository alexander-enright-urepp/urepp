'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  Filter,
  Star,
  Mail,
  Crown,
  Lock,
  Loader2,
  LogOut,
  MapPin,
  GraduationCap,
  Trophy,
  X,
  Check,
  Building2,
  ChevronRight
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const PRIMARY_BLUE = '#51b5ff'

interface Athlete {
  id: string
  first_name: string
  last_name: string
  username: string
  profile_picture_url?: string
  high_school_sports?: string[]
  grad_year?: number
  hometown?: string
  state?: string
  high_school?: string
}

interface RecruiterProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  recruiter_approved: boolean
  recruiter_paid: boolean
  organization?: string
  role: string
}

export default function RecruiterDashboard() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [profile, setProfile] = useState<RecruiterProfile | null>(null)
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    sport: '',
    gradYear: '',
  })
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [savedAthletes, setSavedAthletes] = useState<string[]>([])

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  const checkAuthAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/recruiter-login')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (profileError || !profileData) {
        router.push('/recruiter-login')
        return
      }

      if (profileData.role !== 'recruiter') {
        await supabase.auth.signOut()
        router.push('/recruiter-login')
        return
      }

      if (!profileData.recruiter_approved) {
        router.push('/recruiter-login?message=pending')
        return
      }

      setProfile(profileData)

      const { data: athletesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, username, profile_picture_url, high_school_sports, grad_year, hometown, state, high_school')
        .eq('role', 'athlete')
        .order('created_at', { ascending: false })
        .limit(profileData.recruiter_paid ? 100 : 5)

      if (athletesData) {
        setAthletes(athletesData as Athlete[])
      }

      const { data: savedData } = await supabase
        .from('recruiter_saved_athletes')
        .select('athlete_id')
        .eq('recruiter_id', profileData.id)

      if (savedData) {
        setSavedAthletes(savedData.map(s => s.athlete_id))
      }

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/recruiter-login')
  }

  const initiateCheckout = async () => {
    if (!profile) return
    
    setProcessingPayment(true)
    try {
      const response = await fetch('/api/create-recruiter-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recruiterId: profile.id,
          email: profile.email
        })
      })

      const { sessionId, error } = await response.json()
      
      if (error) throw new Error(error)

      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`
    } catch (error: any) {
      alert('Payment error: ' + error.message)
    } finally {
      setProcessingPayment(false)
    }
  }

  const toggleSaveAthlete = async (athleteId: string) => {
    if (!profile?.recruiter_paid) {
      setShowPaymentModal(true)
      return
    }

    const isSaved = savedAthletes.includes(athleteId)
    
    if (isSaved) {
      await supabase
        .from('recruiter_saved_athletes')
        .delete()
        .eq('recruiter_id', profile.id)
        .eq('athlete_id', athleteId)
      
      setSavedAthletes(prev => prev.filter(id => id !== athleteId))
    } else {
      await supabase
        .from('recruiter_saved_athletes')
        .insert({ recruiter_id: profile.id, athlete_id: athleteId })
      
      setSavedAthletes(prev => [...prev, athleteId])
    }
  }

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = searchQuery === '' || 
      `${athlete.first_name} ${athlete.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.high_school?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSport = filters.sport === '' || 
      athlete.high_school_sports?.includes(filters.sport)
    
    const matchesGradYear = filters.gradYear === '' || 
      athlete.grad_year?.toString() === filters.gradYear

    return matchesSearch && matchesSport && matchesGradYear
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: PRIMARY_BLUE }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-50">
        <Link href="/recruiter-dashboard" className="flex items-center gap-1">
          <span className="font-bold text-lg" style={{ color: PRIMARY_BLUE }}>UREPP</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Recruiters</span>
        </Link>
        
        <div className="flex items-center gap-2">
          {!profile?.recruiter_paid && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: PRIMARY_BLUE + '20', color: PRIMARY_BLUE }}
            >
              <Crown className="w-3 h-3" />
              Upgrade
            </button>
          )}
          {profile?.recruiter_paid && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium">
              <Check className="w-3 h-3" />
              Premium
            </div>
          )}
          <button onClick={handleSignOut} className="p-2 text-gray-500">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4">
        {/* Welcome */}
        <div className="mb-4">
          <h1 className="text-lg font-bold text-gray-900">
            Welcome, {profile?.first_name}
          </h1>
          <p className="text-sm text-gray-500">
            {profile?.organization || 'Find your next athlete'}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search athletes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#51b5ff] focus:ring-2 focus:ring-[#51b5ff]/20 outline-none transition-all text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <select
            value={filters.sport}
            onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white whitespace-nowrap"
          >
            <option value="">All Sports</option>
            <option value="Basketball">Basketball</option>
            <option value="Football">Football</option>
            <option value="Soccer">Soccer</option>
            <option value="Baseball">Baseball</option>
            <option value="Volleyball">Volleyball</option>
          </select>

          <select
            value={filters.gradYear}
            onChange={(e) => setFilters({ ...filters, gradYear: e.target.value })}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white whitespace-nowrap"
          >
            <option value="">All Classes</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>
        </div>

        {/* Free User Banner */}
        {!profile?.recruiter_paid && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">Limited Preview</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Showing {athletes.length} athletes. Unlock all features.
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ background: PRIMARY_BLUE }}
              >
                Unlock
              </button>
            </div>
          </div>
        )}

        {/* Athletes List */}
        <div className="space-y-3">
          {filteredAthletes.map((athlete) => (
            <div
              key={athlete.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                  {athlete.profile_picture_url ? (
                    <img
                      src={athlete.profile_picture_url}
                      alt={`${athlete.first_name} ${athlete.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold" style={{ color: PRIMARY_BLUE }}>
                      {athlete.first_name?.[0]}{athlete.last_name?.[0]}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {athlete.first_name} {athlete.last_name}
                  </h3>
                  
                  {athlete.high_school_sports?.[0] && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Trophy className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{athlete.high_school_sports[0]}</span>
                    </div>
                  )}
                  
                  {athlete.grad_year && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">Class of {athlete.grad_year}</span>
                    </div>
                  )}
                  
                  {(athlete.hometown || athlete.state) && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {[athlete.hometown, athlete.state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleSaveAthlete(athlete.id)}
                    className={`p-1.5 rounded-lg ${
                      savedAthletes.includes(athlete.id)
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${savedAthletes.includes(athlete.id) ? 'fill-current' : ''}`} />
                  </button>
                  
                  {profile?.recruiter_paid ? (
                    <Link
                      href={`/players/${athlete.username}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-white"
                      style={{ background: PRIMARY_BLUE }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="p-1.5 rounded-lg bg-gray-100 text-gray-400"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAthletes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No athletes found</p>
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Unlock Full Access</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-1">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4">
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-gray-900">$49</span>
                <span className="text-gray-500">/month</span>
              </div>

              <ul className="space-y-2 mb-4">
                {[
                  'Unlimited athlete search',
                  'Advanced filters',
                  'View full profiles',
                  'Save & bookmark',
                  'Direct contact'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={initiateCheckout}
                disabled={processingPayment}
                className="w-full text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                style={{ background: PRIMARY_BLUE }}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Cancel anytime. Secure via Stripe.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
