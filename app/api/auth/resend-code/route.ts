import { NextRequest, NextResponse } from 'next/server'
import { PendingUser } from '@/lib/mongoose'
import dbConnect from '@/lib/mongoose'
import { rateLimit } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// Rate limiting: 3 resend attempts per 10 minutes
const resendRateLimit = rateLimit(3, 10 * 60 * 1000)

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = resendRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 })
    }
    
    await dbConnect()
    
    const pendingUser = await PendingUser.findOne({ email: email.toLowerCase() })
    if (!pendingUser) {
      return NextResponse.json({ success: false, message: 'No pending signup found. Please sign up again.' }, { status: 400 })
    }
    
    // Check if the pending user entry has expired
    if (pendingUser.verificationCodeExpires < new Date()) {
      await PendingUser.deleteOne({ email: email.toLowerCase() })
      return NextResponse.json({ success: false, message: 'Signup expired. Please sign up again.' }, { status: 400 })
    }
    
    // Generate new code and expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000)
    const hashedCode = await bcrypt.hash(code, 10)
    
    // Update the pending user with new code
    pendingUser.verificationCode = hashedCode
    pendingUser.verificationCodeExpires = codeExpires
    await pendingUser.save()
    
    // Send code
    const { sendVerificationCodeEmail } = await import('@/lib/email')
    await sendVerificationCodeEmail(email.toLowerCase(), code)
    
    return NextResponse.json({ success: true, message: 'Verification code resent.' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
