import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Create webhook subscription for a connected Calendly account
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get user's Calendly tokens
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, calendly_link')
      .eq('user_id', user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    const { data: tokenData } = await supabase
      .from('calendly_tokens')
      .select('access_token, calendly_user_uri, calendly_organization_uri')
      .eq('profile_id', profile.id)
      .single();
    
    if (!tokenData?.access_token) {
      return NextResponse.json({ error: 'Calendly not connected' }, { status: 400 });
    }
    
    const { access_token, calendly_organization_uri } = tokenData;
    
    // Webhook URL - use your production URL
    const webhookUrl = process.env.CALENDLY_WEBHOOK_URL || 
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://urepp.app'}/api/webhooks/calendly`;
    
    console.log('Creating webhook subscription:', webhookUrl);
    
    // Create webhook subscription via Calendly API
    const response = await fetch('https://api.calendly.com/v2/webhook_subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        events: ['invitee.created', 'invitee.canceled'],
        organization: calendly_organization_uri,
        scope: 'organization',
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Calendly webhook creation failed:', data);
      return NextResponse.json({ 
        error: 'Failed to create webhook', 
        details: data 
      }, { status: 500 });
    }
    
    // Store webhook ID in database
    await supabase
      .from('calendly_tokens')
      .update({
        webhook_id: data.resource?.uri,
        webhook_url: webhookUrl,
        updated_at: new Date().toISOString()
      })
      .eq('profile_id', profile.id);
    
    console.log('Webhook created:', data.resource?.uri);
    
    return NextResponse.json({ 
      success: true, 
      webhookId: data.resource?.uri 
    });
    
  } catch (error) {
    console.error('Webhook setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// List existing webhook subscriptions
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    const { data: tokenData } = await supabase
      .from('calendly_tokens')
      .select('access_token, calendly_organization_uri, webhook_id, webhook_url')
      .eq('profile_id', profile.id)
      .single();
    
    if (!tokenData?.access_token) {
      return NextResponse.json({ error: 'Calendly not connected' }, { status: 400 });
    }
    
    // List webhooks from Calendly
    const response = await fetch(
      `https://api.calendly.com/v2/webhook_subscriptions?organization=${encodeURIComponent(tokenData.calendly_organization_uri)}`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      }
    );
    
    const data = await response.json();
    
    return NextResponse.json({
      calendlyWebhooks: data.collection || [],
      storedWebhookId: tokenData.webhook_id,
      storedWebhookUrl: tokenData.webhook_url
    });
    
  } catch (error) {
    console.error('Webhook list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
