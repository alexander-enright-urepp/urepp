import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Manual webhook registration
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    const sessionToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Create client with user's session
    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${sessionToken}` } },
      }
    );
    
    // Get current user
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, calendly_link')
      .eq('user_id', user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    // Get Calendly tokens
    const { data: tokens } = await supabase
      .from('calendly_tokens')
      .select('access_token')
      .eq('profile_id', profile.id)
      .single();
    
    if (!tokens?.access_token) {
      return NextResponse.json({ error: 'Calendly not connected' }, { status: 400 });
    }
    
    // Get Calendly user info
    const userRes = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Failed to get Calendly user' }, { status: 500 });
    }
    
    const userData = await userRes.json();
    const orgUri = userData.resource?.current_organization;
    const userUri = userData.resource?.uri;
    
    if (!orgUri || !userUri) {
      return NextResponse.json({ error: 'Missing organization or user URI' }, { status: 500 });
    }
    
    // Register webhook
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.urepp.app';
    const webhookRes = await fetch('https://api.calendly.com/webhook_subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `${appUrl}/api/webhooks/calendly`,
        events: ['invitee.created', 'invitee.canceled'],
        organization: orgUri,
        user: userUri,
      }),
    });
    
    if (!webhookRes.ok) {
      const errorText = await webhookRes.text();
      return NextResponse.json({ 
        error: 'Failed to register webhook', 
        details: errorText,
        status: webhookRes.status 
      }, { status: 500 });
    }
    
    const webhookData = await webhookRes.json();
    
    return NextResponse.json({ 
      success: true, 
      webhookId: webhookData.resource?.uri,
      message: 'Webhook registered successfully' 
    });
    
  } catch (error) {
    console.error('Webhook registration error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
