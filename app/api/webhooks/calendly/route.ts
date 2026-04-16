import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    console.log('=== CALENDLY WEBHOOK ===');
    console.log('Event:', payload.event);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const eventType = payload.event;
    const data = payload.payload;
    
    if (!data?.event || !data?.invitee) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }
    
    const event = data.event;
    const invitee = data.invitee;
    
    // Extract scheduling URL to find coach
    const schedulingUrl = invitee.scheduling_url || '';
    const match = schedulingUrl.match(/calendly\.com\/([^\/]+)/);
    const calendlyUsername = match ? match[1].toLowerCase() : '';
    
    // Find coach
    const { data: coaches } = await supabase
      .from('profiles')
      .select('id, calendly_link')
      .not('calendly_link', 'is', null);
    
    let coachId: string | null = null;
    for (const coach of coaches || []) {
      if ((coach.calendly_link || '').toLowerCase().includes(calendlyUsername)) {
        coachId = coach.id;
        break;
      }
    }
    
    if (!coachId) {
      return NextResponse.json({ message: 'Coach not found' });
    }
    
    // Find athlete by email
    let athleteId: string | null = null;
    const { data: athleteProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', invitee.email)
      .maybeSingle();
    
    if (athleteProfile) {
      athleteId = athleteProfile.id;
      console.log('Found athlete:', athleteId);
    }
    
    // Save appointment with both IDs
    const { error } = await supabase
      .from('appointments')
      .upsert({
        coach_id: coachId,
        athlete_id: athleteId,  // NULL if athlete not in system yet
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
    
    return NextResponse.json({ success: true, athleteLinked: !!athleteId });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
