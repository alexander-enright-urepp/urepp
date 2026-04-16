'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Check, 
  Loader2,
  ArrowLeft,
  Settings,
  Link2,
  Home
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  calendly_link?: string;
  is_coaching_enabled?: boolean;
}

export default function CoachSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Track manual disconnect
  const manuallyDisconnected = useRef(false);

  // Handle OAuth callback
  useEffect(() => {
    const success = searchParams?.get('success');
    const error = searchParams?.get('error');
    
    if (success === 'connected') {
      setMessage({ type: 'success', text: 'Calendly connected!' });
      manuallyDisconnected.current = false;
      fetchProfile();
    } else if (error) {
      setMessage({ type: 'error', text: 'Connection failed' });
    }
  }, [searchParams]);

  // Fetch profile
  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, calendly_link, is_coaching_enabled')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setCalendlyUrl(data.calendly_link || '');
      setIsEnabled(data.is_coaching_enabled || false);
      
      // Check if tokens exist
      const { data: tokenData } = await supabase
        .from('calendly_tokens')
        .select('id')
        .eq('profile_id', data.id)
        .maybeSingle();
      
      // Only update if not manually disconnected
      if (!manuallyDisconnected.current) {
        setIsConnected(!!tokenData);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!manuallyDisconnected.current) {
      fetchProfile();
    }
  }, []);

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
          <Link href="/dashboard/coaches" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Calendly Integration</p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-lg border border-babyblue-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#51b5ff]/10 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-[#51b5ff]" />
            </div>
            <h2 className="font-semibold text-gray-900">Connect Calendly</h2>
          </div>
          
          {message && (
            <div className={`mb-4 p-3 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}
          
          {isConnected ? (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Connected</span>
              </div>
              <button
                onClick={async () => {
                  if (!profile) return;
                  
                  // IMMEDIATELY update UI
                  manuallyDisconnected.current = true;
                  setIsConnected(false);
                  setIsEnabled(false);
                  setCalendlyUrl('');
                  setProfile(prev => prev ? { ...prev, calendly_link: undefined, is_coaching_enabled: false } : null);
                  setMessage({ type: 'success', text: 'Disconnecting...' });
                  setSaving(true);
                  
                  // Then clean up DB (async, don't wait)
                  try {
                    await supabase.from('calendly_tokens').delete().eq('profile_id', profile.id);
                    await supabase.from('profiles').update({
                      calendly_link: null,
                      is_coaching_enabled: false
                    }).eq('id', profile.id);
                    setMessage({ type: 'success', text: 'Disconnected' });
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
              >
                {saving ? '...' : 'Disconnect'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={calendlyUrl}
                onChange={(e) => setCalendlyUrl(e.target.value)}
                placeholder="https://calendly.com/yourname"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#51b5ff] focus:ring-2 focus:ring-[#51b5ff]/20"
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!profile || !calendlyUrl) return;
                    setSaving(true);
                    await supabase.from('profiles').update({
                      calendly_link: calendlyUrl,
                      is_coaching_enabled: true
                    }).eq('id', profile.id);
                    setIsConnected(true);
                    setMessage({ type: 'success', text: 'Saved!' });
                    setSaving(false);
                  }}
                  disabled={saving}
                  className="flex-1 bg-[#51b5ff] hover:bg-[#3da8f0] disabled:bg-gray-300 text-white py-2 rounded-xl font-medium"
                >
                  {saving ? 'Saving...' : 'Save URL'}
                </button>
              </div>
              <button
                onClick={async () => {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session?.access_token) {
                    setMessage({ type: 'error', text: 'Not signed in' });
                    return;
                  }
                  const res = await fetch('/api/auth/calendly', {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-medium"
              >
                Connect via OAuth
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
