import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Cart debug GET working', 
    timestamp: new Date().toISOString() 
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ 
      message: 'Cart debug POST working',
      receivedBody: body,
      timestamp: new Date().toISOString() 
    })
  } catch (error) {
    return NextResponse.json({ 
      message: 'Cart debug POST working but body parse failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    })
  }
}