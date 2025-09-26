import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { User } from '@/lib/mongoose'
import { rateLimit } from '@/lib/auth'

// Rate limiting: 3 resend attempts per 10 minutes
const resendRateLimit = rateLimit(3, 10 * 60 * 1000)

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = resendRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({ email: email.toLowerCase() })

    // Always respond with success to prevent account enumeration
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a new code has been sent.' }, { status: 200 })
    }

    // If already verified, no need to resend
    if (user.isEmailVerified) {
      return NextResponse.json({ message: 'Email already verified.' }, { status: 200 })
    }

    // Generate new 6-digit code and expiry (10 minutes)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000)

    user.emailVerificationCode = code
    user.emailVerificationCodeExpires = codeExpires
    await user.save()

    const { sendVerificationCodeEmail } = await import('@/lib/email')
    await sendVerificationCodeEmail(user.email, code)

    return NextResponse.json({ message: 'Verification code sent.' }, { status: 200 })
  } catch (error) {
    console.error('Resend code error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
