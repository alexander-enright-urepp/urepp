import { NextRequest, NextResponse } from 'next/server';

const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;
const ONESIGNAL_APP_ID = '209456e7-6318-4254-aad7-54df0d7198f4';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    
    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notification ID' }, { status: 400 });
    }
    
    if (!ONESIGNAL_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Check notification status
    const response = await fetch(
      `https://onesignal.com/api/v1/notifications/${notificationId}?app_id=${ONESIGNAL_APP_ID}`,
      {
        headers: {
          'Authorization': `Key ${ONESIGNAL_API_KEY}`,
        },
      }
    );

    const data = await response.json();
    
    return NextResponse.json({
      status: response.status,
      notification: data
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
