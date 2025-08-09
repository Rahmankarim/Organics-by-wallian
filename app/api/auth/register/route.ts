import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/mongoose'
import { hashPassword, validateEmail, validatePassword, generateSecureToken, sanitizeInput } from '@/lib/auth'
import dbConnect from '@/lib/mongoose'
import { rateLimit } from '@/lib/auth'

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
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password requirements not met', details: passwordValidation.errors },
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

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate email verification token
    const emailVerificationToken = generateSecureToken()

    // Create new user
    const newUser = await User.create({
      email: sanitizedEmail,
      password: hashedPassword,
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      phone: sanitizedPhone,
      emailVerificationToken,
      isEmailVerified: false,
      role: 'customer',
      preferences: {
        newsletter: true,
        smsNotifications: false,
        language: 'en',
        currency: 'INR',
        dietaryRestrictions: []
      }
    })

    // TODO: Send verification email
    // await sendVerificationEmail(sanitizedEmail, emailVerificationToken)

    return NextResponse.json(
      {
        message: 'User created successfully. Please check your email to verify your account.',
        user: {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
