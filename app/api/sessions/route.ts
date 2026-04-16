import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createRoom } from '@/lib/daily';

// POST /api/sessions - Create a new video session
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { appointmentId, athleteName, coachName } = body;
    
    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 });
    }
    
    // Check if session already exists for this appointment
    const { data: existingSession } = await supabase
      .from('video_sessions')
      .select('*')
      .eq('appointment_id', appointmentId)
      .single();
    
    if (existingSession) {
      return NextResponse.json({ 
        roomUrl: existingSession.room_url,
        sessionId: existingSession.id,
      });
    }
    
    // Create Daily room
    const roomName = `urepp-session-${appointmentId}-${Date.now()}`;
    const room = await createRoom(
      `UREPP: ${coachName} ↔ ${athleteName}`,
      120 // 2 hour expiration
    );
    
    // Store in database
    const { data: session, error: dbError } = await supabase
      .from('video_sessions')
      .insert({
        appointment_id: appointmentId,
        room_url: room.url,
        room_name: room.name,
        created_by: user.id,
        status: 'active',
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
    }
    
    return NextResponse.json({
      roomUrl: room.url,
      sessionId: session.id,
    });
    
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
