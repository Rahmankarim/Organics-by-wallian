import { NextRequest, NextResponse } from 'next/server'
import dbConnect, { Order } from '@/lib/mongoose'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

    // Fetch user orders with product details
    const orders = await Order.find({ 
      userId: payload.userId 
    })
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .exec()

    return NextResponse.json({
  orders: orders.map((order: any) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        discount: order.discount,
        items: order.items.map((item: any) => ({
          id: item._id,
          product: {
            id: item.product._id,
            name: item.product.name,
            image: item.product.images?.[0] || '/placeholder.jpg',
            price: item.product.price
          },
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        paymentMethod: order.paymentMethod,
        paymentId: order.paymentId,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        deliveryDate: order.deliveryDate,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }))
    })

  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
