import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/mongoose'
import dbConnect from '@/lib/mongoose'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    await dbConnect()
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: 'Email already verified' },
        { status: 200 }
      )
    }
    if (!user.emailVerificationCode || !user.emailVerificationCodeExpires) {
      return NextResponse.json(
        { error: 'No verification code found. Please sign up again.' },
        { status: 400 }
      )
    }
    if (user.emailVerificationCode !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }
    if (user.emailVerificationCodeExpires < new Date()) {
      return NextResponse.json(
        { error: 'Verification code expired. Please sign up again.' },
        { status: 400 }
      )
    }
    // Mark user as verified
    user.isEmailVerified = true
    user.emailVerificationCode = undefined
    user.emailVerificationCodeExpires = undefined
    await user.save()
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
