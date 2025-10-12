import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Order, Product, CartItem, Analytics, User } from '@/lib/mongoose'
import { getUserFromRequest, isAdmin } from '@/lib/auth'

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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    // Build query
    let query: any = {}
    
    if (!isAdmin(user)) {
      query.userId = user._id
    } else {
      // Admin can see all orders or filter by status
      if (status) {
        query.status = status
      }
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalOrders = await Order.countDocuments(query)

    // Get order statistics for current user or all orders (if admin)
    const orderStats = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' }
        }
      }
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limit)
      },
      statistics: orderStats
    })

  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
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
    const { 
      shippingAddress, 
      paymentMethod, 
      couponCode,
      orderItems,
      specialInstructions 
    } = body

    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: 'Shipping address and payment method are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    let items = orderItems
    let subtotal = 0

    // If no orderItems provided, get from cart
    if (!orderItems || orderItems.length === 0) {
      const cartItems = await CartItem.find({ userId: user._id }).lean()
      
      if (cartItems.length === 0) {
        return NextResponse.json(
          { error: 'No items in cart to place order' },
          { status: 400 }
        )
      }

      // Convert cart items to order items and validate stock
      items = await Promise.all(
        cartItems.map(async (cartItem: any) => {
          const product = await Product.findOne({ id: cartItem.productId })
          
          if (!product) {
            throw new Error(`Product ${cartItem.productId} not found`)
          }

          if (!product.inStock) {
            throw new Error(`Product ${product.name} is out of stock`)
          }

          // Check variant stock if applicable
          let selectedVariant = null
          let price = product.price
          
          if (cartItem.variantId) {
            selectedVariant = product.variants.find((v: any) => v.id === cartItem.variantId)
            if (!selectedVariant) {
              throw new Error(`Variant not found for product ${product.name}`)
            }
            price = selectedVariant.price
          }

          const availableStock = selectedVariant ? selectedVariant.stockCount : product.stockCount
          
          if (cartItem.quantity > availableStock) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${availableStock}`)
          }

          subtotal += price * cartItem.quantity

          return {
            productId: cartItem.productId,
            variantId: cartItem.variantId,
            name: product.name,
            price,
            quantity: cartItem.quantity,
            image: product.images[0]
          }
        })
      )
    } else {
      // Validate provided order items
      for (const item of orderItems) {
        const product = await Product.findOne({ id: item.productId })
        if (!product) {
          return NextResponse.json(
            { error: `Product ${item.productId} not found` },
            { status: 404 }
          )
        }
        subtotal += item.price * item.quantity
      }
      items = orderItems
    }

    // Apply coupon if provided
    let discount = 0
    let discountAmount = 0
    
    if (couponCode) {
      // Coupon validation logic would go here
      // For now, simulate a 10% discount
      discount = 0.10
      discountAmount = subtotal * discount
    }

    // Calculate taxes and total
    const taxRate = 0.18 // 18% GST
    const taxAmount = (subtotal - discountAmount) * taxRate
    const shippingFee = subtotal > 1000 ? 0 : 100 // Free shipping over Rs. 1000
    const totalAmount = subtotal - discountAmount + taxAmount + shippingFee

    // Generate order number
    const orderCount = await Order.countDocuments()
    const orderNumber = `ORD${Date.now()}${(orderCount + 1).toString().padStart(4, '0')}`

    // Transform shipping address to match Address interface
    const fullNameParts = shippingAddress.fullName.trim().split(' ')
    const firstName = fullNameParts[0] || ''
    const lastName = fullNameParts.length > 1 ? fullNameParts.slice(1).join(' ') : ''
    
    const addressData = {
      type: 'home' as const,
      firstName,
      lastName,
      address: shippingAddress.addressLine1,
      apartment: shippingAddress.addressLine2 || '',
      city: shippingAddress.city,
      state: shippingAddress.state,
      zipCode: shippingAddress.pincode,
      country: 'Pakistan',
      phone: shippingAddress.phoneNumber,
      isDefault: false
    }

    // Create order
    const order = await Order.create({
      orderNumber,
      userId: user._id,
      items,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      shippingCost: shippingFee,
      total: totalAmount,
      shippingAddress: addressData,
      paymentMethod,
      notes: specialInstructions,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Update product stock
    for (const item of items) {
      const product = await Product.findOne({ id: item.productId })
      if (product) {
        if (item.variantId) {
          // Update variant stock
          const variantIndex = product.variants.findIndex((v: any) => v.id === item.variantId)
          if (variantIndex !== -1) {
            product.variants[variantIndex].stockCount -= item.quantity
            // Update only the specific variant using $set
            await Product.updateOne(
              { id: item.productId },
              { $set: { [`variants.${variantIndex}.stockCount`]: product.variants[variantIndex].stockCount } }
            )
          }
        } else {
          // Update main product stock directly
          const newStockCount = product.stockCount - item.quantity
          const updateFields: any = { stockCount: newStockCount }
          
          // Mark as out of stock if needed
          if (newStockCount <= 0) {
            updateFields.inStock = false
          }
          
          await Product.updateOne({ id: item.productId }, { $set: updateFields })
        }
        
        // Check if product should be marked out of stock for variant products
        if (item.variantId) {
          const totalStock = product.variants.reduce((total: number, v: any) => total + v.stockCount, 0)
          if (totalStock <= 0) {
            await Product.updateOne({ id: item.productId }, { $set: { inStock: false } })
          }
        }
      }
    }

    // Clear cart after successful order
    await CartItem.deleteMany({ userId: user._id })

    // Track analytics
    await Analytics.create({
      type: 'purchase',
      userId: user._id,
      sessionId: request.headers.get('x-session-id') || 'anonymous',
      data: {
        orderId: orderNumber,
        totalAmount,
        itemCount: items.length,
        paymentMethod
      }
    })

    return NextResponse.json({
      message: 'Order placed successfully',
      orderId: orderNumber,
      order: {
        orderId: orderNumber,
        totalAmount,
        status: 'pending',
        items: items.length
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}
