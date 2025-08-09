import { NextRequest, NextResponse } from 'next/server'
import dbConnect, { User } from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
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

    const { productId } = params

    await dbConnect()

    // Remove item from wishlist
    const user = await User.findById(payload.userId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove from wishlist
    user.wishlist = user.wishlist.filter((item: any) => 
      item.product.toString() !== productId
    )

    await user.save()

    return NextResponse.json({
      message: 'Item removed from wishlist successfully'
    })

  } catch (error) {
    console.error('Wishlist remove error:', error)
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}
