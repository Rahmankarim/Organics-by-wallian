import { NextRequest, NextResponse } from 'next/server'
import { User, PendingUser } from '@/lib/mongoose'
import dbConnect from '@/lib/mongoose'
import { rateLimit } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// Rate limiting: 5 verification attempts per 5 minutes
const verifyRateLimit = rateLimit(5, 5 * 60 * 1000)

export async function POST(request: NextRequest) {
  const rateLimitResponse = verifyRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { email, code } = await request.json()
    if (!email || !code) {
      return NextResponse.json({ success: false, message: 'Email and code are required' }, { status: 400 })
    }

    await dbConnect()
    if (process.env.AUTH_DEBUG) {
      console.log('[AUTH_DEBUG][verify] Start verification for', email, 'ENV:', {
        hasMongo: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV
      })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find the pending user explicitly
    const pendingUser = await PendingUser.findOne({ email: normalizedEmail })
    if (!pendingUser) {
      console.warn('Pending user not found during verification:', normalizedEmail)
      return NextResponse.json({ success: false, message: 'Pending user not found' }, { status: 404 })
    }

    // Check if code has expired
    const now = new Date()
    if (pendingUser.verificationCodeExpires < now) {
      console.info('Verification code expired for:', normalizedEmail)
      await PendingUser.deleteOne({ email: normalizedEmail })
      return NextResponse.json({ success: false, message: 'Verification code expired. Please sign up again.' }, { status: 410 })
    }

    // Verify the code
    const isValidCode = await bcrypt.compare(code, pendingUser.verificationCode)
    if (!isValidCode) {
      console.warn('Invalid code attempt for:', normalizedEmail)
      return NextResponse.json({ success: false, message: 'Invalid verification code' }, { status: 400 })
    }

    // Check if user already exists (safety check)
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      await PendingUser.deleteOne({ email: normalizedEmail })
      return NextResponse.json({ success: false, message: 'User already exists' }, { status: 409 })
    }

    // Create the permanent user
    const newUser = new User({
      email: normalizedEmail,
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      phone: pendingUser.phone,
      password: pendingUser.password, // Already hashed
      role: 'customer',
      isEmailVerified: true,
      addresses: [],
      preferences: {
        newsletter: true,
        smsNotifications: false,
        language: 'en',
        currency: 'INR',
        dietaryRestrictions: []
      },
      twoFactorEnabled: false
    })
    
    await newUser.save()
    
    // Delete the pending user
  await PendingUser.deleteOne({ email: normalizedEmail })

  console.log('User verified & created:', { email: normalizedEmail, id: newUser._id.toString() })
    
    return NextResponse.json({ 
      success: true,
      message: 'Your account has been created successfully. You can now sign in!' 
    }, { status: 201 })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}