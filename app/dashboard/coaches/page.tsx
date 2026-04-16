'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Check, 
  Loader2,
  AlertCircle,
  Globe,
  Home,
  Tv,
  Search,
  Settings,
  MessageCircle,
  ChevronRight,
  User,
  Video,
  Clock,
  X,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import VideoCall from '@/components/VideoCall';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  is_coaching_enabled?: boolean;
}

interface Appointment {
  id: string;
  calendly_event_id: string;
  event_type_name: string;
  start_time: string;
  end_time: string;
  status: string;
  athlete_name: string;
  athlete_email: string;
}

export default function CoachesPage() {
  const router = useRouter();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<{roomUrl: string; athleteName: string} | null>(null);
  const [startingCall, setStartingCall] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteAppointment = async (apptId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', apptId);
      
      if (error) {
        console.error('Delete error:', error);
        alert('Failed to delete appointment');
      } else {
        setAppointments(prev => prev.filter(a => a.id !== apptId));
        setMenuOpen(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete appointment');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, is_coaching_enabled')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        
        // Check if Calendly is actually connected (has tokens)
        const { data: tokenData } = await supabase
          .from('calendly_tokens')
          .select('id')
          .eq('profile_id', profileData.id)
          .maybeSingle();
        
        // Update profile state if tokens exist but flag isn't set
        if (tokenData && !profileData.is_coaching_enabled) {
          setProfile(prev => prev ? { ...prev, is_coaching_enabled: true } : prev);
        }
        
        // Fetch upcoming appointments from both tables
        const [{ data: apptsData }, { data: sessionsData }] = await Promise.all([
          supabase
            .from('appointments')
            .select('*')
            .eq('coach_id', profileData.id)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(10),
          supabase
            .from('booked_sessions')
            .select('*')
            .eq('coach_id', profileData.id)
            .gte('session_date', new Date().toISOString().split('T')[0])
            .order('session_date', { ascending: true })
            .limit(10)
        ]);
        
        console.log('Coach dashboard:', {
          coachId: profileData.id,
          appointments: apptsData?.length || 0,
          sessions: sessionsData?.length || 0,
          sessionsData: sessionsData
        });
        
        // Combine and format both types
        const combinedAppointments: Appointment[] = [
          ...(apptsData || []).map((a: any) => ({
            id: a.id,
            calendly_event_id: a.calendly_event_id,
            event_type_name: a.event_type_name,
            start_time: a.start_time,
            end_time: a.end_time,
            status: a.status,
            athlete_name: a.athlete_name,
            athlete_email: a.athlete_email
          })),
          ...(sessionsData || []).map((s: any) => ({
            id: s.id,
            calendly_event_id: '',
            event_type_name: 'Coaching Session',
            start_time: `${s.session_date}T${s.start_time}`,
            end_time: `${s.session_date}T${s.end_time}`,
            status: s.status,
            athlete_name: s.athlete_name,
            athlete_email: s.athlete_email
          }))
        ].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
        
        setAppointments(combinedAppointments.slice(0, 10));
      }
      
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#51b5ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Home</h1>
            <p className="text-sm text-gray-500">Make Appointments</p>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/dashboard/coaches/messages" 
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-gray-600" />
            </Link>
            <Link 
              href="/dashboard/coaches/settings" 
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-lg shadow-babyblue-200/50 border border-babyblue-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#51b5ff]/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#51b5ff]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Upcoming Sessions</h2>
              <p className="text-xs text-gray-500">{appointments.length} scheduled</p>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No upcoming sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 3).map((appt) => (
                <div 
                  key={appt.id}
                  className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors relative"
                >
                  {/* Three-dot menu */}
                  <div className="absolute top-2 right-2" ref={menuOpen === appt.id ? menuRef : undefined}>
                    <button
                      onClick={() => setMenuOpen(menuOpen === appt.id ? null : appt.id)}
                      className="w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    
                    {menuOpen === appt.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                        <button
                          onClick={() => handleDeleteAppointment(appt.id)}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#51b5ff]/10 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-xs font-medium text-[#51b5ff]">
                        {formatDate(appt.start_time).split(' ')[0]}
                      </span>
                      <span className="text-sm font-bold text-[#51b5ff]">
                        {formatDate(appt.start_time).split(' ')[1]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="font-medium text-gray-900 truncate">
                        {appt.athlete_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(appt.start_time)} · {appt.event_type_name}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      appt.status === 'scheduled' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <Link
                      href={`/dashboard/coaches/messages?athlete=${appt.athlete_email}`}
                      className="flex-1 bg-[#51b5ff] hover:bg-[#3da8f0] text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Message
                    </Link>
                    <button
                      onClick={async () => {
                        setStartingCall(appt.id);
                        try {
                          const response = await fetch('/api/sessions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              appointmentId: appt.id,
                              athleteName: appt.athlete_name,
                              coachName: `${profile?.first_name} ${profile?.last_name}`,
                            }),
                          });
                          
                          const data = await response.json();
                          
                          if (response.ok) {
                            setActiveCall({
                              roomUrl: data.roomUrl,
                              athleteName: appt.athlete_name,
                            });
                          } else {
                            alert('Failed to start video call: ' + data.error);
                          }
                        } catch (error) {
                          console.error('Error starting call:', error);
                          alert('Failed to start video call');
                        } finally {
                          setStartingCall(null);
                        }
                      }}
                      disabled={startingCall === appt.id}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      {startingCall === appt.id ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Starting...</>
                      ) : (
                        <><Video className="w-3 h-3" /> Video Call</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link 
            href="/dashboard/coaches/settings"
            className="bg-white rounded-2xl shadow-lg shadow-babyblue-200/50 border border-babyblue-100 p-4 hover:shadow-xl transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-[#51b5ff]/10 flex items-center justify-center mb-3">
              <Settings className="w-5 h-5 text-[#51b5ff]" />
            </div>
            <p className="font-medium text-gray-900">Configure Bookings</p>
            <p className="text-xs text-gray-500">Manage availability</p>
          </Link>
          
          <Link 
            href="/dashboard/coaches/messages"
            className="bg-white rounded-2xl shadow-lg shadow-babyblue-200/50 border border-babyblue-100 p-4 hover:shadow-xl transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-[#51b5ff]/10 flex items-center justify-center mb-3">
              <MessageCircle className="w-5 h-5 text-[#51b5ff]" />
            </div>
            <p className="font-medium text-gray-900">Messages</p>
            <p className="text-xs text-gray-500">Chat with athletes</p>
          </Link>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-babyblue-100 px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/dashboard/coaches" className="flex flex-col items-center gap-1 text-[#51b5ff]">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
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

      {/* Video Call Modal */}
      {activeCall && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute top-4 right-4 z-[110]">
            <button
              onClick={() => setActiveCall(null)}
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <VideoCall
            roomUrl={activeCall.roomUrl}
            userName={`${profile?.first_name} ${profile?.last_name}`}
            onLeave={() => setActiveCall(null)}
          />
        </div>
      )}
    </div>
  );
}
