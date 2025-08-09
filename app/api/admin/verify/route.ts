import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Check for admin authentication cookie
    const adminAuth = request.cookies.get('adminAuth')
    
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      )
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(adminAuth.value, process.env.JWT_SECRET || 'fallback-secret')
      
      // Check if the decoded token has admin role and correct email
      if (typeof decoded === 'object' && decoded.email === 'rahmankarim2468@gmail.com' && decoded.role === 'admin') {
        return NextResponse.json({
          message: 'Authentication valid',
          user: {
            email: decoded.email,
            role: decoded.role,
            userId: decoded.userId
          }
        })
      } else {
        return NextResponse.json(
          { error: 'Invalid admin credentials' },
          { status: 401 }
        )
      }
    } catch (tokenError) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Admin verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
