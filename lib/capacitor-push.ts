// Capacitor Push Notifications - native APNs through Capacitor
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function initPushNotifications() {
  if (!Capacitor.isNativePlatform()) {
    console.log('Push: Not native, skipping');
    return;
  }

  try {
    console.log('Push: Registering with Capacitor Push Notifications...');
    
    // Request permission
    const result = await PushNotifications.requestPermissions();
    console.log('Push: Permission result:', result);
    
    if (result.receive === 'granted') {
      // Register with APNs
      await PushNotifications.register();
      console.log('Push: Registered with APNs');
      
      // Listen for token
      PushNotifications.addListener('registration', (token) => {
        console.log('Push: APNs token received:', token.value);
        syncTokenToServer(token.value);
      });
      
      // Listen for notification
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push: Notification received:', notification);
        // Handle notification data
        const data = notification.data;
        if (data?.type === 'video_call' && data?.roomUrl) {
          // Navigate to video call
          window.location.href = `/video-call?room=${encodeURIComponent(data.roomUrl)}`;
        }
      });
      
      // Listen for notification action (tap)
      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Push: Notification tapped:', action);
        const data = action.notification.data;
        if (data?.type === 'video_call' && data?.roomUrl) {
          window.location.href = `/video-call?room=${encodeURIComponent(data.roomUrl)}`;
        }
      });
      
      console.log('Push: Setup complete');
    } else {
      console.log('Push: Permission denied');
    }
  } catch (err) {
    console.error('Push: Error:', err);
  }
}

async function syncTokenToServer(token: string) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from('profiles').update({
        push_token: token,
        updated_at: new Date().toISOString()
      }).eq('user_id', user.id);
      console.log('Push: Token synced to server');
    }
  } catch (err) {
    console.error('Push: Failed to sync token:', err);
  }
}

export async function sendPushNotification(recipientId: string, roomUrl: string, callerName: string) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get recipient's push token
    const { data: profile } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', recipientId)
      .single();
    
    if (!profile?.push_token) {
      console.log('Push: No token for recipient');
      return;
    }
    
    // Send via server-side APNs
    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: profile.push_token,
        title: 'Incoming Call 📹',
        body: `${callerName} is calling you on UREPP`,
        data: { type: 'video_call', roomUrl, callerName }
      })
    });
    
    const result = await response.json();
    console.log('Push: Notification result:', result);
    
  } catch (err) {
    console.error('Push: Error sending:', err);
  }
}
