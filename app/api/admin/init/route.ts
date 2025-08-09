import { NextRequest, NextResponse } from 'next/server'
import clientPromise from "@/lib/mongodb"
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("organic_orchard")

    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ 
      email: 'admin@organics.com',
      role: 'admin'
    })

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        email: 'admin@organics.com'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const adminUser = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@organics.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      avatar: '/placeholder-user.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('users').insertOne(adminUser)

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        message: 'Admin user created successfully',
        email: 'admin@organics.com',
        password: 'admin123'
      })
    } else {
      throw new Error('Failed to create admin user')
    }

  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
