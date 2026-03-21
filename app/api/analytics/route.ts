import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const playerId = searchParams.get('playerId')
    
    if (!playerId) {
      return NextResponse.json({ error: 'playerId required' }, { status: 400 })
    }
    
    // Return mock data for now
    return NextResponse.json({ 
      totalViews: 1234, 
      videoCount: 3, 
      avgViews: 411 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Analytics failed' }, { status: 500 })
  }
}
