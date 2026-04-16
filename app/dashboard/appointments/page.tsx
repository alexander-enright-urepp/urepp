'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  User, 
  Video,
  ChevronRight,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  CalendarDays
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  coach_id: string;
  athlete_id: string;
  calendly_event_id: string;
  event_type_name: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  athlete_email: string;
  athlete_name: string;
  notes?: string;
  created_at: string;
  coach?: {
    first_name: string;
    last_name: string;
    profile_picture_url?: string;
    username: string;
  };
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login?redirect=/dashboard/appointments');
          return;
        }

        // Get user's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profileData) {
          setError('Failed to load profile');
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch appointments where user is the athlete
        // Match by athlete_id OR athlete_email (for guest bookings)
        const { data: apptsData, error: apptsError } = await supabase
          .from('appointments')
          .select(`
            *,
            coach:profiles!appointments_coach_id_fkey(
              first_name,
              last_name,
              profile_picture_url,
              username
            )
          `)
          .or(`athlete_id.eq.${profileData.id},athlete_email.eq.${profileData.email}`)
          .order('start_time', { ascending: false });

        if (apptsError) {
          console.error('Error fetching appointments:', apptsError);
          setError('Failed to load appointments');
        } else {
          // Link appointments to this user if matched by email
          const linkedAppointments = apptsData?.map(appt => ({
            ...appt,
            // Mark as linked if email matches
            is_linked_by_email: appt.athlete_email === profileData.email && !appt.athlete_id
          })) || [];
          
          setAppointments(linkedAppointments);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Something went wrong');
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const now = new Date();
  
  const upcomingAppointments = appointments.filter(
    appt => new Date(appt.start_time) > now && appt.status !== 'cancelled'
  );
  
  const pastAppointments = appointments.filter(
    appt => new Date(appt.start_time) <= now || appt.status === 'cancelled'
  );

  const displayedAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#51b5ff] mb-4" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <h1 className="font-semibold text-gray-900">My Sessions</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {profile?.first_name ? `Hey ${profile.first_name}!` : 'Your Sessions'}
          </h2>
          <p className="text-gray-600">
            Manage your coaching sessions and video calls
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
              activeTab === 'upcoming' 
                ? 'bg-[#51b5ff] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CalendarDays className="w-4 h-4 inline-block mr-2" />
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
              activeTab === 'past' 
                ? 'bg-[#51b5ff] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4 inline-block mr-2" />
            Past ({pastAppointments.length})
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {displayedAppointments.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {activeTab} sessions
            </h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming sessions booked."
                : "Your session history will appear here."
              }
            </p>
            {activeTab === 'upcoming' && (
              <Link 
                href="/search"
                className="inline-flex items-center gap-2 bg-[#51b5ff] hover:bg-[#3da8f0] text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                <User className="w-4 h-4" />
                Find a Coach
              </Link>
            )}
          </div>
        )}

        {/* Appointments List */}
        <div className="space-y-4">
          {displayedAppointments.map((appt) => (
            <div 
              key={appt.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(appt.status)}
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border capitalize ${getStatusColor(appt.status)}`}>
                      {appt.status}
                    </span>
                    {/* @ts-ignore */}
                    {(appt as any).is_linked_by_email && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        Linked
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(appt.start_time), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  {appt.coach?.profile_picture_url ? (
                    <img 
                      src={appt.coach.profile_picture_url}
                      alt={`${appt.coach.first_name} ${appt.coach.last_name}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#51b5ff] to-blue-600 flex items-center justify-center text-white font-bold">
                      {appt.coach?.first_name?.[0]}{appt.coach?.last_name?.[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {appt.coach ? `${appt.coach.first_name} ${appt.coach.last_name}` : 'Unknown Coach'}
                    </h4>
                    <p className="text-sm text-gray-600">{appt.event_type_name}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(appt.start_time), 'h:mm a')} - {format(new Date(appt.end_time), 'h:mm a')}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {appt.status === 'scheduled' && new Date(appt.start_time) > now && (
                  <div className="flex gap-2">
                    <Link
                      href={`/coaches/${appt.coach?.username || appt.coach_id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </Link>
                    <button
                      onClick={() => {/* Open Calendly to reschedule */}}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#51b5ff] hover:bg-[#3da8f0] text-white py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      Join Call
                    </button>
                  </div>
                )}

                {appt.status === 'completed' && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Session completed
                  </div>
                )}

                {appt.status === 'cancelled' && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Cancelled
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA at bottom */}
        {displayedAppointments.length > 0 && activeTab === 'upcoming' && (
          <div className="mt-8 text-center">
            <Link 
              href="/search"
              className="inline-flex items-center gap-2 text-[#51b5ff] hover:text-[#3da8f0] font-medium"
            >
              Book another session
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
