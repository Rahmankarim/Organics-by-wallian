import { NextRequest, NextResponse } from 'next/server'
import dbConnect, { User } from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Fetch user's wishlist
    const user = await User.findById(payload.userId)
      .populate('wishlist.product', 'name price discountPrice images rating reviewCount inStock category')
      .exec()
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const wishlistItems = user.wishlist.map((item: any) => ({
      id: item._id,
      product: {
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        discountPrice: item.product.discountPrice,
        images: item.product.images || ['/placeholder.svg'],
        rating: item.product.rating || 0,
        reviewCount: item.product.reviewCount || 0,
        inStock: item.product.inStock !== false,
        category: item.product.category
      },
      addedAt: item.addedAt
    }))

    return NextResponse.json({
      items: wishlistItems
    })

  } catch (error) {
    console.error('Wishlist fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { productId } = await request.json()

    await dbConnect()

    // Add item to wishlist
    const user = await User.findById(payload.userId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if item already exists in wishlist
    const existingItem = user.wishlist.find((item: any) => 
      item.product.toString() === productId
    )

    if (existingItem) {
      return NextResponse.json(
        { error: 'Item already in wishlist' },
        { status: 400 }
      )
    }

    // Add to wishlist
    user.wishlist.push({
      product: productId,
      addedAt: new Date()
    })

    await user.save()

    return NextResponse.json({
      message: 'Item added to wishlist successfully'
    })

  } catch (error) {
    console.error('Wishlist add error:', error)
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    )
  }
}
