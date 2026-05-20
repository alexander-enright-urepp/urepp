import { NextRequest, NextResponse } from 'next/server';

const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;
const ONESIGNAL_APP_ID = '209456e7-6318-4254-aad7-54df0d7198f4';

export async function GET(request: NextRequest) {
  try {
    if (!ONESIGNAL_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Get all devices from OneSignal
    const response = await fetch(`https://onesignal.com/api/v1/players?app_id=${ONESIGNAL_APP_ID}&limit=100`, {
      headers: {
        'Authorization': `Key ${ONESIGNAL_API_KEY}`,
      },
    });

    const data = await response.json();
    
    return NextResponse.json({
      status: response.status,
      players: data.players || [],
      total: data.total_count || 0
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
