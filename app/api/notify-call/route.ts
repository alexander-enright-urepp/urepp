import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY || 'os_v2_app_eckfnz3ddbbfjkwxktpq24my6q5yy6mmkfbesnedqkndjiyahk464a7mfjdzeukerosh2tol2mbqzp2s6quskt4twaahnfopkupebqi';
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

    // Send push notification via OneSignal
    console.log('Sending OneSignal notification to:', profile.onesignal_player_id);
    
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${ONESIGNAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: [profile.onesignal_player_id],
        headings: { en: 'Incoming Call 📹' },
        contents: { en: `${callerName || 'Someone'} is calling you on UREPP` },
        data: {
          type: 'video_call',
          roomUrl: roomUrl,
          callerName: callerName,
        },
        priority: 10, // High priority
        ttl: 60, // 60 seconds expiration
      }),
    });

    console.log('OneSignal response status:', response.status);
    
    const responseText = await response.text();
    console.log('OneSignal raw response:', responseText);

    if (!response.ok) {
      console.error('OneSignal error:', responseText);
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
