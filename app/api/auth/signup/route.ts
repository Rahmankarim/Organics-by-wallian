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

    // Generate email verification token
    const emailVerificationToken = Math.random().toString(36).substring(2, 15) + 
                                   Math.random().toString(36).substring(2, 15)

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user in DB with isEmailVerified: false
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      isEmailVerified: false,
      emailVerificationToken
    })
    await newUser.save()

    // Send verification email
    const { sendVerificationEmail } = await import('@/lib/email')
    await sendVerificationEmail(email, emailVerificationToken)

    return NextResponse.json({
      message: 'Verification email sent. Please check your email to verify your account.'
    }, { status: 200 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
