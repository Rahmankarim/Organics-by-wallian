import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { User } from '@/lib/mongoose'
import { hashPassword, validateEmail, validatePassword } from '@/lib/auth'
import { rateLimit } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(5, 15 * 60 * 1000)(request) // 5 attempts per 15 minutes
    if (rateLimitResult) {
      return rateLimitResult
    }

    const body = await request.json()
    const { firstName, lastName, email, password, phone } = body

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, number and special character' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Generate 6-digit code and expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user in DB with isEmailVerified: false and code
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      isEmailVerified: false,
      emailVerificationCode: code,
      emailVerificationCodeExpires: codeExpires
    })
    await newUser.save()

    // Send verification code email
    const { sendVerificationCodeEmail } = await import('@/lib/email')
    await sendVerificationCodeEmail(email, code)

    return NextResponse.json({
      message: 'Verification code sent. Please check your email to verify your account.'
    }, { status: 200 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
