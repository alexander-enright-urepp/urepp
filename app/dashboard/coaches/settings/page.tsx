'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Check, 
  Loader2,
  AlertCircle,
  Globe,
  Clock,
  Tv,
  Search,
  ArrowLeft,
  Settings,
  Link2,
  User,
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

  // Handle OAuth callback messages
  useEffect(() => {
    const success = searchParams?.get('success');
    const error = searchParams?.get('error');
    const debug = searchParams?.get('debug');
    
    if (success === 'connected') {
      setMessage({ type: 'success', text: 'Calendly connected successfully!' });
      // Refresh connection status
      checkConnectionStatus();
    } else if (error) {
      const errorMessages: Record<string, string> = {
        oauth_denied: 'Connection was cancelled.',
        no_code: 'Authorization failed. Please try again.',
        not_configured: 'Calendly is not properly configured.',
        token_exchange: 'Failed to complete connection. Please try again.',
        storage: 'Failed to save connection. Please try again.',
        no_user: 'Session expired. Please sign in again.',
        no_profile: 'Profile not found.',
        unknown: 'An unexpected error occurred.',
      };
      let errorText = errorMessages[error] || 'Connection failed.';
      if (debug) {
        errorText += ` (Debug: ${decodeURIComponent(debug)})`;
      }
      setMessage({ type: 'error', text: errorText });
    }
  }, [searchParams]);

  // Check connection status function
  const checkConnectionStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, calendly_link, is_coaching_enabled')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData as Profile);
        setCalendlyUrl(profileData.calendly_link || '');
        setIsEnabled(profileData.is_coaching_enabled || false);
        
        // Check if user has connected Calendly OAuth
        const { data: tokenData } = await supabase
          .from('calendly_tokens')
          .select('id')
          .eq('profile_id', profileData.id)
          .maybeSingle();
        
        setIsConnected(!!tokenData);
      }
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/dashboard/coaches/settings');
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
        
        // Check if user has connected Calendly OAuth
        const { data: tokenData } = await supabase
          .from('calendly_tokens')
          .select('id')
          .eq('profile_id', data.id)
          .maybeSingle();
        
        setIsConnected(!!tokenData);
      }
      
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const validateCalendlyUrl = (url: string): boolean => {
    if (!url) return true;
    return url.includes('calendly.com/');
  };

  const handleSave = async () => {
    if (!profile) return;

    if (calendlyUrl && !validateCalendlyUrl(calendlyUrl)) {
      setMessage({ type: 'error', text: 'Please enter a valid Calendly URL' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        calendly_link: calendlyUrl || null,
        is_coaching_enabled: isEnabled && !!calendlyUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Settings saved!' });
    }

    setSaving(false);
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
          <Link href="/dashboard/coaches" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Calendly Integration</p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-lg shadow-babyblue-200/50 border border-babyblue-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#51b5ff]/10 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-[#51b5ff]" />
            </div>
            <h2 className="font-semibold text-gray-900">Connect Calendly</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            One-click OAuth connection to automatically sync your availability and appointments.
          </p>
          {isConnected ? (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Calendly Connected</span>
              </div>
              <button
                onClick={async () => {
                  // Disconnect - delete tokens and update profile
                  if (!profile) return;
                  setSaving(true);
                  
                  // Delete tokens
                  const { error: tokenError } = await supabase.from('calendly_tokens').delete().eq('profile_id', profile.id);
                  
                  // Also update profile to disable coaching
                  const { error: profileError } = await supabase.from('profiles').update({
                    is_coaching_enabled: false,
                    calendly_link: null,
                    updated_at: new Date().toISOString()
                  }).eq('id', profile.id);
                  
                  if (tokenError || profileError) {
                    setMessage({ type: 'error', text: 'Failed to disconnect. Please try again.' });
                  } else {
                    setIsConnected(false);
                    setIsEnabled(false);
                    setCalendlyUrl('');
                    setMessage({ type: 'success', text: 'Calendly disconnected' });
                    // Force page reload to clear state
                    window.location.reload();
                  }
                  setSaving(false);
                }}
                disabled={saving}
                className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
              >
                Disconnect
              </button>
              <button
                onClick={async () => {
                  setSaving(true);
                  setMessage({ type: 'success', text: 'Checking webhook...' });
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.access_token) {
                      setMessage({ type: 'error', text: 'Not signed in' });
                      setSaving(false);
                      return;
                    }
                    const res = await fetch('/api/calendly/webhooks', {
                      headers: { 'Authorization': `Bearer ${session.access_token}` }
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setMessage({ type: 'success', text: `Webhook ${data.status}: ${data.webhook?.uri || 'OK'}` });
                    } else {
                      setMessage({ type: 'error', text: data.error || 'Webhook check failed' });
                    }
                  } catch (err) {
                    setMessage({ type: 'error', text: 'Webhook check failed' });
                  }
                  setSaving(false);
                }}
                disabled={saving}
                className="text-xs bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-3 py-1 rounded-lg font-medium"
              >
                Check Webhook
              </button>
              <button
                onClick={async () => {
                  setSaving(true);
                  setMessage({ type: 'success', text: 'Syncing bookings...' });
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.access_token) {
                      setMessage({ type: 'error', text: 'Not signed in' });
                      setSaving(false);
                      return;
                    }
                    const res = await fetch('/api/calendly/sync', { 
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${session.access_token}` }
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setMessage({ type: 'success', text: `Synced ${data.count || 0} bookings` });
                    } else {
                      setMessage({ type: 'error', text: data.error || 'Sync failed' });
                    }
                  } catch (err) {
                    setMessage({ type: 'error', text: 'Sync failed' });
                  }
                  setSaving(false);
                }}
                disabled={saving}
                className="text-xs bg-[#51b5ff] hover:bg-[#3da8f0] disabled:bg-gray-300 text-white px-3 py-1 rounded-lg font-medium"
              >
                {saving ? 'Syncing...' : 'Sync Bookings'}
              </button>
            </div>
          ) : (
            <button
              onClick={async () => {
                try {
                  console.log('Starting Calendly OAuth...');
                  // Get session and send token in Authorization header
                  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                  console.log('Session result:', { hasSession: !!session, hasToken: !!session?.access_token, error: sessionError });
                  
                  if (!session?.access_token) {
                    setMessage({ type: 'error', text: 'Not signed in. Please sign in first.' });
                    return;
                  }
                  
                  const res = await fetch('/api/auth/calendly', {
                    headers: {
                      'Authorization': `Bearer ${session.access_token}`
                    }
                  });
                  console.log('Response status:', res.status);
                  const data = await res.json();
                  console.log('Response data:', data);
                  if (data.url) {
                    window.location.href = data.url;
                  } else if (data.error) {
                    setMessage({ type: 'error', text: data.error });
                  }
                } catch (err) {
                  console.error('Failed to start OAuth:', err);
                  setMessage({ type: 'error', text: 'Failed to connect. Please try again.' });
                }
              }}
              className="w-full bg-[#51b5ff] hover:bg-[#3da8f0] text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Link2 className="w-5 h-5" />
              Connect Calendly Account
            </button>
          )}
        </div>

        {/* Calendly Link Form */}
        <div className="bg-white rounded-2xl shadow-lg shadow-babyblue-200/50 border border-babyblue-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#51b5ff]/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#51b5ff]" />
            </div>
            <h2 className="font-semibold text-gray-900">Your Calendly Link</h2>
          </div>
          
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              value={calendlyUrl}
              onChange={(e) => setCalendlyUrl(e.target.value)}
              placeholder="https://calendly.com/yourname"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#51b5ff] focus:border-transparent outline-none transition-all"
            />
          </div>

          {calendlyUrl && !validateCalendlyUrl(calendlyUrl) && (
            <p className="text-xs text-red-500 mb-4 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Please enter a valid Calendly URL
            </p>
          )}

          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#51b5ff]/5 rounded-xl mb-4">
            <div>
              <p className="font-medium text-gray-900">Accept Bookings</p>
              <p className="text-xs text-gray-500">Let athletes schedule with you</p>
            </div>
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isEnabled ? 'bg-[#51b5ff]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !validateCalendlyUrl(calendlyUrl)}
            className="w-full bg-[#51b5ff] hover:bg-[#3da8f0] disabled:bg-gray-200 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Saving...</>
            ) : (
              <><Check className="w-5 h-5" />Save Settings</>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg shadow-babyblue-200/50 border border-babyblue-100 p-4">
          <h3 className="font-medium text-gray-900 mb-2">Add Your Calendly Account:</h3>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>Click "Connect Calendly Account" button above</li>
            <li>Sign in to your Calendly account</li>
            <li>Authorize UREPP to access your calendar</li>
            <li>Your upcoming appointments will appear automatically</li>
          </ol>
          <p className="text-xs text-gray-500 mt-3">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            Make sure you're logged into UREPP before connecting.
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-babyblue-100 px-4 py-2 z-50">
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
