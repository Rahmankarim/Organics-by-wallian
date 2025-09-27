import { NextRequest, NextResponse } from 'next/server'
import { User, PendingUser } from '@/lib/mongoose'
import { hashPassword, validateEmail, validatePassword, sanitizeInput } from '@/lib/auth'
import dbConnect from '@/lib/mongoose'
import { rateLimit } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// Rate limiting: 5 registration attempts per 15 minutes
const registerRateLimit = rateLimit(5, 15 * 60 * 1000)

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = registerRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase())
    const sanitizedFirstName = sanitizeInput(firstName)
    const sanitizedLastName = sanitizeInput(lastName)
    const sanitizedPhone = phone ? sanitizeInput(phone) : undefined

    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    const isPasswordValid = validatePassword(password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Check if user already exists in permanent User collection
    const existingUser = await User.findOne({ email: sanitizedEmail })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Check if there's already a pending signup for this email
    const existingPending = await PendingUser.findOne({ email: sanitizedEmail })
    if (existingPending) {
      // Delete the old pending user to create a new one
      await PendingUser.deleteOne({ email: sanitizedEmail })
    }

    // Generate 6-digit code and expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Hash both password and verification code for security
    const hashedPassword = await hashPassword(password)
    const hashedCode = await bcrypt.hash(code, 10)

    // Store user data and hashed code in PendingUser collection
    const pendingUser = new PendingUser({
      email: sanitizedEmail,
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      phone: sanitizedPhone,
      password: hashedPassword,
      verificationCode: hashedCode,
      verificationCodeExpires: codeExpires
    })
    
    await pendingUser.save()

    // Send verification code email
    const { sendVerificationCodeEmail } = await import('@/lib/email')
    const emailSent = await sendVerificationCodeEmail(sanitizedEmail, code)

    if (!emailSent) {
      // Delete the pending user if email fails
      await PendingUser.deleteOne({ email: sanitizedEmail })
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    // Return response
    return NextResponse.json(
      {
        message: 'Verification code sent. Please check your email to verify your account.'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
