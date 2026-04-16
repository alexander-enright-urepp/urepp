import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Calendly webhook handler - uses service role key since Calendly has no auth cookies

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    console.log('=== CALENDLY WEBHOOK RECEIVED ===');
    console.log('Event type:', payload.event);
    console.log('Full payload:', JSON.stringify(payload, null, 2));
    
    // Use service role client for webhook
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const eventType = payload.event;
    const data = payload.payload;
    
    if (!data?.event || !data?.invitee) {
      console.error('Missing event or invitee in payload');
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }
    
    const event = data.event;
    const invitee = data.invitee;
    
    // Extract info
    const schedulingUrl = invitee.scheduling_url || '';
    console.log('Scheduling URL:', schedulingUrl);
    
    // Extract Calendly username from URL
    let calendlyUsername = '';
    const match = schedulingUrl.match(/calendly\.com\/([^\/]+)/);
    if (match) {
      calendlyUsername = match[1].toLowerCase();
      console.log('Username:', calendlyUsername);
    }
    
    // Find matching coach
    const { data: coaches } = await supabase
      .from('profiles')
      .select('id, calendly_link')
      .not('calendly_link', 'is', null);
    
    let coachId: string | null = null;
    
    for (const coach of coaches || []) {
      const coachUrl = (coach.calendly_link || '').toLowerCase();
      if (coachUrl.includes(calendlyUsername)) {
        coachId = coach.id;
        console.log('Matched coach:', coachId);
        break;
      }
    }
    
    if (!coachId) {
      console.log('No matching coach found for:', calendlyUsername);
      return NextResponse.json({ message: 'Coach not found' });
    }
    
    // Save appointment
    const { error } = await supabase
      .from('appointments')
      .upsert({
        coach_id: coachId,
        calendly_event_id: event.uuid,
        calendly_invitee_id: invitee.uuid,
        event_type_name: event.name,
        start_time: event.start_time,
        end_time: event.end_time,
        status: eventType === 'invitee.created' ? 'scheduled' : 'cancelled',
        athlete_email: invitee.email,
        athlete_name: invitee.name || invitee.email,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'calendly_event_id'
      });
    
    if (error) {
      console.error('DB error:', error);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }
    
    console.log('Appointment saved');
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
