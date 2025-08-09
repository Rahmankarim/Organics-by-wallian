import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Order, Product, CartItem } from '@/lib/mongoose'
import { getUserFromRequest } from '@/lib/auth'

// Route segment config to prevent static analysis during build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 503 }
      )
    }

    // Import Stripe only when needed at runtime
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-07-30.basil'
    })

    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId, amount, currency = 'inr' } = body

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Order ID and amount are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find the order
    const order = await Order.findOne({ 
      orderId, 
      userId: user._id,
      status: 'pending'
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or already processed' },
        { status: 404 }
      )
    }

    // Verify amount matches order total
    if (Math.round(amount * 100) !== Math.round(order.totalAmount * 100)) {
      return NextResponse.json(
        { error: 'Payment amount does not match order total' },
        { status: 400 }
      )
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paisa for INR
      currency: currency.toLowerCase(),
      metadata: {
        orderId: order.orderId,
        userId: user._id.toString(),
        userEmail: user.email
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Payment for order ${orderId}`,
      receipt_email: user.email
    })

    // Update order with payment intent ID
    await Order.findOneAndUpdate(
      { orderId },
      { 
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'processing'
      }
    )

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })

  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
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
    const { paymentIntentId, status } = body

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      )
    }

    // Find associated order
    const order = await Order.findOne({ 
      paymentIntentId,
      userId: user._id
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order based on payment status
    let orderUpdate: any = {}
    
    switch (paymentIntent.status) {
      case 'succeeded':
        orderUpdate = {
          paymentStatus: 'completed',
          status: 'processing',
          paidAt: new Date(),
          statusHistory: [
            ...order.statusHistory,
            {
              status: 'processing',
              timestamp: new Date(),
              note: 'Payment completed successfully'
            }
          ]
        }
        break
      
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        orderUpdate = {
          paymentStatus: 'pending'
        }
        break
      
      case 'canceled':
        orderUpdate = {
          paymentStatus: 'failed',
          status: 'cancelled',
          statusHistory: [
            ...order.statusHistory,
            {
              status: 'cancelled',
              timestamp: new Date(),
              note: 'Payment cancelled'
            }
          ]
        }
        break
      
      default:
        orderUpdate = {
          paymentStatus: 'failed'
        }
    }

    await Order.findOneAndUpdate({ paymentIntentId }, orderUpdate)

    return NextResponse.json({
      message: 'Payment status updated',
      paymentStatus: paymentIntent.status,
      orderStatus: orderUpdate.status || order.status
    })

  } catch (error) {
    console.error('Payment status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    )
  }
}
