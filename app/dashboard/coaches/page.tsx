'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { notifyOtherParticipant } from '@/lib/onesignal';
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
  Trash2,
  Pencil,
  Bell
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import VideoCall from '@/components/VideoCall';
import ManageBookings from '@/components/ManageBookings';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  is_coaching_enabled?: boolean;
}

interface OtherProfile {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  username?: string;
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
  athlete_id: string;
  coach_id: string;
  is_coach?: boolean;
  other_profile?: OtherProfile;
}

export default function CoachesPage() {
  const router = useRouter();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<{roomUrl: string; athleteName: string} | null>(null);
  const [startingCall, setStartingCall] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
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
        .from('booked_sessions')
        .delete()
        .eq('id', apptId);
      
      if (error) {
        console.error('Delete error:', error);
        alert('Failed to delete session: ' + error.message);
      } else {
        setAppointments(prev => prev.filter(a => a.id !== apptId));
        setMenuOpen(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete session');
    }
  };

  const handleEditClick = (appt: Appointment) => {
    setEditingAppointment(appt);
    setEditDate(appt.start_time.split('T')[0]);
    setEditStartTime(appt.start_time.split('T')[1]?.substring(0, 5) || '');
    setEditEndTime(appt.end_time.split('T')[1]?.substring(0, 5) || '');
    setMenuOpen(null);
  };

  const handleSaveEdit = async () => {
    if (!editingAppointment || !editDate || !editStartTime || !editEndTime) return;
    
    setSavingEdit(true);
    const { error } = await supabase
      .from('booked_sessions')
      .update({
        session_date: editDate,
        start_time: editStartTime,
        end_time: editEndTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingAppointment.id);
    
    if (error) {
      console.error('Update error:', error);
      alert('Failed to update session: ' + error.message);
    } else {
      // Refresh appointments
      const { data: sessionsData } = await supabase
        .from('booked_sessions')
        .select('*')
        .or(`coach_id.eq.${profile?.id},athlete_id.eq.${profile?.id}`)
        .order('session_date', { ascending: true });
      
      const formattedAppointments: Appointment[] = (sessionsData || []).map((s: any) => ({
        id: s.id,
        calendly_event_id: '',
        event_type_name: 'Coaching Session',
        start_time: `${s.session_date}T${s.start_time}`,
        end_time: `${s.session_date}T${s.end_time}`,
        status: s.status,
        athlete_name: s.athlete_name,
        athlete_email: s.athlete_email,
        athlete_id: s.athlete_id,
        coach_id: s.coach_id,
        is_coach: s.coach_id === profile?.id
      }));
      
      setAppointments(formattedAppointments);
      setEditingAppointment(null);
    }
    setSavingEdit(false);
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
        
        // Fetch ALL booked_sessions for this user (simple query first)
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('booked_sessions')
          .select('*')
          .or(`coach_id.eq.${profileData.id},athlete_id.eq.${profileData.id}`)
          .order('session_date', { ascending: true });
        
        console.log('Dashboard query debug:', {
          profileId: profileData.id,
          sessionsCount: sessionsData?.length,
          error: sessionsError?.message,
          data: sessionsData
        });
        
        // Get all unique profile IDs (both coaches and athletes from sessions)
        const profileIds = Array.from(new Set((sessionsData || []).flatMap((s: any) => [s.coach_id, s.athlete_id]).filter(Boolean)));
        
        // Fetch profiles for all participants
        let profilesMap = new Map();
        if (profileIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, profile_picture_url, username')
            .in('id', profileIds);
          
          profilesMap = new Map((profilesData || []).map((p: any) => [p.id, p]));
        }
        
        // Format sessions with other profile info
        // Before SQL migration: 
        // - Coaches see bookings in Manage Bookings only (not Upcoming Sessions)
        // - Athletes see their bookings in Upcoming Sessions
        const formattedAppointments: Appointment[] = (sessionsData || [])
          .filter((s: any) => {
            // If I'm the coach, DON'T show in Upcoming Sessions
            // (Coach sees it in Manage Bookings instead)
            if (s.coach_id === profileData.id) {
              return false; // Hide from Upcoming Sessions for coach
            }
            // If I'm athlete, show my bookings
            return true;
          })
          .map((s: any) => {
          const isCoach = s.coach_id === profileData.id;
          const otherProfileId = isCoach ? s.athlete_id : s.coach_id;
          const otherProfile = profilesMap.get(otherProfileId);
          
          return {
            id: s.id,
            calendly_event_id: '',
            event_type_name: 'Coaching Session',
            start_time: `${s.session_date}T${s.start_time}`,
            end_time: `${s.session_date}T${s.end_time}`,
            status: s.status,
            athlete_name: s.athlete_name,
            athlete_email: s.athlete_email,
            athlete_id: s.athlete_id,
            coach_id: s.coach_id,
            is_coach: isCoach,
            other_profile: otherProfile
          };
        });
        
        setAppointments(formattedAppointments);
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
            <p className="text-sm text-gray-500">Book Coaching Sessions</p>
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
        {/* Manage Bookings - Show pending bookings that need approval */}
        <ManageBookings />

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
              {appointments.map((appt) => (
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
                          onClick={() => handleEditClick(appt)}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
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
                    <Link 
                      href={appt.other_profile?.username ? `/players/${appt.other_profile.username}` : '#'}
                      className="flex-shrink-0"
                    >
                      {appt.other_profile?.profile_picture_url ? (
                        <img
                          src={appt.other_profile.profile_picture_url}
                          alt={`${appt.other_profile.first_name} ${appt.other_profile.last_name}`}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#51b5ff]/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-[#51b5ff]">
                            {appt.other_profile?.first_name?.[0]}{appt.other_profile?.last_name?.[0]}
                          </span>
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="font-medium text-gray-900 truncate">
                        {appt.other_profile ? `${appt.other_profile.first_name} ${appt.other_profile.last_name}` : appt.athlete_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(appt.start_time)} · Coaching Session
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(appt.start_time)}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      appt.status === 'scheduled' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <Link
                      href={appt.other_profile?.id 
                        ? `/dashboard/coaches/messages?startWith=${appt.other_profile.id}&name=${encodeURIComponent(`${appt.other_profile.first_name} ${appt.other_profile.last_name}`)}&pic=${encodeURIComponent(appt.other_profile.profile_picture_url || '')}` 
                        : `/dashboard/coaches/messages?athlete=${appt.athlete_email}`}
                      className="flex-1 bg-[#51b5ff] hover:bg-[#3da8f0] text-white text-sm font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Link>
                    <button
                      onClick={async () => {
                        setStartingCall(appt.id);
                        try {
                          // Get the session token from Supabase
                          const { data: { session } } = await supabase.auth.getSession();
                          
                          const response = await fetch('/api/sessions', {
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${session?.access_token || ''}`
                            },
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
                            
                            // Send push notification to other participant
                            if (appt.other_profile?.id) {
                              await notifyOtherParticipant(
                                appt.other_profile.id,
                                data.roomUrl,
                                `${profile?.first_name} ${profile?.last_name}`
                              );
                            }
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
            <p className="text-xs text-gray-500">Chat on UREPP</p>
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

      {/* Edit Modal */}
      {editingAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51b5ff] focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51b5ff] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#51b5ff] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingAppointment(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="flex-1 py-2 bg-[#51b5ff] hover:bg-[#3da8f0] text-white rounded-lg disabled:opacity-50"
              >
                {savingEdit ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {activeCall && (
        <div className="fixed inset-0 z-[100]" key={activeCall.roomUrl}>
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
