import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

async function createAdminUser() {
  try {
    const client = await clientPromise
    const db = client.db('organic_orchard')

    // Check if admin user already exists
    const existingAdmin = await db.collection('users').findOne({ 
      email: 'rahmankarim2468@gmail.com' 
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      
      // Update password to ensure it matches
      const hashedPassword = await bcrypt.hash('Admin12345', 10)
      await db.collection('users').updateOne(
        { email: 'rahmankarim2468@gmail.com' },
        { 
          $set: { 
            password: hashedPassword,
            role: 'admin',
            updatedAt: new Date()
          }
        }
      )
      console.log('✅ Admin user updated with correct credentials')
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('Admin12345', 10)
      
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
      console.log('✅ Admin user created successfully')
    }

    console.log('Admin credentials setup complete:')
    console.log('Email: rahmankarim2468@gmail.com')
    console.log('Password: Admin12345')
    
  } catch (error) {
    console.error('Error setting up admin user:', error)
  }
}

export default createAdminUser
