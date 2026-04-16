import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Initiate Calendly OAuth flow
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check environment variables first
    const clientId = process.env.CALENDLY_CLIENT_ID;
    
    if (!clientId) {
      console.error('CALENDLY_CLIENT_ID not configured');
      return NextResponse.json({ 
        error: 'Server configuration error: CALENDLY_CLIENT_ID not set' 
      }, { status: 500 });
    }
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ 
        error: 'Authentication error: ' + authError.message 
      }, { status: 401 });
    }
    
    if (!user) {
      console.error('No user session found');
      return NextResponse.json({ 
        error: 'Unauthorized: Please sign in again' 
      }, { status: 401 });
    }
    
    console.log('Starting Calendly OAuth for user:', user.id);
    
    // Build the authorization URL
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/calendly/callback`;
    
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      timestamp: Date.now()
    })).toString('base64');
    
    const authUrl = new URL('https://auth.calendly.com/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    
    console.log('Redirecting to Calendly:', authUrl.toString());
    
    return NextResponse.json({ url: authUrl.toString() });
    
  } catch (error) {
    console.error('Calendly OAuth initiation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
