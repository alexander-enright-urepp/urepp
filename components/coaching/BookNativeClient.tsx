'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Loader2, Check, Home, Tv, Search, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture_url?: string;
  email?: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface BookNativeClientProps {
  coachId: string;
}

export default function BookNativeClient({ coachId }: BookNativeClientProps) {
  const router = useRouter();
  const [coach, setCoach] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate dates for next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
    return dates;
  };

  const dates = generateDates();

  const timeSlots: TimeSlot[] = [
    { id: '1', time: '9:00 AM', available: true },
    { id: '2', time: '10:00 AM', available: true },
    { id: '3', time: '11:00 AM', available: true },
    { id: '4', time: '1:00 PM', available: true },
    { id: '5', time: '2:00 PM', available: true },
    { id: '6', time: '3:00 PM', available: true },
    { id: '7', time: '4:00 PM', available: true },
    { id: '8', time: '5:00 PM', available: true },
  ];

  useEffect(() => {
    const fetchData = async () => {
      // Fetch coach profile
      const { data: coachData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', coachId)
        .single();
      
      if (coachData) {
        setCoach(coachData);
      }

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        // Fetch current user's profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('user_id', user.id)
          .single();
        
        setCurrentProfile(userProfile);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [coachId]);

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;
    
    // Check auth
    if (!currentUser || !currentProfile) {
      // Store booking intent in localStorage and redirect to login
      localStorage.setItem('booking_redirect', JSON.stringify({
        coachId,
        date: selectedDate,
        time: selectedTime,
        returnUrl: window.location.pathname
      }));
      router.push('/login');
      return;
    }
    
    setBooking(true);
    setError(null);
    
    try {
      // Parse time
      const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) {
        throw new Error('Invalid time format');
      }
      
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2];
      const ampm = timeMatch[3].toUpperCase();
      
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      
      const startTime = `${hours.toString().padStart(2, '0')}:${minutes}:00`;
      
      // Calculate end time (1 hour later)
      let endHours = hours + 1;
      if (endHours === 24) endHours = 0;
      const endTime = `${endHours.toString().padStart(2, '0')}:${minutes}:00`;
      
      // Insert into booked_sessions
      const { data: bookingData, error: bookingError } = await supabase
        .from('booked_sessions')
        .insert({
          coach_id: coachId,
          athlete_id: currentProfile.id,
          athlete_name: `${currentProfile.first_name} ${currentProfile.last_name}`,
          athlete_email: currentProfile.email || currentUser.email,
          session_date: selectedDate,
          start_time: startTime,
          end_time: endTime,
          status: 'pending',
          booked_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (bookingError) {
        throw bookingError;
      }
      
      setBooked(true);
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to book session');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">Coach not found</p>
          <Link href="/search" className="text-blue-600 hover:underline">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  // Login prompt if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
            <Link href={`/players/${coach.username}`} className="p-2 -ml-2 text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="font-semibold text-gray-900">Book Session</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-[#51b5ff]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-[#51b5ff]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h1>
            <p className="text-gray-600 mb-6">
              Please sign in to book a session with {coach.first_name} {coach.last_name}.
            </p>
            <div className="space-y-3">
              <Link
                href={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                className="w-full block py-3 bg-[#51b5ff] text-white rounded-xl font-semibold text-center hover:bg-blue-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href={`/players/${coach.username}`}
                className="w-full block py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Sent!</h1>
            <p className="text-gray-600 mb-6">
              Your session request with {coach.first_name} {coach.last_name} for {selectedDate} at {selectedTime} has been sent. You'll be notified when they confirm.
            </p>
            <button
              onClick={() => router.push('/dashboard/coaches')}
              className="w-full py-3 bg-[#51b5ff] text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/players/${coach.username}`} className="p-2 -ml-2 text-gray-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-semibold text-gray-900">Book Session</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Coach Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-4">
            {coach.profile_picture_url ? (
              <img
                src={coach.profile_picture_url}
                alt=""
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#51b5ff] to-blue-600 flex items-center justify-center text-white font-bold">
                {coach.first_name?.[0]}{coach.last_name?.[0]}
              </div>
            )}
            <div>
              <h2 className="font-bold text-gray-900">{coach.first_name} {coach.last_name}</h2>
              <p className="text-sm text-gray-500">Mental Performance Coach</p>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#51b5ff]" />
            Select Date
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {dates.map((date) => (
              <button
                key={date.value}
                onClick={() => {
                  setSelectedDate(date.value);
                  setSelectedTime('');
                }}
                className={`flex-shrink-0 px-4 py-3 rounded-xl text-center min-w-[80px] border transition-colors ${
                  selectedDate === date.value
                    ? 'bg-[#51b5ff] text-white border-[#51b5ff]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#51b5ff]'
                }`}
              >
                <div className="text-xs font-medium">{date.label.split(' ')[0]}</div>
                <div className="text-lg font-bold">{date.label.split(' ')[2]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#51b5ff]" />
              Select Time
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`py-3 px-4 rounded-xl font-medium transition-colors ${
                    selectedTime === slot.time
                      ? 'bg-[#51b5ff] text-white'
                      : slot.available
                      ? 'bg-white text-gray-700 border border-gray-200 hover:border-[#51b5ff]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Book Button */}
        <button
          onClick={handleBook}
          disabled={!selectedDate || !selectedTime || booking}
          className="w-full py-4 bg-[#51b5ff] text-white rounded-xl font-semibold text-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {booking ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Booking...
            </>
          ) : (
            `Confirm Booking`
          )}
        </button>
      </div>
    </div>
  );
}
