import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return NextResponse.json({
    total: Math.floor(Math.random() * 1000) + 100,
    growth: Math.floor(Math.random() * 20) - 5,
    lastUpdated: new Date().toLocaleDateString()
  })
}