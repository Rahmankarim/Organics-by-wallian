import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Order, Analytics } from '@/lib/mongoose'
import { getUserFromRequest, isAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await dbConnect()

    const orderId = params.id

    console.log('[ORDER DETAIL] Fetching order:', { orderId, userId: user._id })

    // Try to find by MongoDB _id first, then by orderNumber
    let order = null
    
    // Check if it's a valid MongoDB ObjectId
    if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
      // Build query - users can only see their own orders, admins can see all
      const query: any = { _id: orderId }
      if (!isAdmin(user)) {
        query.userId = user._id
      }
      order = await Order.findOne(query).lean()
    }
    
    // If not found, try by orderNumber
    if (!order) {
      const query: any = { orderNumber: orderId }
      if (!isAdmin(user)) {
        query.userId = user._id
      }
      order = await Order.findOne(query).lean()
    }

    if (!order) {
      console.log('[ORDER DETAIL] Order not found')
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    console.log('[ORDER DETAIL] Order found:', { 
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status 
    })

    return NextResponse.json({ order })

  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await dbConnect()

    const orderId = params.id
    const body = await request.json()

    // Try to find by MongoDB _id first, then by orderNumber
    let order = null
    
    if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
      const query: any = { _id: orderId }
      if (!isAdmin(user)) {
        query.userId = user._id
      }
      order = await Order.findOne(query)
    }
    
    if (!order) {
      const query: any = { orderNumber: orderId }
      if (!isAdmin(user)) {
        query.userId = user._id
      }
      order = await Order.findOne(query)
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Admin can update status, payment status, shipping info
    if (isAdmin(user)) {
      const { status, paymentStatus, trackingNumber, estimatedDelivery } = body

      const updateData: any = {}
      
      if (status) {
        updateData.status = status
        updateData.statusHistory = [
          ...order.statusHistory,
          {
            status,
            timestamp: new Date(),
            updatedBy: user._id
          }
        ]
      }

      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus
      }

      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber
      }

      if (estimatedDelivery) {
        updateData.estimatedDelivery = new Date(estimatedDelivery)
      }

      // Special handling for delivery completion
      if (status === 'delivered') {
        updateData.deliveredAt = new Date()
      }

      await Order.findOneAndUpdate({ orderId }, updateData)

      // Track analytics for order status updates
      await Analytics.create({
        type: 'order_status_update',
        userId: user._id,
        sessionId: request.headers.get('x-session-id') || 'admin',
        data: {
          orderId,
          newStatus: status,
          previousStatus: order.status,
          updatedBy: user._id
        }
      })

      return NextResponse.json({
        message: 'Order updated successfully',
        orderId
      })

    } else {
      // Regular users can only cancel pending orders
      const { action } = body

      if (action === 'cancel') {
        if (order.status !== 'pending') {
          return NextResponse.json(
            { error: 'Only pending orders can be cancelled' },
            { status: 400 }
          )
        }

        await Order.findOneAndUpdate(
          { orderId },
          {
            status: 'cancelled',
            cancelledAt: new Date(),
            statusHistory: [
              ...order.statusHistory,
              {
                status: 'cancelled',
                timestamp: new Date(),
                updatedBy: user._id
              }
            ]
          }
        )

        // Track analytics
        await Analytics.create({
          type: 'order_cancelled',
          userId: user._id,
          sessionId: request.headers.get('x-session-id') || 'anonymous',
          data: {
            orderId,
            cancelledBy: 'customer',
            orderValue: order.totalAmount
          }
        })

        return NextResponse.json({
          message: 'Order cancelled successfully',
          orderId
        })
      }

      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await dbConnect()

    const orderId = params.id

    const order = await Order.findOne({ orderId })
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of cancelled orders
    if (order.status !== 'cancelled') {
      return NextResponse.json(
        { error: 'Only cancelled orders can be deleted' },
        { status: 400 }
      )
    }

    await Order.findOneAndDelete({ orderId })

    // Track analytics
    await Analytics.create({
      type: 'order_deleted',
      userId: user._id,
      sessionId: request.headers.get('x-session-id') || 'admin',
      data: {
        orderId,
        deletedBy: user._id,
        originalStatus: order.status
      }
    })

    return NextResponse.json({
      message: 'Order deleted successfully',
      orderId
    })

  } catch (error) {
    console.error('Order deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
