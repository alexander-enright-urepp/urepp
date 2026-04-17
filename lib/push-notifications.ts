// Web Push Notifications - works in Capacitor wrapper apps
// Uses iOS 16.4+ Safari Web Push support

import { Capacitor } from '@capacitor/core';

export async function initPushNotifications() {
  console.log('Push: init called');
  
  if (!('Notification' in window)) {
    console.log('Push: Notifications not supported');
    return;
  }
  
  console.log('Push: Notification permission:', Notification.permission);
  
  // Request permission
  const permission = await Notification.requestPermission();
  console.log('Push: New permission:', permission);
  
  if (permission === 'granted') {
    // In a wrapper app, we can still show local notifications
    console.log('Push: Permission granted');
    
    // For wrapper apps, we use a polling approach
    // or show in-app notifications
    startNotificationPolling();
  }
}

// Polling approach for wrapper apps
function startNotificationPolling() {
  console.log('Push: Starting notification polling');
  
  // Check for new notifications every 10 seconds
  setInterval(async () => {
    // This would check your backend for pending notifications
    // For now, we just log
    console.log('Push: Polling for notifications...');
  }, 10000);
}

// Show a local notification (works in wrapper apps)
export function showLocalNotification(title: string, body: string, data?: any) {
  if (Notification.permission !== 'granted') {
    console.log('Push: No permission to show notification');
    return;
  }
  
  const notification = new Notification(title, {
    body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: data?.type || 'default',
    data: data
  });
  
  notification.onclick = () => {
    console.log('Push: Notification clicked', data);
    window.focus();
    
    if (data?.type === 'video_call' && data?.roomUrl) {
      window.location.href = `/video-call?room=${encodeURIComponent(data.roomUrl)}`;
    }
  };
}

// For call notifications
export async function notifyOtherParticipant(recipientId: string, roomUrl: string, callerName: string) {
  try {
    console.log('Push: Sending call notification to:', recipientId);
    
    const response = await fetch('/api/notify-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientId,
        roomUrl,
        callerName
      })
    });
    
    const result = await response.json();
    console.log('Push: Notification result:', result);
    
  } catch (error) {
    console.error('Push: Error sending notification:', error);
  }
}

// Test notification
export function testNotification() {
  showLocalNotification('Test', 'This is a test notification', { type: 'test' });
}
