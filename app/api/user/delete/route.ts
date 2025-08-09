import { NextRequest, NextResponse } from 'next/server'
import dbConnect, { User, Order, Cart } from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'

export async function DELETE(request: NextRequest) {
  try {
    // Get token from header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    await dbConnect()

    // Find user
    const user = await User.findById(payload.userId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin deletion
    if (user.role === 'admin' || user.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Admin accounts cannot be deleted' },
        { status: 403 }
      )
    }

    // Delete user's associated data
    await Promise.all([
      // Delete user's cart
      Cart.deleteMany({ userId: payload.userId }),
      
      // Mark orders as anonymized instead of deleting (for business records)
      Order.updateMany(
        { userId: payload.userId },
        { 
          $unset: { 
            userId: 1,
            shippingAddress: 1,
            billingAddress: 1
          },
          $set: {
            anonymized: true,
            anonymizedAt: new Date()
          }
        }
      ),
      
      // Delete the user account
      User.findByIdAndDelete(payload.userId)
    ])

    return NextResponse.json({
      message: 'Account deleted successfully'
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
