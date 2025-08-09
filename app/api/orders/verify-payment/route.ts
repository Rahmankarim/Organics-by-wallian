import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import crypto from 'crypto'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Import MongoDB client only when needed
    const { default: clientPromise } = await import('@/lib/mongodb')
    
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      orderId, 
      razorpayPaymentId, 
      razorpayOrderId, 
      razorpaySignature 
    } = await request.json()

    if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('luxury-dry-fruits')

    // Find the order
    const order = await db.collection('orders').findOne({ 
      _id: new ObjectId(orderId),
      userId: user._id || user.id 
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify Razorpay signature
    const body = razorpayOrderId + "|" + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      // Payment signature verification failed
      await db.collection('orders').updateOne(
        { _id: new ObjectId(orderId) },
        { 
          $set: { 
            paymentStatus: 'failed',
            paymentDetails: {
              razorpayPaymentId,
              razorpayOrderId,
              failureReason: 'Signature verification failed'
            },
            updatedAt: new Date()
          }
        }
      )

      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // Payment verified successfully
    await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentDetails: {
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
            paidAt: new Date()
          },
          updatedAt: new Date()
        }
      }
    )

    // Update product stock and clear cart
    await updateProductStock(db, order.items, 'decrease')
    await db.collection('carts').deleteOne({ userId: user._id || user.id })

    // Track analytics
    await db.collection('analytics').insertOne({
      type: 'payment_success',
      userId: user._id || user.id,
      orderId: orderId,
      orderNumber: order.orderNumber,
      amount: order.summary.total,
      paymentMethod: 'razorpay',
      paymentId: razorpayPaymentId,
      timestamp: new Date()
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Payment verified successfully' 
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to update product stock
async function updateProductStock(db: any, items: any[], operation: 'increase' | 'decrease') {
  for (const item of items) {
    const stockChange = operation === 'decrease' ? -item.quantity : item.quantity
    
    if (item.variantId) {
      // Update variant stock
      await db.collection('products').updateOne(
        { 
          id: item.productId,
          'variants.id': item.variantId
        },
        { 
          $inc: { 'variants.$.stockCount': stockChange }
        }
      )
    } else {
      // Update main product stock
      await db.collection('products').updateOne(
        { id: item.productId },
        { 
          $inc: { stockCount: stockChange }
        }
      )
    }
  }
}
