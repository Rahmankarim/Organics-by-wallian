import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/mongoose'
import { hashPassword } from '@/lib/auth'
import dbConnect from '@/lib/mongoose'
import { verificationCodes } from '@/lib/verification-store'
import { rateLimit } from '@/lib/auth'

// Rate limiting: 5 verification attempts per 5 minutes
const verifyRateLimit = rateLimit(5, 5 * 60 * 1000)

export async function POST(request: NextRequest) {
  const rateLimitResponse = verifyRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { email, code } = await request.json()
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    const entry = verificationCodes[email.toLowerCase()]
    if (!entry) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    if (entry.expires < Date.now()) {
      delete verificationCodes[email.toLowerCase()]
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 })
    }

    if (entry.code !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
    }

    // Code is valid, create the user in database
    await dbConnect()
    
    // Check if user already exists (safety check)
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      delete verificationCodes[email.toLowerCase()]
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // Hash the password before saving
    const hashedPassword = await hashPassword(entry.userData.password)

    // Create user
    const newUser = new User({
      firstName: entry.userData.firstName,
      lastName: entry.userData.lastName,
      email: entry.userData.email,
      password: hashedPassword,
      phone: entry.userData.phone,
      isEmailVerified: true
    })
    
    await newUser.save()
    
    // Remove from verification store
    delete verificationCodes[email.toLowerCase()]
    
    return NextResponse.json({ message: 'Account verified and created successfully!' }, { status: 201 })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}