import { connectToDatabase } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function createAdminUser() {
  try {
    const { db } = await connectToDatabase()

    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ 
      email: 'rahmankarim2468@gmail.com' 
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return { success: true, message: 'Admin user already exists' }
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

    console.log('Admin user created successfully:', result.insertedId)
    return { 
      success: true, 
      message: 'Admin user created successfully',
      userId: result.insertedId 
    }

  } catch (error) {
    console.error('Error creating admin user:', error)
    return { 
      success: false, 
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
