// Simple polling-based notifications for wrapper apps
// Works reliably in Capacitor wrapper mode

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let pollingInterval: NodeJS.Timeout | null = null;

export function initNotifications() {
  console.log('Notifications: Starting polling-based notifications');
  
  // Start polling every 5 seconds
  startPolling();
}

function startPolling() {
  if (pollingInterval) return;
  
  pollingInterval = setInterval(async () => {
    checkForNotifications();
  }, 5000);
  
  console.log('Notifications: Polling started (5s interval)');
}

async function checkForNotifications() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;
    
    // Check for pending call notifications
    const { data: notifications } = await supabase
      .from('pending_notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'incoming_call')
      .eq('delivered', false)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (notifications && notifications.length > 0) {
      const notification = notifications[0];
      
      // Show notification
      showInAppNotification(
        'Incoming Call 📹',
        notification.data.callerName + ' is calling you',
        notification.data
      );
      
      // Mark as delivered
      await supabase
        .from('pending_notifications')
        .update({ delivered: true, delivered_at: new Date().toISOString() })
        .eq('id', notification.id);
    }
  } catch (err) {
    console.error('Notification polling error:', err);
  }
}

function showInAppNotification(title: string, body: string, data: any) {
  // Use vibration if available
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
  
  // Show alert (in real app, use a nicer UI)
  if (confirm(title + '\n' + body + '\n\nJoin call?')) {
    if (data?.roomUrl) {
      window.location.href = `/video-call?room=${encodeURIComponent(data.roomUrl)}`;
    }
  }
}

export async function notifyOtherParticipant(recipientId: string, roomUrl: string, callerName: string) {
  try {
    console.log('Sending call notification to:', recipientId);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Store notification in database
    await supabase.from('pending_notifications').insert({
      user_id: recipientId,
      type: 'incoming_call',
      data: { roomUrl, callerName },
      delivered: false,
      created_at: new Date().toISOString()
    });
    
    console.log('Notification stored for polling');
  } catch (error) {
    console.error('Error storing notification:', error);
  }
}

export function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}
