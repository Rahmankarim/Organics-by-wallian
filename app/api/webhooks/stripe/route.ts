import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { Order, Analytics } from '@/lib/mongoose'
import { headers } from 'next/headers'

// Route segment config to prevent static analysis during build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe webhook not configured' },
        { status: 503 }
      )
    }

    // Import Stripe only when needed at runtime
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-07-30.basil'
    })
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

    const body = await request.text()
    const signature = headers().get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    await dbConnect()

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object as Stripe.Dispute)
        break

      case 'invoice.payment_succeeded':
        // Handle subscription payments if you add subscriptions later
        console.log('Invoice payment succeeded:', event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId
    
    if (!orderId) {
      console.error('No order ID in payment intent metadata')
      return
    }

    const order = await Order.findOne({ orderId })
    
    if (!order) {
      console.error(`Order ${orderId} not found`)
      return
    }

    // Update order status
    await Order.findOneAndUpdate(
      { orderId },
      {
        paymentStatus: 'completed',
        status: 'processing',
        paidAt: new Date(),
        paymentDetails: {
          stripePaymentIntentId: paymentIntent.id,
          stripeChargeId: paymentIntent.latest_charge,
          paymentMethod: paymentIntent.payment_method,
          amount: paymentIntent.amount / 100, // Convert from paisa to rupees
          currency: paymentIntent.currency
        },
        statusHistory: [
          ...order.statusHistory,
          {
            status: 'processing',
            timestamp: new Date(),
            note: 'Payment completed successfully via Stripe'
          }
        ]
      }
    )

    // Track analytics
    await Analytics.create({
      type: 'payment_completed',
      userId: order.userId,
      sessionId: 'stripe_webhook',
      data: {
        orderId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method
      }
    })

    console.log(`Payment successful for order ${orderId}`)

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId
    
    if (!orderId) {
      console.error('No order ID in payment intent metadata')
      return
    }

    const order = await Order.findOne({ orderId })
    
    if (!order) {
      console.error(`Order ${orderId} not found`)
      return
    }

    // Update order status
    await Order.findOneAndUpdate(
      { orderId },
      {
        paymentStatus: 'failed',
        statusHistory: [
          ...order.statusHistory,
          {
            status: 'payment_failed',
            timestamp: new Date(),
            note: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`
          }
        ]
      }
    )

    // Track analytics
    await Analytics.create({
      type: 'payment_failed',
      userId: order.userId,
      sessionId: 'stripe_webhook',
      data: {
        orderId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        errorMessage: paymentIntent.last_payment_error?.message
      }
    })

    console.log(`Payment failed for order ${orderId}`)

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId
    
    if (!orderId) {
      console.error('No order ID in payment intent metadata')
      return
    }

    const order = await Order.findOne({ orderId })
    
    if (!order) {
      console.error(`Order ${orderId} not found`)
      return
    }

    // Update order status
    await Order.findOneAndUpdate(
      { orderId },
      {
        paymentStatus: 'cancelled',
        status: 'cancelled',
        statusHistory: [
          ...order.statusHistory,
          {
            status: 'cancelled',
            timestamp: new Date(),
            note: 'Payment cancelled by customer'
          }
        ]
      }
    )

    // Track analytics
    await Analytics.create({
      type: 'payment_cancelled',
      userId: order.userId,
      sessionId: 'stripe_webhook',
      data: {
        orderId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      }
    })

    console.log(`Payment cancelled for order ${orderId}`)

  } catch (error) {
    console.error('Error handling payment cancellation:', error)
  }
}

async function handleChargeDispute(dispute: Stripe.Dispute) {
  try {
    const chargeId = dispute.charge
    
    // Find order by charge ID
    const order = await Order.findOne({ 
      'paymentDetails.stripeChargeId': chargeId 
    })
    
    if (!order) {
      console.error(`Order with charge ${chargeId} not found`)
      return
    }

    // Update order with dispute information
    await Order.findOneAndUpdate(
      { orderId: order.orderId },
      {
        disputeStatus: 'disputed',
        disputeDetails: {
          disputeId: dispute.id,
          amount: dispute.amount / 100,
          reason: dispute.reason,
          status: dispute.status,
          created: new Date(dispute.created * 1000)
        },
        statusHistory: [
          ...order.statusHistory,
          {
            status: 'disputed',
            timestamp: new Date(),
            note: `Payment disputed: ${dispute.reason}`
          }
        ]
      }
    )

    // Track analytics
    await Analytics.create({
      type: 'payment_disputed',
      userId: order.userId,
      sessionId: 'stripe_webhook',
      data: {
        orderId: order.orderId,
        disputeId: dispute.id,
        amount: dispute.amount / 100,
        reason: dispute.reason
      }
    })

    console.log(`Dispute created for order ${order.orderId}`)

  } catch (error) {
    console.error('Error handling charge dispute:', error)
  }
}
