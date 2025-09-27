import { NextResponse } from 'next/server'
import dbConnect, { PendingUser } from '@/lib/mongoose'

// TEMPORARY DEBUG ENDPOINT - REMOVE AFTER TROUBLESHOOTING
// Protect by requiring AUTH_DEBUG to be set
export async function GET() {
  if (!process.env.AUTH_DEBUG) {
    return NextResponse.json({ success: false, message: 'Not enabled' }, { status: 403 })
  }
  try {
    await dbConnect()
    const count = await PendingUser.countDocuments({})
    const one = await PendingUser.findOne({}, { email: 1, verificationCodeExpires: 1, createdAt: 1 }).lean()
    return NextResponse.json({ success: true, count, sample: one })
  } catch (e:any) {
    return NextResponse.json({ success: false, message: 'Error', error: e.message })
  }
}
