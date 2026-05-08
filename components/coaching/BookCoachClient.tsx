'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CalendlyEmbed } from './CalendlyEmbed';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture_url?: string;
  bio?: string;
  role?: string;
  calendly_link?: string;
}

interface UserProfile {
  is_premium: boolean;
  email?: string;
}

interface BookCoachClientProps {
  coachId: string;
}

export default function BookCoachClient({ coachId }: BookCoachClientProps) {
  const supabase = createClientComponentClient();
  
  const [coach, setCoach] = useState<Profile | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch coach profile
      const { data: coachData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', coachId)
        .single();

      if (!coachData) {
        setError('Coach not found');
        setLoading(false);
        return;
      }

      // Check if coach has calendly link
      if (!coachData.calendly_link) {
        setError('This coach is not accepting bookings at this time');
        setLoading(false);
        return;
      }

      setCoach(coachData);

      // Check if user is logged in
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Fetch user's profile
        const { data: userData } = await supabase
          .from('profiles')
          .select('is_premium, email')
          .eq('user_id', authUser.id)
          .single();
        
        setUser(userData || { is_premium: false });
      } else {
        setUser(null); // Guest user
      }
      
      setLoading(false);
    };

    fetchData();
  }, [coachId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link 
            href="/search"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  if (!coach) {
    return null;
  }

  // Check if this is an athlete profile trying to use coaching booking
  const isAthlete = coach.role === 'athlete' || !coach.role;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href={`/players/${coach.username}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </Link>
          <h1 className="font-semibold text-gray-900">Book Session</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Coach Info */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {coach.profile_picture_url ? (
              <img
                src={coach.profile_picture_url}
                alt={`${coach.first_name} ${coach.last_name}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#51b5ff] to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                {coach.first_name?.[0]}{coach.last_name?.[0]}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {coach.first_name} {coach.last_name}
              </h2>
              <p className="text-gray-600">
                {isAthlete ? 'Athlete Session' : 'Mental Performance Coach'}
              </p>
              {coach.bio && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{coach.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guest Banner - If not logged in */}
      {!user && (
        <div className="bg-amber-50 border-b border-amber-100">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-amber-800">
              <strong>Guest booking:</strong> Your session will be saved. 
              <Link href="/login" className="underline ml-1">Sign in</Link> to view all your appointments.
            </p>
          </div>
        </div>
      )}

      {/* Logged in but no premium check for coaches */}
      {user && !user.is_premium && !isAthlete && (
        <div className="bg-amber-50 border-b border-amber-100">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <p className="text-sm text-amber-800">
              You're booking as a guest. Premium features available after sign up.
            </p>
          </div>
        </div>
      )}

      {/* Calendly Embed */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-[#51b5ff]/10 border-b border-[#51b5ff]/20 px-4 py-3">
            <p className="text-sm text-gray-700">
              <Calendar className="w-4 h-4 inline-block mr-1" />
              Select a time that works for you. You'll receive a confirmation email.
            </p>
          </div>
          <CalendlyEmbed 
            calendlyUrl={coach.calendly_link!}
            coachName={`${coach.first_name} ${coach.last_name}`}
            height="800px"
          />
        </div>
        
        {/* After booking note */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            After booking, check your email for confirmation.{' '}
            {user ? (
              <Link href="/dashboard/appointments" className="text-[#51b5ff] hover:underline">
                View your appointments
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-[#51b5ff] hover:underline">Sign in</Link> to track your sessions.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
