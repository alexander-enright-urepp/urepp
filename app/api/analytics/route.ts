import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const playerId = searchParams.get('playerId')
    
    if (!playerId) {
      return NextResponse.json({ error: 'playerId required' }, { status: 400 })
    }
    
    const { data: videos } = await supabase
      .from('videos')
      .select('id, views, created_at, sport_type')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })
    
    const totalViews = videos?.reduce((sum, v) => sum + (v.views || 0), 0) || 0
    const videoCount = videos?.length || 0
    const avgViews = videoCount > 0 ? Math.round(totalViews / videoCount) : 0
    
    return NextResponse.json({ totalViews, videoCount, avgViews })
  } catch (error) {
    return NextResponse.json({ error: 'Analytics failed' }, { status: 500 })
  }
}