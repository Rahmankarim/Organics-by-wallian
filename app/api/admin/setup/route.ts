import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Import MongoDB client only when needed
    const { default: clientPromise } = await import('@/lib/mongodb')
    const client = await clientPromise
    const db = client.db('organic_orchard')

    // Check if admin user already exists
    const existingAdmin = await db.collection('users').findOne({ 
      email: 'rahmankarim2468@gmail.com' 
    })

    const hashedPassword = await bcrypt.hash('Admin12345', 10)

    if (existingAdmin) {
      // Update existing admin user
      await db.collection('users').updateOne(
        { email: 'rahmankarim2468@gmail.com' },
        { 
          $set: { 
            password: hashedPassword,
            role: 'admin',
            name: 'Admin User',
            isActive: true,
            updatedAt: new Date()
          }
        }
      )
      
      return NextResponse.json({
        message: 'Admin user updated successfully',
        email: 'rahmankarim2468@gmail.com',
        action: 'updated'
      })
    } else {
      // Create new admin user
      const adminUser = {
        email: 'rahmankarim2468@gmail.com',
        password: hashedPassword,
        role: 'admin',
        name: 'Admin User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection('users').insertOne(adminUser)
      
      return NextResponse.json({
        message: 'Admin user created successfully',
        email: 'rahmankarim2468@gmail.com',
        action: 'created'
      })
    }

  } catch (error) {
    console.error('Error setting up admin user:', error)
    return NextResponse.json(
      { error: 'Failed to setup admin user' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Admin setup endpoint',
    instructions: 'Send a POST request to create/update the admin user',
    credentials: {
      email: 'rahmankarim2468@gmail.com',
      password: 'Admin12345'
    }
  })
}
