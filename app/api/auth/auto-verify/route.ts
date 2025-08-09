import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { User } from '@/lib/mongoose'

// Development utility to auto-verify all unverified users
export async function POST(request: NextRequest) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      )
    }

    await dbConnect()

    // Update all unverified users to be verified
    const result = await User.updateMany(
      { isEmailVerified: false },
      { 
        isEmailVerified: true,
        emailVerificationToken: null
      }
    )

    return NextResponse.json({
      message: `Successfully verified ${result.modifiedCount} users in development mode`,
      modifiedCount: result.modifiedCount
    }, { status: 200 })

  } catch (error) {
    console.error('Auto-verify error:', error)
    return NextResponse.json(
      { error: 'Failed to auto-verify users' },
      { status: 500 }
    )
  }
}
