'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Check, X, Calendar, Clock, User, Hourglass } from 'lucide-react'

interface Booking {
  id: string
  athlete_name: string
  athlete_email: string
  coach_id: string
  coach_name?: string
  session_date: string
  start_time: string
  end_time: string
  status: 'pending' | 'accepted' | 'declined'
  booked_at: string
  notes?: string
}

export default function ManageBookings() {
  const [incomingBookings, setIncomingBookings] = useState<Booking[]>([])
  const [outgoingBookings, setOutgoingBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .single()

      if (!profileData) {
        setLoading(false)
        return
      }

      // Fetch incoming bookings (where I'm the coach)
      const { data: incomingData, error: incomingError } = await supabase
        .from('booked_sessions')
        .select(`
          id,
          athlete_name,
          athlete_email,
          coach_id,
          session_date,
          start_time,
          end_time,
          status,
          booked_at,
          notes
        `)
        .eq('coach_id', profileData.id)
        .eq('status', 'pending')
        .order('booked_at', { ascending: false })

      if (incomingError) {
        console.error('Error fetching incoming sessions:', incomingError)
      }

      // Fetch outgoing bookings (where I'm the athlete)
      const { data: outgoingData, error: outgoingError } = await supabase
        .from('booked_sessions')
        .select(`
          id,
          athlete_name,
          athlete_email,
          coach_id,
          session_date,
          start_time,
          end_time,
          status,
          booked_at,
          notes
        `)
        .eq('athlete_id', profileData.id)
        .eq('status', 'pending')
        .order('booked_at', { ascending: false })

      if (outgoingError) {
        console.error('Error fetching outgoing sessions:', outgoingError)
      }

      // Fetch coach names for outgoing bookings
      let outgoingWithCoaches: Booking[] = []
      if (outgoingData && outgoingData.length > 0) {
        const coachIds = Array.from(new Set(outgoingData.map((b: any) => b.coach_id).filter(Boolean)))
        
        const { data: coachesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', coachIds)

        const coachMap = new Map(coachesData?.map((c: any) => [c.id, `${c.first_name} ${c.last_name}`]))

        outgoingWithCoaches = outgoingData.map((booking: any) => ({
          ...booking,
          coach_name: coachMap.get(booking.coach_id) || 'Coach'
        }))
      }

      setIncomingBookings(incomingData || [])
      setOutgoingBookings(outgoingWithCoaches)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const respondToBooking = async (bookingId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('booked_sessions')
        .update({
          status: accept ? 'accepted' : 'declined'
        })
        .eq('id', bookingId)

      if (error) {
        console.error('Error updating booking:', error)
        alert('Failed to update booking')
        return
      }

      fetchBookings()
      alert(accept ? 'Booking accepted!' : 'Booking declined')
    } catch (err) {
      console.error('Error:', err)
      alert('Error processing booking')
    }
  }

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('booked_sessions')
        .delete()
        .eq('id', bookingId)

      if (error) {
        console.error('Error cancelling booking:', error)
        alert('Failed to cancel booking')
        return
      }

      fetchBookings()
      alert('Booking cancelled')
    } catch (err) {
      console.error('Error:', err)
      alert('Error cancelling booking')
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time}`)
    return dateTime.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
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

  const hasIncoming = incomingBookings.length > 0
  const hasOutgoing = outgoingBookings.length > 0

  if (!hasIncoming && !hasOutgoing) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Incoming Bookings - Need Approval */}
      {hasIncoming && (
        <div className="bg-white rounded-2xl shadow-sm border border-[#51b5ff]/30 overflow-hidden">
          <div className="bg-[#51b5ff]/10 px-4 py-3 border-b border-[#51b5ff]/20">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#51b5ff]" />
              Manage Bookings
              <span className="bg-[#51b5ff] text-white text-xs px-2 py-0.5 rounded-full">
                {incomingBookings.length}
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Sessions requested by others that need your approval
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {incomingBookings.map((booking) => (
              <div key={booking.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#51b5ff]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-[#51b5ff]" />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {booking.athlete_name}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Requested a coaching session
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4" />
                      {formatDateTime(booking.session_date, booking.start_time)}
                    </div>

                    {booking.notes && (
                      <p className="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
                        Note: {booking.notes}
                      </p>
                    )}

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
      )}

      {/* Outgoing Bookings - Pending */}
      {hasOutgoing && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
          <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Hourglass className="w-5 h-5 text-amber-600" />
              Pending Requests
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                {outgoingBookings.length}
              </span>
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Sessions you've requested - waiting for approval
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {outgoingBookings.map((booking) => (
              <div key={booking.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Session with {booking.coach_name}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Waiting for approval
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(booking.session_date, booking.start_time)}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        <Hourglass className="w-3 h-3" />
                        Pending
                      </span>
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="text-sm text-red-600 hover:text-red-700 px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
