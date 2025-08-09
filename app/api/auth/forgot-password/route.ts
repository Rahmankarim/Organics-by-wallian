import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/mongoose'
import { generateSecureToken, validateEmail, sanitizeInput } from '@/lib/auth'
import dbConnect from '@/lib/mongoose'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase())

    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find user by email
    const user = await User.findOne({ email: sanitizedEmail })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account with this email exists, you will receive a password reset link.' },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = generateSecureToken()
    const resetExpires = new Date(Date.now() + 3600000) // 1 hour

    // Update user with reset token
    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires
    })

    // TODO: Send password reset email
    // await sendPasswordResetEmail(sanitizedEmail, resetToken)

    return NextResponse.json(
      { message: 'If an account with this email exists, you will receive a password reset link.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
