import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Manually sync Calendly bookings
export async function POST(request: NextRequest) {
  try {
    // Create Supabase admin client
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
        global: {
          headers: { Authorization: `Bearer ${sessionToken}` },
        },
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
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    // Get tokens with refresh
    const { data: tokens } = await supabase
      .from('calendly_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('profile_id', profile.id)
      .single();
    
    if (!tokens?.access_token) {
      return NextResponse.json({ error: 'Calendly not connected' }, { status: 400 });
    }
    
    let accessToken = tokens.access_token;
    
    // Refresh if expired
    const expiresAt = tokens.expires_at ? new Date(tokens.expires_at) : null;
    if (expiresAt && expiresAt < new Date() && tokens.refresh_token) {
      const refreshRes = await fetch('https://auth.calendly.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokens.refresh_token,
          client_id: process.env.CALENDLY_CLIENT_ID!,
          client_secret: process.env.CALENDLY_CLIENT_SECRET!,
        }),
      });
      
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        accessToken = refreshData.access_token;
        
        const newExpiresAt = new Date();
        newExpiresAt.setSeconds(newExpiresAt.getSeconds() + refreshData.expires_in);
        
        await supabase.from('calendly_tokens').update({
          access_token: refreshData.access_token,
          refresh_token: refreshData.refresh_token,
          expires_at: newExpiresAt.toISOString(),
        }).eq('profile_id', profile.id);
      }
    }
    
    // Get Calendly user
    const userRes = await fetch('https://api.calendly.com/users/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Failed to get Calendly user' }, { status: 500 });
    }
    
    const userData = await userRes.json();
    const calendlyUserUri = userData.resource?.uri;
    
    // Get events
    const now = new Date().toISOString();
    const eventsRes = await fetch(
      `https://api.calendly.com/scheduled_events?user=${calendlyUserUri}&min_start_time=${now}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    
    if (!eventsRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
    
    const eventsData = await eventsRes.json();
    const events = eventsData.collection || [];
    
    let syncedCount = 0;
    
    for (const event of events) {
      const inviteesRes = await fetch(
        `https://api.calendly.com/scheduled_events/${event.uuid}/invitees`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      
      if (inviteesRes.ok) {
        const inviteesData = await inviteesRes.json();
        const invitees = inviteesData.collection || [];
        
        for (const invitee of invitees) {
          const { error: upsertError } = await supabase
            .from('appointments')
            .upsert({
              coach_id: profile.id,
              calendly_event_id: event.uuid,
              calendly_invitee_id: invitee.uuid,
              event_type_name: event.name,
              start_time: event.start_time,
              end_time: event.end_time,
              status: invitee.status === 'active' ? 'scheduled' : 'cancelled',
              athlete_email: invitee.email,
              athlete_name: invitee.name || invitee.email,
              updated_at: new Date().toISOString()
            }, { onConflict: 'calendly_event_id' });
          
          if (!upsertError) syncedCount++;
        }
      }
    }
    
    return NextResponse.json({ success: true, count: syncedCount });
    
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
