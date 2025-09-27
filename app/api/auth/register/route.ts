import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/mongoose'
import { hashPassword, validateEmail, validatePassword, generateSecureToken, sanitizeInput } from '@/lib/auth'
import dbConnect from '@/lib/mongoose'
import { rateLimit } from '@/lib/auth'
import { verificationCodes } from '@/lib/verification-store'

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

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Generate 6-digit code and expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = Date.now() + 10 * 60 * 1000 // 10 minutes from now

    // Store user data and code in memory (don't create user yet)
    verificationCodes[sanitizedEmail] = {
      code,
      expires,
      userData: {
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        email: sanitizedEmail,
        password,
        phone: sanitizedPhone
      }
    }

    // Send verification code email
    const { sendVerificationCodeEmail } = await import('@/lib/email')
    await sendVerificationCodeEmail(sanitizedEmail, code)

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
