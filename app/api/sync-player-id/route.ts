import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { playerId } = await request.json();
    
    if (!playerId) {
      return NextResponse.json({ error: 'Missing playerId' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        onesignal_player_id: playerId,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Sync error:', error);
      return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
    }

    return NextResponse.json({ success: true, playerId });
  } catch (err) {
    console.error('Sync error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
