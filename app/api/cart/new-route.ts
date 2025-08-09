import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { CartItem, Product, Analytics } from '@/lib/mongoose'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await dbConnect()

    // Get cart items for user
    const cartItems = await CartItem.find({ userId: user._id }).lean()

    // Get product details for each cart item
    const cartWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findOne({ id: item.productId }).lean()
        return {
          ...item,
          product
        }
      })
    )

    // Calculate totals
    const subtotal = cartWithProducts.reduce((total, item: any) => {
      return total + (item.price * item.quantity)
    }, 0)

    const totalItems = cartWithProducts.reduce((total, item: any) => {
      return total + item.quantity
    }, 0)

    return NextResponse.json({
      items: cartWithProducts,
      summary: {
        subtotal,
        totalItems,
        tax: subtotal * 0.18, // 18% GST
        total: subtotal + (subtotal * 0.18)
      }
    })

  } catch (error) {
    console.error('Cart fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

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
    const { productId, variantId, quantity = 1 } = body

    if (!productId || quantity <= 0) {
      return NextResponse.json(
        { error: 'Valid product ID and quantity required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Check if product exists and is in stock
    const product = await Product.findOne({ id: productId })
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (!product.inStock) {
      return NextResponse.json(
        { error: 'Product is out of stock' },
        { status: 400 }
      )
    }

    // Check variant if specified
    let selectedVariant = null
    let price = product.price
    
    if (variantId) {
      selectedVariant = product.variants.find((v: any) => v.id === variantId)
      if (!selectedVariant) {
        return NextResponse.json(
          { error: 'Product variant not found' },
          { status: 404 }
        )
      }
      price = selectedVariant.price
    }

    // Check stock availability
    const availableStock = selectedVariant ? selectedVariant.stockCount : product.stockCount
    if (quantity > availableStock) {
      return NextResponse.json(
        { error: `Only ${availableStock} items available in stock` },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    const existingCartItem = await CartItem.findOne({
      userId: user._id,
      productId,
      variantId: variantId || { $exists: false }
    })

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity
      
      if (newQuantity > availableStock) {
        return NextResponse.json(
          { error: `Cannot add more items. Only ${availableStock} available in stock` },
          { status: 400 }
        )
      }

      await CartItem.findByIdAndUpdate(existingCartItem._id, {
        quantity: newQuantity
      })
    } else {
      // Create new cart item
      await CartItem.create({
        userId: user._id,
        productId,
        variantId,
        quantity,
        price
      })
    }

    // Track analytics
    await Analytics.create({
      type: 'add_to_cart',
      userId: user._id,
      sessionId: request.headers.get('x-session-id') || 'anonymous',
      data: {
        productId,
        variantId,
        quantity,
        price
      }
    })

    return NextResponse.json(
      { message: 'Item added to cart successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, variantId, quantity } = body

    if (!productId || quantity < 0) {
      return NextResponse.json(
        { error: 'Valid product ID and quantity required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find cart item
    const cartItem = await CartItem.findOne({
      userId: user._id,
      productId,
      variantId: variantId || { $exists: false }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    if (quantity === 0) {
      // Remove item from cart
      await CartItem.findByIdAndDelete(cartItem._id)
      return NextResponse.json(
        { message: 'Item removed from cart' },
        { status: 200 }
      )
    }

    // Check stock availability
    const product = await Product.findOne({ id: productId })
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const selectedVariant = variantId 
      ? product.variants.find((v: any) => v.id === variantId)
      : null

    const availableStock = selectedVariant ? selectedVariant.stockCount : product.stockCount
    
    if (quantity > availableStock) {
      return NextResponse.json(
        { error: `Only ${availableStock} items available in stock` },
        { status: 400 }
      )
    }

    // Update quantity
    await CartItem.findByIdAndUpdate(cartItem._id, { quantity })

    return NextResponse.json(
      { message: 'Cart updated successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Cart update error:', error)
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await dbConnect()

    // Clear entire cart
    await CartItem.deleteMany({ userId: user._id })

    return NextResponse.json(
      { message: 'Cart cleared successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Cart clear error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
