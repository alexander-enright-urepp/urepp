import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Initiate Calendly OAuth flow
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const clientId = process.env.CALENDLY_CLIENT_ID;
    
    if (!clientId) {
      return NextResponse.json({ error: 'Calendly client ID not configured' }, { status: 500 });
    }
    
    // Build the authorization URL
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/calendly/callback`;
    
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      timestamp: Date.now()
    })).toString('base64');
    
    const authUrl = new URL('https://auth.calendly.com/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    
    return NextResponse.json({ url: authUrl.toString() });
    
  } catch (error) {
    console.error('Calendly OAuth initiation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
