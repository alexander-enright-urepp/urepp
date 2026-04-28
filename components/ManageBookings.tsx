'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Check, X, Calendar, Clock, User } from 'lucide-react'

interface Booking {
  id: string
  athlete_name: string
  coach_name: string
  scheduled_at: string
  status: 'pending' | 'accepted' | 'declined'
  requested_by: string
  requested_by_name: string
  profile_id: string
  other_profile_id: string
}

export default function ManageBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      // First try appointments table (new structure after SQL)
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          athlete_name,
          coach_name,
          scheduled_at,
          status,
          requested_by,
          profile_id,
          other_profile_id
        `)
        .or(`profile_id.eq.${user.id},other_profile_id.eq.${user.id}`)
        .eq('status', 'pending')

      if (!appointmentsError && appointmentsData) {
        // New table exists - use it
        const pendingForMe = appointmentsData.filter((appt: any) => {
          return appt.requested_by !== user.id
        }) || []

        const bookingsWithNames = await Promise.all(
          pendingForMe.map(async (appt: any) => {
            const { data: requester } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('user_id', appt.requested_by)
              .single()

            return {
              ...appt,
              requested_by_name: requester 
                ? `${requester.first_name} ${requester.last_name}`
                : 'Unknown User'
            }
          })
        )

        setBookings(bookingsWithNames)
        setLoading(false)
        return
      }

      // Fallback: Try booked_sessions (current structure before SQL)
      const { data: { user: userData } } = await supabase.auth.getUser()
      if (!userData) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userData.id)
        .single()

      if (!profileData) return

      // For local testing without SQL - show all sessions as pending
      // This simulates the Manage Bookings flow
      const { data: sessionsData } = await supabase
        .from('booked_sessions')
        .select('*')
        .or(`coach_id.eq.${profileData.id},athlete_id.eq.${profileData.id}`)
        .order('session_date', { ascending: true })

      if (sessionsData) {
        const formatted: Booking[] = sessionsData.map((s: any) => ({
          id: s.id,
          athlete_name: s.athlete_name,
          coach_name: s.coach_name || 'Coach',
          scheduled_at: `${s.session_date}T${s.start_time}`,
          status: 'pending' as const,
          requested_by: s.athlete_id,
          requested_by_name: s.athlete_name,
          profile_id: s.coach_id,
          other_profile_id: s.athlete_id
        }))

        setBookings(formatted.filter((b: any) => b.other_profile_id === profileData.id))
      }

    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const respondToBooking = async (bookingId: string, accept: boolean) => {
    try {
      // First try appointments table (new structure)
      const { error: appointmentsError } = await supabase
        .from('appointments')
        .update({
          status: accept ? 'accepted' : 'declined',
          responded_at: new Date().toISOString()
        })
        .eq('id', bookingId)

      if (!appointmentsError) {
        // Success with new table
        fetchBookings()
        return
      }

      // Fallback: Update booked_sessions (mark as cancelled if declined)
      if (!accept) {
        await supabase
          .from('booked_sessions')
          .delete()
          .eq('id', bookingId)
      }

      // Refresh bookings
      fetchBookings()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#51b5ff]"></div>
        </div>
      </div>
    )
  }

  if (bookings.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#51b5ff]/30 overflow-hidden mb-4">
      <div className="bg-[#51b5ff]/10 px-4 py-3 border-b border-[#51b5ff]/20">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#51b5ff]" />
          Manage Bookings
          <span className="bg-[#51b5ff] text-white text-xs px-2 py-0.5 rounded-full">
            {bookings.length}
          </span>
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {bookings.map((booking) => (
          <div key={booking.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#51b5ff]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#51b5ff]" />
              </div>

              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {booking.requested_by_name}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Requested a session with you
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Clock className="w-4 h-4" />
                  {new Date(booking.scheduled_at).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => respondToBooking(booking.id, true)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => respondToBooking(booking.id, false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
