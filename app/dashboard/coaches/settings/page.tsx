'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Check, 
  Loader2,
  Home,
  Tv,
  Search,
  User
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  is_coaching_enabled?: boolean;
}

export default function CoachSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, is_coaching_enabled')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
        setIsEnabled(data.is_coaching_enabled || false);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const toggleCoaching = async () => {
    if (!profile) return;
    
    setSaving(true);
    const newValue = !isEnabled;
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_coaching_enabled: newValue })
      .eq('id', profile.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update' });
    } else {
      setIsEnabled(newValue);
      setMessage({ type: 'success', text: newValue ? 'Bookings enabled!' : 'Bookings disabled' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#51b5ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/coaches" className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold text-gray-900">Coach Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {message && (
          <div className={`mb-4 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Coaching Toggle */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Accept Bookings</h2>
              <p className="text-sm text-gray-500">Allow athletes to book sessions with you</p>
            </div>
            <button
              onClick={toggleCoaching}
              disabled={saving}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                isEnabled ? 'bg-[#51b5ff]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {isEnabled && (
            <div className="mt-4 p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="w-4 h-4" />
                <p className="text-sm font-medium">Booking button is live on your profile</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-babyblue-100 px-4 py-2 z-50">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/dashboard/coaches" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 py-2">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/tv" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 py-2">
            <Tv className="w-6 h-6" />
            <span className="text-xs">TV</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 py-2">
            <Search className="w-6 h-6" />
            <span className="text-xs">Search</span>
          </Link>
          <Link href="/dashboard/coaches/settings" className="flex flex-col items-center gap-1 text-[#51b5ff] py-2">
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
