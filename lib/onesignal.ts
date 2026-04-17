// OneSignal Push Notification Setup - v5.x SDK
// App ID: 209456e7-6318-4254-aad7-54df0d7198f4

import { Capacitor } from '@capacitor/core';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function initNotifications() {
  console.log('Push: initNotifications called');
  
  if (!Capacitor.isNativePlatform()) {
    console.log('Push: Not native platform, skipping');
    return;
  }

  // Wait for Cordova to be ready
  const setupOneSignal = () => {
    try {
      console.log('Push: Setting up OneSignal...');
      
      // Get OneSignal from plugins
      const OneSignal = (window as any).plugins?.OneSignal;
      
      if (!OneSignal) {
        console.error('Push: OneSignal plugin not found');
        console.log('Push: Available plugins:', Object.keys((window as any).plugins || {}));
        return;
      }
      
      console.log('Push: OneSignal found, initializing...');
      
      // Initialize with App ID (v5.x API)
      OneSignal.initialize('209456e7-6318-4254-aad7-54df0d7198f4');
      console.log('Push: OneSignal initialized');
      
      // Request permission
      OneSignal.Notifications.requestPermission(true).then((accepted: boolean) => {
        console.log('Push: Permission result:', accepted);
        if (accepted) {
          // Get push subscription ID
          OneSignal.User.pushSubscription.getIdAsync().then((id: string | null) => {
            console.log('Push: Subscription ID:', id);
            if (id) {
              syncPlayerIdToServer(id);
            }
          });
        }
      });
      
      // Listen for notification clicks
      OneSignal.Notifications.addEventListener('click', (event: any) => {
        console.log('Push: Notification clicked:', event);
        const data = event?.notification?.additionalData;
        if (data?.type === 'video_call' && data?.roomUrl) {
          window.location.href = `/video-call?room=${encodeURIComponent(data.roomUrl)}`;
        }
      });
      
      console.log('Push: Setup complete');
      
    } catch (err: any) {
      console.error('Push: Setup error:', err);
      console.error('Push: Error stack:', err.stack);
    }
  };
  
  // Check if Cordova is ready
  if ((window as any).cordova) {
    console.log('Push: Cordova ready, setting up');
    document.addEventListener('deviceready', setupOneSignal, false);
  } else {
    console.log('Push: Waiting for Cordova...');
    document.addEventListener('deviceready', setupOneSignal, false);
  }
}

async function syncPlayerIdToServer(playerId: string) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from('profiles').update({
        onesignal_player_id: playerId,
        updated_at: new Date().toISOString()
      }).eq('user_id', user.id);
      console.log('Push: Player ID synced:', playerId);
    }
  } catch (err) {
    console.error('Push: Failed to sync player ID:', err);
  }
}

export async function notifyOtherParticipant(recipientId: string, roomUrl: string, callerName: string) {
  try {
    console.log('Push: Sending notification to:', recipientId);
    const response = await fetch('/api/notify-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId, roomUrl, callerName })
    });
    
    const result = await response.json();
    console.log('Push: Notification result:', result);
    
  } catch (error) {
    console.error('Push: Error sending notification:', error);
  }
}

export function testNotification() {
  console.log('Push: Testing...');
  const OneSignal = (window as any).plugins?.OneSignal;
  if (OneSignal) {
    OneSignal.User.pushSubscription.getIdAsync().then((id: string | null) => {
      alert('OneSignal Player ID: ' + (id || 'Not found'));
    });
  } else {
    alert('OneSignal not loaded');
  }
}
