import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Calendly webhook handler
// This endpoint receives booking events from Calendly

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Log the payload for debugging
    console.log('Calendly webhook received:', JSON.stringify(payload, null, 2));
    
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Extract event data based on Calendly webhook structure
    const eventType = payload.event; // invitee.created, invitee.canceled, etc.
    const payloadData = payload.payload;
    
    if (!payloadData) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    
    // Get event and invitee info
    const event = payloadData.event;
    const invitee = payloadData.invitee;
    
    if (!event || !invitee) {
      return NextResponse.json({ error: 'Missing event or invitee data' }, { status: 400 });
    }
    
    // Find the coach by Calendly event type URI or email
    // The event URI contains the Calendly user info
    const eventTypeUri = event.event_type; // e.g., "https://api.calendly.com/event_types/ABC123"
    const calendlyEventId = event.uuid;
    const calendlyInviteeId = invitee.uuid;
    
    // Try to find coach by calendly_link containing their username
    // Extract calendly username from event_type URI or use the scheduling URL
    const eventTypeName = event.name; // e.g., "30 Minute Session"
    const startTime = event.start_time;
    const endTime = event.end_time;
    const status = eventType === 'invitee.created' ? 'scheduled' : 
                   eventType === 'invitee.canceled' ? 'cancelled' : 'scheduled';
    
    // Athlete info
    const athleteEmail = invitee.email;
    const athleteName = invitee.name || invitee.email;
    const notes = invitee.questions_and_answers?.map((qa: any) => `${qa.question}: ${qa.answer}`).join('\n') || '';
    
    // Find coach - we'll match by checking if any profile has a calendly_link
    // that matches the event's scheduling URL
    // For now, we'll need to query all coaches and match manually
    // This is a simplified approach - in production you'd want better matching
    
    const { data: coaches, error: coachError } = await supabase
      .from('profiles')
      .select('id, calendly_link')
      .not('calendly_link', 'is', null);
    
    if (coachError || !coaches) {
      console.error('Failed to fetch coaches:', coachError);
      return NextResponse.json({ error: 'Coach lookup failed' }, { status: 500 });
    }
    
    // Try to match coach by calendly URL
    let coachId: string | null = null;
    
    // Get the event page URL which contains the calendly username
    const eventPageUrl = invitee.scheduling_url || event.location?.join_url || '';
    
    for (const coach of coaches) {
      if (coach.calendly_link && eventPageUrl.includes(coach.calendly_link.replace('https://', '').replace('http://', ''))) {
        coachId = coach.id;
        break;
      }
    }
    
    if (!coachId) {
      console.log('Could not match coach for event:', eventPageUrl);
      // Still return 200 so Calendly doesn't retry
      return NextResponse.json({ message: 'Coach not found, logged for review' });
    }
    
    // Upsert the appointment
    const { error: upsertError } = await supabase
      .from('appointments')
      .upsert({
        coach_id: coachId,
        calendly_event_id: calendlyEventId,
        calendly_invitee_id: calendlyInviteeId,
        event_type_name: eventTypeName,
        start_time: startTime,
        end_time: endTime,
        status: status,
        athlete_email: athleteEmail,
        athlete_name: athleteName,
        notes: notes,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'calendly_event_id'
      });
    
    if (upsertError) {
      console.error('Failed to save appointment:', upsertError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Calendly sends HEAD requests to verify the webhook
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
