import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// OneSignal configuration - uses environment variable
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;
const ONESIGNAL_APP_ID = '209456e7-6318-4254-aad7-54df0d7198f4';

export async function POST(request: NextRequest) {
  try {
    const { recipientId, roomUrl, callerName } = await request.json();

    if (!recipientId || !roomUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!ONESIGNAL_API_KEY) {
      console.error('ONESIGNAL_API_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'Push notification service not configured' },
        { status: 500 }
      );
    }

    // Get recipient's OneSignal player ID
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('onesignal_player_id, first_name, last_name')
      .eq('id', recipientId)
      .single();

    if (error || !profile?.onesignal_player_id) {
      console.log('No OneSignal player ID found for user:', recipientId);
      return NextResponse.json(
        { success: false, error: 'User has no push token' },
        { status: 200 }
      );
    }

    // Send push notification via OneSignal v5 API
    console.log('Sending OneSignal v5 notification to subscription:', profile.onesignal_player_id);
    
    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${ONESIGNAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_subscription_ids: [profile.onesignal_player_id],
        headings: { en: 'Incoming Call 📹' },
        contents: { en: `${callerName || 'Someone'} is calling you on UREPP` },
        data: {
          type: 'video_call',
          roomUrl: roomUrl,
          callerName: callerName,
        },
      }),
    });

    const responseText = await response.text();
    console.log('OneSignal response:', response.status, responseText);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'OneSignal error: ' + responseText },
        { status: 500 }
      );
    }

    const result = JSON.parse(responseText);
    console.log('Call notification sent:', result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error in notify-call:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
