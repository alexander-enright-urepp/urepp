import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Get or create Calendly webhooks for the current user
export async function GET(request: NextRequest) {
  try {
    console.log('Webhook check starting...');
    
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!accessToken) {
      console.error('No access token provided');
      return NextResponse.json({ error: 'No auth token' }, { status: 401 });
    }
    
    console.log('Got access token, fetching Calendly user...');
    
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
    console.log('Calendly user data:', JSON.stringify(userData, null, 2));
    
    const userUri = userData.resource?.uri;
    const orgUri = userData.resource?.current_organization;
    
    console.log('User URI:', userUri, 'Org URI:', orgUri);
    
    if (!userUri || !orgUri) {
      console.error('Missing user or org URI');
      return NextResponse.json({ error: 'Missing user or org URI' }, { status: 500 });
    }
    
    // List existing webhooks
    console.log('Fetching webhooks list...');
    const listUrl = `https://api.calendly.com/webhook_subscriptions?organization=${encodeURIComponent(orgUri)}&user=${encodeURIComponent(userUri)}`;
    console.log('List URL:', listUrl);
    
    const listRes = await fetch(listUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('List webhooks response status:', listRes.status);
    
    if (!listRes.ok) {
      const errorText = await listRes.text();
      console.error('Failed to list webhooks:', errorText);
      return NextResponse.json({ 
        error: 'Failed to list webhooks', 
        details: errorText 
      }, { status: 500 });
    }
    
    const listData = await listRes.json();
    console.log('Webhooks list:', JSON.stringify(listData, null, 2));
    
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
    
    console.log('No existing webhook found, creating new one...');
    
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
