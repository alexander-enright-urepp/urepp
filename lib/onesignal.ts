// OneSignal Push Notification Setup - v3.x SDK
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
  document.addEventListener('deviceready', () => {
    console.log('Push: deviceready fired');
    
    // Get OneSignal from window (v3 uses window.plugins.OneSignal)
    const OneSignal = (window as any).plugins?.OneSignal;
    
    if (!OneSignal) {
      console.error('Push: OneSignal plugin not found');
      return;
    }
    
    console.log('Push: OneSignal v3 found, initializing...');
    
    // v3 API - setAppId then prompt
    OneSignal.setAppId('209456e7-6318-4254-aad7-54df0d7198f4');
    
    // Try to sync immediately and retry a few times
    let syncAttempts = 0;
    const maxAttempts = 5;
    
    const trySync = () => {
      OneSignal.getDeviceState((state: any) => {
        console.log(`Push: Sync attempt ${syncAttempts + 1}:`, state);
        if (state?.userId) {
          syncPlayerIdToServer(state.userId);
        } else if (syncAttempts < maxAttempts) {
          syncAttempts++;
          setTimeout(trySync, 3000);
        }
      });
    };
    
    // Start trying immediately
    setTimeout(trySync, 2000);
    
    OneSignal.promptForPushNotificationsWithUserResponse((accepted: boolean) => {
      console.log('Push: Permission result:', accepted);
      if (accepted) {
        // Try again after permission granted
        syncAttempts = 0;
        setTimeout(trySync, 1000);
      }
    });
    
    // Listen for notification opens
    OneSignal.setNotificationOpenedHandler((jsonData: any) => {
      console.log('Push: Notification opened:', jsonData);
      const data = jsonData?.notification?.payload?.additionalData;
      if (data?.type === 'video_call' && data?.roomUrl) {
        window.location.href = `/video-call?room=${encodeURIComponent(data.roomUrl)}`;
      }
    });
    
    console.log('Push: v3 setup complete');
  }, false);
}

async function syncPlayerIdToServer(playerId: string) {
  try {
    console.log('Push: Syncing player ID to server:', playerId);
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase.from('profiles').update({
        onesignal_player_id: playerId,
        updated_at: new Date().toISOString()
      }).eq('user_id', user.id);
      
      if (error) {
        console.error('Push: Failed to sync player ID:', error);
      } else {
        console.log('Push: Player ID synced successfully:', playerId);
      }
    } else {
      console.log('Push: No user found to sync player ID');
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
    OneSignal.getDeviceState((state: any) => {
      alert('OneSignal v3 Player ID: ' + (state?.userId || 'Not found'));
    });
  } else {
    alert('OneSignal not loaded');
  }
}
