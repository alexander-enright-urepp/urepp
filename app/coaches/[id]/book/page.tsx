'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Crown, Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CalendlyEmbed } from '@/components/coaching/CalendlyEmbed';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture_url?: string;
  bio?: string;
  role?: string;
  calendly_link?: string;
  is_premium?: boolean;
}

interface UserProfile {
  is_premium: boolean;
}

export default function BookCoachPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [coach, setCoach] = useState<Profile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/coaches/' + params.id + '/book');
        return;
      }

      // Fetch coach profile
      const { data: coachData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!coachData) {
        setError('Coach not found');
        setLoading(false);
        return;
      }

      // Verify this is a coach
      if (coachData.role !== 'coach' && coachData.role !== 'mental_performance_coach') {
        setError('This user is not a coach');
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

      // Fetch user's premium status
      const { data: userData } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('user_id', user.id)
        .single();

      setUserProfile(userData || { is_premium: false });
      setLoading(false);
    };

    fetchData();
  }, [params.id, supabase, router]);

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

  if (!coach || !userProfile) {
    return null;
  }

  // Premium gate
  if (!userProfile.is_premium) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <Link 
              href={`/players/${coach.username}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Profile
            </Link>
          </div>
        </header>

        {/* Premium Required CTA */}
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Premium Feature
            </h1>
            <p className="text-gray-600 mb-2">
              Mental Performance Coaching is available exclusively for UREPP Premium members.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Connect with certified mental performance coaches via video sessions and messaging.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/subscription"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                <Crown className="w-5 h-5" />
                Upgrade to Premium
              </Link>
              <Link
                href={`/players/${coach.username}`}
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="w-10" /> {/* Spacer for alignment */}
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                {coach.first_name?.[0]}{coach.last_name?.[0]}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {coach.first_name} {coach.last_name}
              </h2>
              <p className="text-gray-600">Mental Performance Coach</p>
              {coach.bio && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{coach.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendly Embed */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-blue-700">
              After booking, you'll be redirected to your dashboard
            </p>
            <Link href="/dashboard/coaches" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Skip to Dashboard →
            </Link>
          </div>
          <CalendlyEmbed 
            calendlyUrl={coach.calendly_link!}
            coachName={`${coach.first_name} ${coach.last_name}`}
            height="800px"
          />
        </div>
      </div>
    </div>
  );
}
