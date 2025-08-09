import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Create response that clears the authentication cookie
    const response = NextResponse.json({
      message: 'Logged out successfully'
    })

    // Clear the admin authentication cookie
    response.cookies.set('adminAuth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0), // Set expiry to past date to delete cookie
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
