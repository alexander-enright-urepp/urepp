'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Loader2, Check } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture_url?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookSessionPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  
  const [coach, setCoach] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    const fetchCoach = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, username, profile_picture_url')
        .eq('id', params.id)
        .single();
      
      if (data) setCoach(data);
      setLoading(false);
    };
    fetchCoach();
  }, [params.id, supabase]);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    // Generate ALL time slots (9 AM to 5 PM, 30 min intervals) - no restrictions
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
    if (!selectedDate || !selectedTime || !email || !name) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);

    // Parse time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const endHour = minutes === 30 ? hours + 1 : hours;
    const endMinutes = minutes === 30 ? 0 : 30;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    const { error } = await supabase
      .from('booked_sessions')
      .insert({
        coach_id: params.id,
        athlete_email: email,
        athlete_name: name,
        session_date: selectedDate,
        start_time: selectedTime,
        end_time: endTime,
        status: 'confirmed'
      });

    if (error) {
      console.error('Booking error:', error);
      alert('Failed to book session');
    } else {
      setSuccess(true);
    }
    setSubmitting(false);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Coach not found</p>
      </div>
    );
  }

  if (success) {
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
            <p className="text-lg font-semibold text-gray-900">{selectedTime} - {parseInt(selectedTime.split(':')[0]) + (selectedTime.includes('30') ? 0 : 0)}:{parseInt(selectedTime.split(':')[1]) === 30 ? '00' : '30'}</p>
          </div>
          <Link 
            href="/dashboard"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const dates = getDates();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href={`/players/${coach.username}`} className="p-2 hover:bg-gray-100 rounded-full">
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
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              {coach.profile_picture_url ? (
                <img src={coach.profile_picture_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-blue-600">
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

        {/* Date Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Select Date</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {dates.map((date) => (
              <button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`flex-shrink-0 w-20 p-3 rounded-xl text-center transition-colors ${
                  selectedDate === date.value 
                    ? 'bg-blue-500 text-white' 
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
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Select Time</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`p-3 rounded-xl text-center transition-colors ${
                    selectedTime === slot.time
                      ? 'bg-blue-500 text-white'
                      : slot.available
                      ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {(selectedDate && selectedTime) && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">Your Info</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        {selectedDate && selectedTime && (
          <button
            onClick={handleSubmit}
            disabled={submitting || !email || !name}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        )}
      </main>
    </div>
  );
}
