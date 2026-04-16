'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Check, 
  Loader2,
  ArrowLeft,
  Link2,
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
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Track manual disconnect
  const manuallyDisconnected = useRef(false);

  // Fetch profile with DEBUG logging
  const fetchProfile = async () => {
    console.log('=== fetchProfile START ===');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user, redirecting');
      router.push('/login');
      return;
    }
    console.log('User ID:', user.id);

    // Get profile
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, calendly_link, is_coaching_enabled')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    if (data) {
      console.log('Profile found:', { id: data.id, calendly_link: data.calendly_link });
      setProfile(data);
      setCalendlyUrl(data.calendly_link || '');
      setIsEnabled(data.is_coaching_enabled || false);
      
      // DEBUG: Check tokens with full query info
      console.log('Checking calendly_tokens for profile_id:', data.id);
      const { data: tokenData, error: tokenError, count } = await supabase
        .from('calendly_tokens')
        .select('*', { count: 'exact' })
        .eq('profile_id', data.id);
      
      console.log('Token query result:', { 
        rowCount: tokenData?.length, 
        exactCount: count,
        error: tokenError?.message,
        firstToken: tokenData?.[0]?.id 
      });
      
      const hasTokens = tokenData && tokenData.length > 0;
      console.log('hasTokens:', hasTokens, 'manuallyDisconnected:', manuallyDisconnected.current);
      
      // Build debug string
      setDebugInfo(`Profile: ${data.id}\nTokens: ${tokenData?.length || 0} rows\nmanuallyDisconnected: ${manuallyDisconnected.current}`);
      
      // Only update if not manually disconnected
      if (!manuallyDisconnected.current) {
        console.log('Setting isConnected to:', hasTokens);
        setIsConnected(hasTokens);
      } else {
        console.log('SKIPPING setIsConnected because manuallyDisconnected is true');
      }
    } else {
      console.log('No profile data');
    }
    setLoading(false);
    console.log('=== fetchProfile END ===');
  };

  useEffect(() => {
    console.log('Component mount, manuallyDisconnected:', manuallyDisconnected.current);
    fetchProfile();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const success = searchParams?.get('success');
    if (success === 'connected') {
      manuallyDisconnected.current = false;
      fetchProfile();
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#51b5ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-babyblue-50 via-white to-babyblue-100 pb-20">
      <header className="bg-white/80 backdrop-blur-sm border-b border-babyblue-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard/coaches" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
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
        {/* DEBUG INFO */}
        <div className="bg-gray-100 p-3 rounded-xl text-xs font-mono whitespace-pre-wrap">
          DEBUG: {debugInfo}
        </div>

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
                  console.log('=== DISCONNECT START ===');
                  if (!profile) {
                    console.log('No profile!');
                    return;
                  }
                  
                  console.log('Profile ID:', profile.id);
                  setSaving(true);
                  
                  // STEP 1: Update UI
                  console.log('STEP 1: Updating UI state');
                  manuallyDisconnected.current = true;
                  setIsConnected(false);
                  setMessage({ type: 'success', text: 'Disconnecting...' });
                  
                  // STEP 2: Delete tokens with DEBUG
                  console.log('STEP 2: Deleting tokens for profile_id:', profile.id);
                  const { data: deleteData, error: deleteError, count: deleteCount } = await supabase
                    .from('calendly_tokens')
                    .delete()
                    .eq('profile_id', profile.id)
                    .select();
                  
                  console.log('Delete result:', { 
                    deletedRows: deleteData?.length, 
                    count: deleteCount,
                    error: deleteError?.message 
                  });
                  
                  // STEP 3: Update profile
                  console.log('STEP 3: Updating profile');
                  const { data: updateData, error: updateError } = await supabase
                    .from('profiles')
                    .update({ calendly_link: null, is_coaching_enabled: false })
                    .eq('id', profile.id)
                    .select();
                  
                  console.log('Update result:', { 
                    updatedRows: updateData?.length,
                    error: updateError?.message 
                  });
                  
                  // STEP 4: VERIFY
                  console.log('STEP 4: Verifying tokens deleted');
                  const { data: verifyData } = await supabase
                    .from('calendly_tokens')
                    .select('*')
                    .eq('profile_id', profile.id);
                  
                  console.log('Verification - tokens still exist:', verifyData?.length || 0);
                  
                  setDebugInfo(`Deleted: ${deleteData?.length || 0} tokens\nStill exist: ${verifyData?.length || 0} tokens\nmanuallyDisconnected: true`);
                  setMessage({ type: 'success', text: `Disconnected (${deleteData?.length || 0} tokens removed)` });
                  setSaving(false);
                  console.log('=== DISCONNECT END ===');
                }}
                disabled={saving}
                className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
              >
                {saving ? '...' : 'Disconnect'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Connect your Calendly account to accept bookings. Enter your Calendly URL or use OAuth for automatic sync.
              </p>
              <input
                type="text"
                value={calendlyUrl}
                onChange={(e) => setCalendlyUrl(e.target.value)}
                placeholder="https://calendly.com/yourname"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#51b5ff] focus:ring-2 focus:ring-[#51b5ff]/20"
              />
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
                className="w-full bg-[#51b5ff] hover:bg-[#3da8f0] disabled:bg-gray-300 text-white py-3 rounded-xl font-medium"
              >
                {saving ? 'Saving...' : 'Save Calendly URL'}
              </button>
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
