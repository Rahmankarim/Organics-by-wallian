import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { CartItem, Product } from '@/lib/mongoose'
import { getUserFromRequest } from '@/lib/auth'

// POST - Sync local cart with server cart after login
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid items format' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Process each item from local cart
    for (const localItem of items) {
      const { productId, quantity, variantId, price } = localItem

      if (!productId || !quantity || quantity <= 0) continue

      // Verify product exists
      const product = await Product.findOne({ id: productId }) as any
      if (!product) continue

      // Check if item already exists in server cart
      const existingCartItem = await CartItem.findOne({
        userId: user._id,
        productId,
        variantId: variantId || null
      })

      if (existingCartItem) {
        // Update quantity (take the maximum of local and server quantities)
        const maxQuantity = Math.max(existingCartItem.quantity, quantity)
        
        // Check stock limits
        let maxStock = product.stockCount
        if (variantId && product.variants) {
          const variant = product.variants.find((v: any) => v.id === variantId)
          if (variant) {
            maxStock = variant.stockCount
          }
        }

        existingCartItem.quantity = Math.min(maxQuantity, maxStock)
        existingCartItem.price = price
        await existingCartItem.save()
      } else {
        // Create new cart item
        await CartItem.create({
          userId: user._id,
          productId,
          variantId: variantId || null,
          quantity,
          price,
          addedAt: new Date()
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cart synced successfully'
    })

  } catch (error) {
    console.error('Cart sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync cart' },
      { status: 500 }
    )
  }
}
