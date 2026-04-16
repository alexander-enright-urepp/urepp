import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Get or create Calendly webhooks for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No auth token' }, { status: 401 });
    }
    
    // Get Calendly user info
    const userRes = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Failed to get Calendly user' }, { status: 500 });
    }
    
    const userData = await userRes.json();
    const userUri = userData.resource?.uri;
    const orgUri = userData.resource?.current_organization;
    
    if (!userUri || !orgUri) {
      return NextResponse.json({ error: 'Missing user or org URI' }, { status: 500 });
    }
    
    // List existing webhooks
    const listRes = await fetch(
      `https://api.calendly.com/webhook_subscriptions?organization=${encodeURIComponent(orgUri)}&user=${encodeURIComponent(userUri)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!listRes.ok) {
      return NextResponse.json({ 
        error: 'Failed to list webhooks', 
        details: await listRes.text() 
      }, { status: 500 });
    }
    
    const listData = await listRes.json();
    
    // Check if our webhook exists
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.urepp.app';
    const webhookUrl = `${appUrl}/api/webhooks/calendly`;
    
    const existingWebhook = listData.collection?.find(
      (w: any) => w.url === webhookUrl
    );
    
    if (existingWebhook) {
      return NextResponse.json({ 
        status: 'exists',
        webhook: existingWebhook 
      });
    }
    
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
    
    if (!createRes.ok) {
      return NextResponse.json({ 
        error: 'Failed to create webhook', 
        details: await createRes.text() 
      }, { status: 500 });
    }
    
    const createData = await createRes.json();
    
    return NextResponse.json({ 
      status: 'created',
      webhook: createData.resource 
    });
    
  } catch (error) {
    console.error('Webhook check error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
