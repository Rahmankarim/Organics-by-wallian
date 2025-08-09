import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('organic_orchard')

    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ 
      email: 'rahmankarim2468@gmail.com' 
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists'
      })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin12345', 12)

    // Create admin user
    const adminUser = {
      name: 'Rahman Karim',
      email: 'rahmankarim2468@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('users').insertOne(adminUser)

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      userId: result.insertedId
    })

  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
