import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/mongoose'
import dbConnect from '@/lib/mongoose'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find user with verification token
    const user = await User.findOne({ emailVerificationToken: token })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Update user as verified
    await User.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      emailVerificationToken: undefined
    })

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
