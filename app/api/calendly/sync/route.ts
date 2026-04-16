import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Manually sync Calendly bookings
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get profile and tokens
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, calendly_link')
      .eq('user_id', user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    
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
    const calendlyUserUri = userData.resource?.uri;
    
    // Get scheduled events
    const now = new Date().toISOString();
    const eventsRes = await fetch(
      `https://api.calendly.com/scheduled_events?user=${calendlyUserUri}&min_start_time=${now}`,
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!eventsRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
    
    const eventsData = await eventsRes.json();
    const events = eventsData.collection || [];
    
    let syncedCount = 0;
    
    // For each event, get invitees
    for (const event of events) {
      const inviteesRes = await fetch(
        `https://api.calendly.com/scheduled_events/${event.uuid}/invitees`,
        {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (inviteesRes.ok) {
        const inviteesData = await inviteesRes.json();
        const invitees = inviteesData.collection || [];
        
        for (const invitee of invitees) {
          // Upsert appointment
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
            }, {
              onConflict: 'calendly_event_id'
            });
          
          if (!upsertError) {
            syncedCount++;
          }
        }
      }
    }
    
    return NextResponse.json({ success: true, count: syncedCount });
    
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
