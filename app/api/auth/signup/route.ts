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

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate email verification token
    const emailVerificationToken = Math.random().toString(36).substring(2, 15) + 
                                   Math.random().toString(36).substring(2, 15)

    // In development, auto-verify emails. In production, require email verification
    const isEmailVerified = process.env.NODE_ENV === 'development' ? true : false

    // Create user
    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim(),
      role: 'customer',
      isEmailVerified,
      emailVerificationToken: isEmailVerified ? null : emailVerificationToken,
      preferences: {
        newsletter: true,
        smsNotifications: false,
        language: 'en',
        currency: 'INR',
        dietaryRestrictions: []
      },
      addresses: [],
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Remove sensitive data from response
    const userResponse = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      isEmailVerified: newUser.isEmailVerified
    }

    // Send verification email only in production
    if (process.env.NODE_ENV === 'production' && !isEmailVerified) {
      // TODO: Send verification email here
      // await sendVerificationEmail(newUser.email, emailVerificationToken)
      return NextResponse.json({
        message: 'Account created successfully. Please check your email for verification.',
        user: userResponse
      }, { status: 201 })
    } else {
      return NextResponse.json({
        message: 'Account created successfully and automatically verified in development mode.',
        user: userResponse
      }, { status: 201 })
    }

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
