import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Only allow specific admin email
    if (email !== 'rahmankarim2468@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    // Check hardcoded password first for immediate access
    if (password === 'Admin12345') {
      // Generate JWT token for hardcoded admin
      const token = jwt.sign(
        { 
          userId: 'admin-hardcoded',
          email: email,
          role: 'admin'
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      )

      return NextResponse.json({
        message: 'Admin login successful (hardcoded)',
        user: {
          _id: 'admin-hardcoded',
          email: email,
          role: 'admin',
          name: 'Admin User'
        },
        token
      })
    }

    const client = await clientPromise
    const db = client.db('organic_orchard')

    // Check if admin user exists in database
    const admin = await db.collection('users').findOne({ 
      email,
      role: 'admin'
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      )
    }

    // Verify password against database
    const isPasswordValid = await bcrypt.compare(password, admin.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: admin._id,
        email: admin.email,
        role: admin.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    // Return admin user data (excluding password)
    const { password: _, ...adminData } = admin

    return NextResponse.json({
      message: 'Admin login successful',
      user: adminData,
      token
    })

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
