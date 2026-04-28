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
}

interface AthleteProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookSessionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  const [coach, setCoach] = useState<Profile | null>(null);
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null);
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate next 14 days
  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        dayOfWeek: date.getDay()
      });
    }
    return dates;
  };

  // Listen for auth state changes
  useEffect(() => {
    console.log('Book-native: Setting up auth listener');
    let authCheckTimeout: NodeJS.Timeout;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Book-native: Auth event:', event, 'hasSession:', !!session);
        
        // Clear timeout if we get an auth event
        if (authCheckTimeout) clearTimeout(authCheckTimeout);
        
        if (session?.user) {
          console.log('Book-native: User authenticated:', session.user.id);
          setAuthState('authenticated');
          
          // Get coach
          const { data: coachData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, username, profile_picture_url')
            .eq('id', params.id)
            .single();
          
          if (coachData) {
            console.log('Book-native: Coach found:', coachData.first_name);
            setCoach(coachData);
          }

          // Get athlete profile
          const { data: athleteData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .eq('user_id', session.user.id)
            .single();
          
          if (athleteData) {
            console.log('Book-native: Athlete profile found:', athleteData.first_name);
            setAthleteProfile({
              ...athleteData,
              email: session.user.email || ''
            });
          }
        } else if (event === 'INITIAL_SESSION') {
          // Wait a bit and check again - session might still be loading
          console.log('Book-native: Initial session null, waiting...');
          authCheckTimeout = setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            console.log('Book-native: Retry session check:', !!retrySession);
            if (!retrySession?.user) {
              setAuthState('unauthenticated');
            }
          }, 1500);
        } else {
          console.log('Book-native: No session, showing sign in');
          setAuthState('unauthenticated');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (authCheckTimeout) clearTimeout(authCheckTimeout);
    };
  }, [params.id, supabase]);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    // Generate ALL time slots (9 AM to 5 PM, 30 min intervals)
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let min of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        slots.push({ time, available: true });
      }
    }
    setAvailableSlots(slots);
  }, [selectedDate]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !athleteProfile) {
      setError('Please sign in to book a session');
      return;
    }

    setSubmitting(true);

    // Parse time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const endHour = minutes === 30 ? hours + 1 : hours;
    const endMinutes = minutes === 30 ? 0 : 30;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    // Insert into appointments table with approval workflow
    const { error } = await supabase
      .from('appointments')
      .insert({
        requested_by: athleteProfile.id,
        requested_by_name: `${athleteProfile.first_name} ${athleteProfile.last_name}`,
        recipient_id: params.id, // Coach needs to approve
        athlete_id: athleteProfile.id,
        athlete_name: `${athleteProfile.first_name} ${athleteProfile.last_name}`,
        athlete_email: athleteProfile.email,
        coach_id: params.id,
        coach_name: coach ? `${coach.first_name} ${coach.last_name}` : '',
        session_date: selectedDate,
        start_time: selectedTime,
        end_time: endTime,
        status: 'pending',
        booked_at: new Date().toISOString()
      });

    if (error) {
      console.error('Booking error:', error);
      setError('Failed to book session');
    } else {
      setSuccess(true);
    }
    setSubmitting(false);
  };

  // Loading state
  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#51b5ff]" />
      </div>
    );
  }

  // Not signed in - show sign in prompt
  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to book a session{coach ? ` with ${coach.first_name}` : ''}.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href={`/login?redirect=/coaches/${params.id}/book-native`}
              className="inline-block bg-[#51b5ff] hover:bg-[#3da8f0] text-white px-6 py-3 rounded-xl font-medium"
            >
              Sign In to Book
            </Link>
            <Link 
              href="/search"
              className="inline-block text-gray-500 hover:text-gray-700 px-6 py-3"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link 
            href="/login"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Coach not found</p>
      </div>
    );
  }

  if (success) {
    // Calculate end time for display
    const [successHours, successMinutes] = selectedTime.split(':').map(Number);
    const successEndHour = successMinutes === 30 ? successHours + 1 : successHours;
    const successEndMinutes = successMinutes === 30 ? 0 : 30;
    const displayEndTime = `${successEndHour.toString().padStart(2, '0')}:${successEndMinutes.toString().padStart(2, '0')}`;
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Booked!</h2>
          <p className="text-gray-600 mb-6">
            Your session with {coach.first_name} {coach.last_name} is confirmed.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <p className="text-lg font-semibold text-gray-900">{selectedTime} - {displayEndTime}</p>
          </div>
          <Link 
            href="/dashboard/coaches"
            className="inline-block bg-[#51b5ff] text-white px-6 py-3 rounded-xl font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const dates = getDates();
  const [hours, minutes] = selectedTime ? selectedTime.split(':').map(Number) : [0, 0];
  const endHour = minutes === 30 ? hours + 1 : hours;
  const endMinutes = minutes === 30 ? 0 : 30;
  const endTime = selectedTime ? `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}` : '';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link 
              href={coach?.username ? `/players/${coach.username}` : '/search'}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold text-gray-900">Book Session</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Coach Info */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#51b5ff]/10 flex items-center justify-center">
              {coach.profile_picture_url ? (
                <img src={coach.profile_picture_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-[#51b5ff]">
                  {coach.first_name[0]}{coach.last_name[0]}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{coach.first_name} {coach.last_name}</h2>
              <p className="text-sm text-gray-500">Mental Performance Coach</p>
            </div>
          </div>
        </div>

        {/* Athlete Info */}
        {athleteProfile && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Booking as</p>
            <p className="font-semibold text-gray-900">{athleteProfile.first_name} {athleteProfile.last_name}</p>
            <p className="text-sm text-gray-500">{athleteProfile.email}</p>
          </div>
        )}

        {/* Date Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#51b5ff]" />
            <h3 className="font-semibold text-gray-900">Select Date</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {dates.map((date) => (
              <button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`flex-shrink-0 w-20 p-3 rounded-xl text-center transition-colors ${
                  selectedDate === date.value 
                    ? 'bg-[#51b5ff] text-white' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <p className="text-xs font-medium">{date.label.split(' ')[0]}</p>
                <p className="text-lg font-bold">{date.label.split(' ')[2]}</p>
                <p className="text-xs">{date.label.split(' ')[1]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#51b5ff]" />
              <h3 className="font-semibold text-gray-900">Select Time</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => {
                const [hour, minute] = slot.time.split(':').map(Number);
                const period = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;
                const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
                return (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`p-3 rounded-xl text-center transition-colors ${
                      selectedTime === slot.time
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {displayTime}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary */}
        {selectedDate && selectedTime && (
          <div className="bg-blue-50 rounded-2xl p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Session Summary</h3>
            <p className="text-sm text-gray-600">
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <p className="font-semibold text-gray-900">
              {selectedTime} - {endTime}
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedDate || !selectedTime || submitting || !athleteProfile}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-medium transition-colors"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Booking...
            </span>
          ) : (
            'Confirm Booking'
          )}
        </button>
      </main>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/dashboard/coaches" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/tv" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
            <Tv className="w-6 h-6" />
            <span className="text-xs">TV</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
            <Search className="w-6 h-6" />
            <span className="text-xs">Search</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
