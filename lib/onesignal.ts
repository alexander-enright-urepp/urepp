// OneSignal Push Notification Setup
// App ID: 209456e7-6318-4254-aad7-54df0d7198f4

import { Capacitor } from '@capacitor/core';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

declare const OneSignal: any;

export function initOneSignal() {
  console.log('OneSignal: initOneSignal called');
  console.log('OneSignal: isNativePlatform:', Capacitor.isNativePlatform());
  
  if (!Capacitor.isNativePlatform()) {
    console.log('OneSignal: Not on native platform, skipping');
    return;
  }

  // Wait for device ready
  document.addEventListener('deviceready', () => {
    console.log('OneSignal: deviceready fired');
    console.log('OneSignal: window.OneSignal exists:', typeof (window as any).OneSignal);
    
    // Check if OneSignal plugin is available
    const OneSignal = (window as any).OneSignal || (window as any).cordova?.plugins?.OneSignal;
    
    if (!OneSignal) {
      console.error('OneSignal: Plugin not found!');
      return;
    }
    
    console.log('OneSignal: Plugin found, initializing...');
    
    // Initialize OneSignal
    OneSignal.setAppId('209456e7-6318-4254-aad7-54df0d7198f4');
    
    // Request permission
    OneSignal.promptForPushNotificationsWithUserResponse((accepted: boolean) => {
      console.log('OneSignal: Push notification permission accepted:', accepted);
      if (accepted) {
        syncPlayerIdToServer();
      }
    });
    
    // Listen for notification taps
    OneSignal.setNotificationOpenedHandler((jsonData: any) => {
      console.log('OneSignal: Notification opened:', JSON.stringify(jsonData));
      const data = jsonData?.notification?.payload?.additionalData;
      if (data?.type === 'video_call' && data?.roomUrl) {
        window.location.href = `/video-call?room=${encodeURIComponent(data.roomUrl)}`;
      }
    });
    
    // Get player ID
    OneSignal.getDeviceState((state: any) => {
      console.log('OneSignal: Device state:', state);
    });
  }, false);
}

// Send player ID to server for targeted notifications
export async function syncPlayerIdToServer() {
  if (!Capacitor.isNativePlatform()) return;
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  OneSignal.getDeviceState(async (state: any) => {
    if (state?.userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          onesignal_player_id: state.userId,
          updated_at: new Date().toISOString()
        }).eq('user_id', user.id);
        console.log('OneSignal: Player ID synced to server:', state.userId);
      }
    }
  });
}

// Call this when user taps "Join Call"
export async function notifyOtherParticipant(recipientId: string, roomUrl: string, callerName: string) {
  try {
    const response = await fetch('/api/notify-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientId,
        roomUrl,
        callerName
      })
    });
    
    if (!response.ok) {
      console.error('Failed to send call notification');
    }
  } catch (error) {
    console.error('Error sending call notification:', error);
  }
}
