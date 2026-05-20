import { NextRequest, NextResponse } from 'next/server';

const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;
const ONESIGNAL_APP_ID = '209456e7-6318-4254-aad7-54df0d7198f4';

export async function POST(request: NextRequest) {
  try {
    const { playerId } = await request.json();
    
    if (!ONESIGNAL_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Check if player exists in OneSignal
    const response = await fetch(`https://onesignal.com/api/v1/players/${playerId}?app_id=${ONESIGNAL_APP_ID}`, {
      headers: {
        'Authorization': `key ${ONESIGNAL_API_KEY}`,
      },
    });

    const data = await response.json();
    
    return NextResponse.json({
      status: response.status,
      data: data
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
