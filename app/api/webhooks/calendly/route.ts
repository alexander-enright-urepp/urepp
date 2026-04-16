import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
      console.error('Invalid payload - no payload data');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    
    // Get event and invitee info
    const event = payloadData.event;
    const invitee = payloadData.invitee;
    
    if (!event || !invitee) {
      console.error('Missing event or invitee data');
      return NextResponse.json({ error: 'Missing event or invitee data' }, { status: 400 });
    }
    
    // Get event details
    const calendlyEventId = event.uuid;
    const calendlyInviteeId = invitee.uuid;
    const eventTypeName = event.name;
    const startTime = event.start_time;
    const endTime = event.end_time;
    const status = eventType === 'invitee.created' ? 'scheduled' : 
                   eventType === 'invitee.canceled' ? 'cancelled' : 'scheduled';
    
    // Athlete info
    const athleteEmail = invitee.email;
    const athleteName = invitee.name || invitee.email;
    const notes = invitee.questions_and_answers?.map((qa: any) => `${qa.question}: ${qa.answer}`).join('\n') || '';
    
    // Get the Calendly event type URI - this contains the event type ID
    const eventTypeUri = event.event_type;
    console.log('Event type URI:', eventTypeUri);
    
    // Get the scheduling URL from invitee
    const schedulingUrl = invitee.scheduling_url || '';
    console.log('Scheduling URL:', schedulingUrl);
    
    // Extract Calendly username from various sources
    let calendlyUsername: string | null = null;
    
    // Try to extract from scheduling URL: https://calendly.com/username/...
    if (schedulingUrl) {
      const urlMatch = schedulingUrl.match(/calendly\.com\/([^\/]+)/);
      if (urlMatch) {
        calendlyUsername = urlMatch[1];
        console.log('Found Calendly username from URL:', calendlyUsername);
      }
    }
    
    // Try to extract from event_type URI
    if (!calendlyUsername && eventTypeUri) {
      // Event type might contain user info
      console.log('Event type URI:', eventTypeUri);
    }
    
    // Find coach by calendly_link
    const { data: coaches, error: coachError } = await supabase
      .from('profiles')
      .select('id, calendly_link, first_name, last_name')
      .not('calendly_link', 'is', null);
    
    if (coachError) {
      console.error('Failed to fetch coaches:', coachError);
      return NextResponse.json({ error: 'Coach lookup failed' }, { status: 500 });
    }
    
    console.log(`Found ${coaches?.length || 0} coaches with Calendly links`);
    
    // Try to match coach
    let coachId: string | null = null;
    let matchedCoach: any = null;
    
    for (const coach of coaches || []) {
      if (!coach.calendly_link) continue;
      
      const coachLink = coach.calendly_link.toLowerCase().replace('https://', '').replace('http://', '');
      
      // Match by Calendly username extracted from URL
      if (calendlyUsername && coachLink.includes(calendlyUsername.toLowerCase())) {
        coachId = coach.id;
        matchedCoach = coach;
        console.log('Matched coach by username:', coach.first_name, coach.last_name);
        break;
      }
      
      // Match if scheduling URL contains coach's calendly link
      if (schedulingUrl && schedulingUrl.toLowerCase().includes(coachLink)) {
        coachId = coach.id;
        matchedCoach = coach;
        console.log('Matched coach by URL:', coach.first_name, coach.last_name);
        break;
      }
    }
    
    if (!coachId) {
      console.log('Could not match coach. Scheduling URL:', schedulingUrl);
      console.log('Calendly username extracted:', calendlyUsername);
      console.log('Available coaches:', coaches?.map(c => ({ id: c.id, link: c.calendly_link })));
      
      // Still return 200 so Calendly doesn't retry
      return NextResponse.json({ 
        message: 'Coach not found, logged for review',
        debug: { schedulingUrl, calendlyUsername }
      });
    }
    
    // Also try to find athlete by email to link them
    let athleteId: string | null = null;
    const { data: athleteProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', athleteEmail)
      .maybeSingle();
    
    if (athleteProfile) {
      athleteId = athleteProfile.id;
      console.log('Found athlete profile:', athleteId);
    }
    
    // Insert or update the appointment
    const appointmentData = {
      coach_id: coachId,
      athlete_id: athleteId,  // Will be null if no matching profile
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
    };
    
    console.log('Saving appointment:', appointmentData);
    
    const { error: upsertError } = await supabase
      .from('appointments')
      .upsert(appointmentData, {
        onConflict: 'calendly_event_id'
      });
    
    if (upsertError) {
      console.error('Failed to save appointment:', upsertError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    console.log('Appointment saved successfully');
    return NextResponse.json({ success: true, coachMatched: matchedCoach?.first_name + ' ' + matchedCoach?.last_name });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Calendly sends HEAD requests to verify the webhook
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
