// OneSignal Push Notification Setup - v5.x SDK
// App ID: 209456e7-6318-4254-aad7-54df0d7198f4
// Updated for onesignal-cordova-plugin v5.2.11

import { Capacitor } from '@capacitor/core';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function initNotifications() {
  console.log('[Push] initNotifications called');
  
  if (!Capacitor.isNativePlatform()) {
    console.log('[Push] Not native platform, skipping');
    return;
  }

  // Wait for Cordova to be ready
  document.addEventListener('deviceready', () => {
    console.log('[Push] deviceready fired');
    
    // v5 API: OneSignal is on window, not window.plugins
    const OneSignal = (window as any).OneSignal;
    
    if (!OneSignal) {
      console.error('[Push] OneSignal plugin not found');
      return;
    }
    
    console.log('[Push] OneSignal v5 found, initializing...');
    
    // v5 API: Use initialize() instead of setAppId()
    try {
      OneSignal.initialize('209456e7-6318-4254-aad7-54df0d7198f4');
      console.log('[Push] OneSignal initialized successfully');
    } catch (e) {
      console.error('[Push] Failed to initialize OneSignal:', e);
      return;
    }
    
    // v5 API: Request permission using Notifications namespace
    const requestPermission = async () => {
      try {
        const permission = await OneSignal.Notifications.requestPermission(true);
        console.log('[Push] Permission result:', permission);
        
        if (permission) {
          // Wait a moment for ID to be generated, then sync
          setTimeout(syncPlayerId, 2000);
        }
      } catch (e) {
        console.error('[Push] Error requesting permission:', e);
      }
    };
    
    // Request permission after a short delay
    setTimeout(requestPermission, 1000);
    
    // v5 API: Set notification opened handler
    OneSignal.Notifications.addEventListener('click', (event: any) => {
      console.log('[Push] Notification opened:', event);
      const data = event?.notification?.additionalData;
      if (data?.type === 'video_call' && data?.roomUrl) {
        window.location.href = `/video-call?room=${encodeURIComponent(data.roomUrl)}`;
      }
    });
    
    console.log('[Push] v5 setup complete');
  }, false);
}

async function syncPlayerId() {
  try {
    const OneSignal = (window as any).OneSignal;
    if (!OneSignal) return;
    
    // v5 API: Get user ID
    const userId = await OneSignal.User.getOnesignalId();
    console.log('[Push] OneSignal User ID:', userId);
    
    if (userId) {
      await syncPlayerIdToServer(userId);
    }
  } catch (err) {
    console.error('[Push] Error getting player ID:', err);
  }
}

async function syncPlayerIdToServer(playerId: string) {
  try {
    console.log('[Push] Syncing player ID to server:', playerId);
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase.from('profiles').update({
        onesignal_player_id: playerId,
        notifications_enabled: true,
        updated_at: new Date().toISOString()
      }).eq('user_id', user.id);
      
      if (error) {
        console.error('[Push] Failed to sync player ID:', error);
      } else {
        console.log('[Push] Player ID synced successfully:', playerId);
      }
    } else {
      console.log('[Push] No user found to sync player ID');
    }
  } catch (err) {
    console.error('[Push] Failed to sync player ID:', err);
  }
}

export async function notifyOtherParticipant(recipientId: string, roomUrl: string, callerName: string) {
  try {
    console.log('[Push] Sending notification to:', recipientId);
    const response = await fetch('/api/notify-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId, roomUrl, callerName })
    });
    
    const result = await response.json();
    console.log('[Push] Notification result:', result);
    
  } catch (error) {
    console.error('[Push] Error sending notification:', error);
  }
}

export function testNotification() {
  console.log('[Push] Testing...');
  const OneSignal = (window as any).OneSignal;
  if (OneSignal) {
    OneSignal.User.getOnesignalId().then((id: string) => {
      alert('OneSignal v5 User ID: ' + (id || 'Not found'));
    }).catch((e: any) => {
      alert('Error getting ID: ' + e.message);
    });
  } else {
    alert('OneSignal not loaded');
  }
}
