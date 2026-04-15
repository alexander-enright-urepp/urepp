import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Handle Calendly OAuth callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    if (error) {
      console.error('Calendly OAuth error:', error);
      return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=oauth_denied`);
    }
    
    if (!code) {
      return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=no_code`);
    }
    
    const clientId = process.env.CALENDLY_CLIENT_ID;
    const clientSecret = process.env.CALENDLY_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=not_configured`);
    }
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${appUrl}/api/auth/calendly/callback`,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=token_exchange`);
    }
    
    const tokenData = await tokenResponse.json();
    
    // Get user from state
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.redirect(`${appUrl}/login?redirect=/dashboard/coaches/settings`);
    }
    
    // Get profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (!profile) {
      return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=no_profile`);
    }
    
    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
    
    // Store tokens in database
    const { error: upsertError } = await supabase
      .from('calendly_tokens')
      .upsert({
        profile_id: profile.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        scope: tokenData.scope,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'profile_id'
      });
    
    if (upsertError) {
      console.error('Failed to store tokens:', upsertError);
      return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=storage`);
    }
    
    // Fetch Calendly user info to get scheduling URL
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      const schedulingUrl = userData.resource?.scheduling_url;
      
      if (schedulingUrl) {
        await supabase
          .from('profiles')
          .update({
            calendly_link: schedulingUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);
      }
    }
    
    return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?success=connected`);
    
  } catch (error) {
    console.error('Calendly callback error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=unknown`);
  }
}
