import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for OAuth callback
export const dynamic = 'force-dynamic';

// Handle Calendly OAuth callback
export async function GET(request: NextRequest) {
  try {
    console.log('Calendly callback received:', request.url);
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');
    
    console.log('Callback params:', { code: !!code, error, state: !!state });
    
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    if (error) {
      console.error('Calendly OAuth error:', error);
      return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=oauth_denied`);
    }
    
    if (!code) {
      console.error('No code received');
      return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=no_code`);
    }
    
    const clientId = process.env.CALENDLY_CLIENT_ID;
    const clientSecret = process.env.CALENDLY_CLIENT_SECRET;
    
    console.log('Env vars:', { 
      hasClientId: !!clientId, 
      hasClientSecret: !!clientSecret,
      redirectUri: `${appUrl}/api/auth/calendly/callback`
    });
    
    if (!clientId || !clientSecret) {
      console.error('Missing Calendly credentials');
      return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=not_configured`);
    }
    
    // Exchange code for tokens
    console.log('Exchanging code for tokens...');
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
    
    console.log('Token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorData);
      return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=token_exchange`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log('Got tokens:', { hasAccessToken: !!tokenData.access_token, hasRefreshToken: !!tokenData.refresh_token, expiresIn: tokenData.expires_in });
    
    // Create Supabase client with service role for token storage
    console.log('Creating Supabase client...');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    
    // Decode state to get user ID
    console.log('Decoding state...');
    let userId: string | null = null;
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        userId = stateData.userId;
        console.log('Decoded userId:', userId);
      } catch (e) {
        console.error('Failed to decode state:', e);
      }
    }
    
    if (!userId) {
      console.error('No userId in state');
      return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=no_user`);
    }
    
    // Get profile ID from user ID
    console.log('Fetching profile for user:', userId);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }
    
    if (!profile) {
      console.error('No profile found for user:', userId);
      return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=no_profile`);
    }
    
    console.log('Found profile:', profile.id);
    
    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
    
    // Fetch Calendly user info first to get organization URI
    console.log('Fetching Calendly user info...');
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    let calendlyUserUri: string | null = null;
    let calendlyOrganizationUri: string | null = null;
    let schedulingUrl: string | null = null;
    
    if (userResponse.ok) {
      const calendlyUserData = await userResponse.json();
      console.log('Calendly user data:', JSON.stringify(calendlyUserData, null, 2));
      calendlyUserUri = calendlyUserData.resource?.uri;
      calendlyOrganizationUri = calendlyUserData.resource?.current_organization;
      schedulingUrl = calendlyUserData.resource?.scheduling_url;
      
      console.log('Calendly URIs:', { calendlyUserUri, calendlyOrganizationUri, schedulingUrl });
    } else {
      console.error('Failed to fetch Calendly user:', await userResponse.text());
    }
    
    // Store tokens in database with Calendly URIs
    console.log('Storing tokens...');
    const { error: upsertError } = await supabase
      .from('calendly_tokens')
      .upsert({
        profile_id: profile.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        scope: tokenData.scope,
        calendly_user_uri: calendlyUserUri,
        calendly_organization_uri: calendlyOrganizationUri,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'profile_id'
      });
    
    if (upsertError) {
      console.error('Failed to store tokens:', upsertError);
      return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=storage`);
    }
    
    console.log('Tokens stored successfully');
    
    // Update profile with Calendly link
    if (schedulingUrl) {
      console.log('Updating profile with scheduling URL:', schedulingUrl);
      await supabase
        .from('profiles')
        .update({
          calendly_link: schedulingUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
    }
    
    // Register webhook for automatic booking sync
    if (calendlyOrganizationUri) {
      console.log('Registering Calendly webhook for organization:', calendlyOrganizationUri);
      try {
        const webhookUrl = `${appUrl}/api/webhooks/calendly`;
        
        // Create organization-level webhook subscription
        const webhookRes = await fetch('https://api.calendly.com/v2/webhook_subscriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: webhookUrl,
            events: ['invitee.created', 'invitee.canceled'],
            organization: calendlyOrganizationUri,
            scope: 'organization',
          }),
        });
        
        if (webhookRes.ok) {
          const webhookData = await webhookRes.json();
          console.log('Webhook registered successfully:', webhookData.resource?.uri);
          
          // Store webhook info in calendly_tokens
          await supabase
            .from('calendly_tokens')
            .update({
              webhook_id: webhookData.resource?.uri,
              webhook_url: webhookUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('profile_id', profile.id);
            
          console.log('Webhook info stored in database');
        } else {
          const errorText = await webhookRes.text();
          console.error('Webhook registration failed:', webhookRes.status, errorText);
          // Don't fail the whole OAuth flow if webhook fails
        }
      } catch (webhookError) {
        console.error('Webhook registration error:', webhookError);
        // Continue - don't block OAuth completion
      }
    } else {
      console.log('Skipping webhook registration - no organization URI available');
    }
    
    console.log('Redirecting to success');
    return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?success=connected`);
    
  } catch (error) {
    console.error('Calendly callback error:', error);
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.redirect(`${appUrl}/dashboard/coaches/settings?error=unknown&debug=${encodeURIComponent(errorMessage)}`);
  }
}
