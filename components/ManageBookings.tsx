'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Check, X, Calendar, Clock, User } from 'lucide-react'

interface Booking {
  id: string
  requested_by_name: string
  athlete_name: string
  coach_name: string
  session_date: string
  start_time: string
  end_time: string
  status: 'pending' | 'accepted' | 'declined'
  booked_at: string
  notes?: string
}

export default function ManageBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
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
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profileData) {
        setLoading(false)
        return
      }

      // Fetch pending appointments where I'm the recipient (someone requested me)
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          requested_by_name,
          athlete_name,
          coach_name,
          session_date,
          start_time,
          end_time,
          status,
          booked_at,
          notes
        `)
        .eq('recipient_id', profileData.id)
        .eq('status', 'pending')
        .order('booked_at', { ascending: false })

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError)
        setLoading(false)
        return
      }

      setBookings(appointmentsData || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const respondToBooking = async (bookingId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: accept ? 'accepted' : 'declined'
          // responded_at will auto-update via trigger
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
        <p className="text-xs text-gray-500 mt-1">
          Sessions requested by others that need your approval
        </p>
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
                  {booking.requested_by_name || booking.athlete_name}
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
  )
}
