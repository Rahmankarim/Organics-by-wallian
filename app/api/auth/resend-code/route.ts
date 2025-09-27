import { NextRequest, NextResponse } from 'next/server'
import { verificationCodes } from '@/lib/verification-store'
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
    
    const entry = verificationCodes[email.toLowerCase()]
    if (!entry || entry.expires < Date.now()) {
      return NextResponse.json({ error: 'No active verification code. Please sign up again.' }, { status: 400 })
    }
    
    // Generate new code and expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = Date.now() + 10 * 60 * 1000
    entry.code = code
    entry.expires = expires
    
    // Send code
    const { sendVerificationCodeEmail } = await import('@/lib/email')
    await sendVerificationCodeEmail(email.toLowerCase(), code)
    
    return NextResponse.json({ message: 'Verification code resent.' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
