import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { User } from '@/lib/mongoose'
import { verifyPassword, generateToken, validateEmail, rateLimit } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(10, 15 * 60 * 1000)(request) // 10 attempts per 15 minutes
    if (rateLimitResult) {
      return rateLimitResult
    }

    const body = await request.json()
    const { email, password, rememberMe } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password!)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if email is verified (only in production)
    if (!user.isEmailVerified && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Please verify your email before logging in' },
        { status: 403 }
      )
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() })

    // Generate JWT token
    const tokenExpiry = rememberMe ? '30d' : '1d'
    const token = generateToken(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      tokenExpiry
    )

    // Prepare user response (without sensitive data)
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      preferences: user.preferences,
      addresses: user.addresses,
      lastLogin: user.lastLogin
    }

    // Create response with secure cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: userResponse,
      token
    })

    // Set HTTP-only cookie for token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
      path: '/' // Ensure cookie is available for all paths
    })

    return response

  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    )
  }
}
