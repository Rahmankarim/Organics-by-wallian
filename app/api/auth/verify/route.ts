import { type NextRequest, NextResponse } from "next/server"
import { User, PendingUser } from "@/lib/mongoose"
import dbConnect from "@/lib/mongoose"
import { rateLimit } from "@/lib/auth"
import bcrypt from "bcryptjs"

// Rate limiting: 5 verification attempts per 5 minutes
const verifyRateLimit = rateLimit(5, 5 * 60 * 1000)

export async function POST(request: NextRequest) {
  const rateLimitResponse = verifyRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { email, code } = await request.json()
    if (!email || !code) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and code are required",
        },
        { status: 400 },
      )
    }

    await dbConnect()

    // Find the pending user
    const pendingUser = await PendingUser.findOne({ email: email.toLowerCase() })
    if (!pendingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired code",
        },
        { status: 400 },
      )
    }

    // Check if code has expired
    if (pendingUser.verificationCodeExpires < new Date()) {
      await PendingUser.deleteOne({ email: email.toLowerCase() })
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired code",
        },
        { status: 400 },
      )
    }

    // Verify the code
    const isValidCode = await bcrypt.compare(code, pendingUser.verificationCode)
    if (!isValidCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired code",
        },
        { status: 400 },
      )
    }

    // Check if user already exists (safety check)
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      await PendingUser.deleteOne({ email: email.toLowerCase() })
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 409 },
      )
    }

    const newUser = new User({
      email: pendingUser.email,
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      phone: pendingUser.phone,
      password: pendingUser.password, // Already hashed
      role: "customer",
      isEmailVerified: true,
      addresses: [],
      preferences: {
        newsletter: true,
        smsNotifications: false,
        language: "en",
        currency: "PKR",
        dietaryRestrictions: [],
      },
      twoFactorEnabled: false,
    })

    console.log('[VERIFY] Creating user:', pendingUser.email)
    console.log('[VERIFY] Password hash length:', pendingUser.password.length)
    console.log('[VERIFY] Password hash prefix:', pendingUser.password.substring(0, 7))

    await newUser.save()

    // Delete the pending user
    await PendingUser.deleteOne({ email: email.toLowerCase() })

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. You can now log in.",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
