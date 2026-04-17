import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createRoom } from '@/lib/daily';

// POST /api/sessions - Create a new video session
export async function POST(request: NextRequest) {
  try {
    // Try to get auth from Authorization header first (Bearer token)
    const authHeader = request.headers.get('Authorization');
    let user = null;
    let supabase = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Create a temporary client to verify the token
      const tempClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      const { data: { user: tokenUser }, error: tokenError } = await tempClient.auth.getUser(token);
      if (!tokenError && tokenUser) {
        user = tokenUser;
        supabase = tempClient;
        console.log('Authenticated via Bearer token:', user.id);
      }
    }
    
    // Fall back to cookie-based auth
    if (!user) {
      const cookieStore = cookies();
      const routeClient = createRouteHandlerClient({ cookies: () => cookieStore });
      
      const { data: { user: cookieUser }, error: authError } = await routeClient.auth.getUser();
      
      if (authError || !cookieUser) {
        console.error('Unauthorized - no valid auth found');
        return NextResponse.json({ error: 'Unauthorized - please sign in again' }, { status: 401 });
      }
      
      user = cookieUser;
      supabase = routeClient;
      console.log('Authenticated via cookies:', user.id);
    }
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database client not initialized' }, { status: 500 });
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
