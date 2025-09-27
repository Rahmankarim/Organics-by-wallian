import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/mongoose'
import dbConnect from '@/lib/mongoose'
import { rateLimit } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Rate limiting: 5 login attempts per 15 minutes
const loginRateLimit = rateLimit(5, 15 * 60 * 1000)

export async function POST(request: NextRequest) {
  const rateLimitResponse = loginRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    await dbConnect()

    // Find user in the permanent User collection only
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return NextResponse.json({ 
        error: 'Please verify your email before logging in' 
      }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // Create response with token as httpOnly cookie
    const response = NextResponse.json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    }, { status: 200 })

    // Set JWT as httpOnly cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}