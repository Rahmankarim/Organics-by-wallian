import { type NextRequest, NextResponse } from "next/server"
import { User } from "@/lib/mongoose"
import dbConnect from "@/lib/mongoose"
import { rateLimit } from "@/lib/auth"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Rate limiting: 5 login attempts per 15 minutes
const loginRateLimit = rateLimit(5, 15 * 60 * 1000)

export async function POST(request: NextRequest) {
  const rateLimitResponse = loginRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 },
      )
    }

    await dbConnect()

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || !user.password) {
      console.log('[LOGIN] User not found or no password for:', email.toLowerCase())
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    if (!user.isEmailVerified) {
      console.log('[LOGIN] Email not verified for:', email.toLowerCase())
      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email before logging in",
        },
        { status: 401 },
      )
    }

    // Verify password
    console.log('[LOGIN] Verifying password for:', email.toLowerCase())
    console.log('[LOGIN] Password hash length:', user.password.length)
    console.log('[LOGIN] Password hash prefix:', user.password.substring(0, 7))
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('[LOGIN] Password valid:', isValidPassword)
    
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    )

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token: token, // Include token in response for localStorage
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      },
      { status: 200 },
    )

    // Set JWT as httpOnly cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
