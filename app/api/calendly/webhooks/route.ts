import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Get or create Calendly webhooks for the current user
export async function GET(request: NextRequest) {
  try {
    console.log('Webhook check starting...');
    
    // Create Supabase admin client to look up Calendly tokens
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get auth token from header to identify user
    const authHeader = request.headers.get('Authorization');
    const sessionToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!sessionToken) {
      console.error('No session token provided');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Create a client with the user's session to get their user ID
    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        },
      }
    );
    
    // Get current user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    console.log('User ID:', user.id);
    
    // Get profile to find coach
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || !profile) {
      console.error('Profile not found:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    // Get Calendly tokens
    const { data: tokens, error: tokenError } = await supabase
      .from('calendly_tokens')
      .select('access_token')
      .eq('profile_id', profile.id)
      .single();
    
    if (tokenError || !tokens?.access_token) {
      console.error('Calendly not connected:', tokenError);
      return NextResponse.json({ error: 'Calendly not connected' }, { status: 400 });
    }
    
    const accessToken = tokens.access_token;
    console.log('Got Calendly access token');
    
    // Get Calendly user info
    const userRes = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Calendly user response status:', userRes.status);
    
    if (!userRes.ok) {
      const errorText = await userRes.text();
      console.error('Failed to get Calendly user:', errorText);
      return NextResponse.json({ error: 'Failed to get Calendly user', details: errorText }, { status: 500 });
    }
    
    const userData = await userRes.json();
    const userUri = userData.resource?.uri;
    const orgUri = userData.resource?.current_organization;
    
    console.log('User URI:', userUri, 'Org URI:', orgUri);
    
    if (!userUri || !orgUri) {
      return NextResponse.json({ error: 'Missing user or org URI' }, { status: 500 });
    }
    
    // List existing webhooks
    console.log('Fetching webhooks list...');
    const listRes = await fetch(
      `https://api.calendly.com/webhook_subscriptions?organization=${encodeURIComponent(orgUri)}&user=${encodeURIComponent(userUri)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('List webhooks response status:', listRes.status);
    
    if (!listRes.ok) {
      const errorText = await listRes.text();
      console.error('Failed to list webhooks:', listRes.status, errorText);
      return NextResponse.json({ 
        error: 'Failed to list webhooks', 
        status: listRes.status,
        details: errorText 
      }, { status: 500 });
    }
    
    const listData = await listRes.json();
    
    // Check if our webhook exists
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.urepp.app';
    const webhookUrl = `${appUrl}/api/webhooks/calendly`;
    console.log('Looking for webhook URL:', webhookUrl);
    
    const existingWebhook = listData.collection?.find(
      (w: any) => w.url === webhookUrl
    );
    
    if (existingWebhook) {
      console.log('Found existing webhook:', existingWebhook.uri);
      return NextResponse.json({ 
        status: 'exists',
        webhook: existingWebhook 
      });
    }
    
    console.log('No existing webhook, creating...');
    
    // Create webhook
    const createRes = await fetch('https://api.calendly.com/webhook_subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        events: ['invitee.created', 'invitee.canceled', 'invitee.no_show'],
        organization: orgUri,
        user: userUri,
        signing_key: process.env.CALENDLY_WEBHOOK_SIGNING_KEY || 'urepp-webhook-secret',
      }),
    });
    
    console.log('Create webhook response status:', createRes.status);
    
    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.error('Failed to create webhook:', errorText);
      return NextResponse.json({ 
        error: 'Failed to create webhook', 
        details: errorText 
      }, { status: 500 });
    }
    
    const createData = await createRes.json();
    console.log('Created webhook:', JSON.stringify(createData, null, 2));
    
    return NextResponse.json({ 
      status: 'created',
      webhook: createData.resource 
    });
    
  } catch (error) {
    console.error('Webhook check error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
