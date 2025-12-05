import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Order, CartItem } from '@/lib/mongoose';
import { getUserFromRequest } from '@/lib/auth';
import Stripe from 'stripe';

// Route segment config to prevent static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, amount, paymentMethod = 'stripe', returnUrl, cancelUrl } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Order ID and amount are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Handle Cash on Delivery
    if (paymentMethod === 'cod') {
      await Order.findByIdAndUpdate(orderId, {
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'confirmed'
      });

      return NextResponse.json({
        success: true,
        paymentMethod: 'cod',
        message: 'Order placed successfully. Pay on delivery.'
      });
    }

    // Handle Card Payment via Stripe
    if (paymentMethod === 'stripe') {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'pkr',
                product_data: {
                  name: `Order #${order.orderNumber}`,
                  description: 'Organics by Wallian - Premium Dry Fruits',
                },
                unit_amount: Math.round(amount * 100), // Convert to paisas
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?payment=success`,
          cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
          customer_email: user.email,
          metadata: {
            orderId: orderId.toString(),
            userId: user._id.toString(),
          },
        });

        // Update order with payment session details
        await Order.findByIdAndUpdate(orderId, {
          paymentMethod: 'card',
          paymentStatus: 'processing',
          paymentIntentId: session.id,
        });

        return NextResponse.json({
          success: true,
          paymentMethod: 'stripe',
          url: session.url,
          sessionId: session.id
        });
      } catch (stripeError: any) {
        console.error('Stripe error:', stripeError);
        return NextResponse.json(
          { error: stripeError.message || 'Failed to create payment session' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid payment method. Only COD and card payments are supported.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
      await CartItem.deleteMany({ userId: user._id });

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        orderStatus: 'confirmed'
      });

    } else {
      // Payment failed or verification failed
      await Order.findOneAndUpdate(
        { orderId },
        {
          paymentStatus: 'failed',
          status: 'cancelled',
          paymentDetails: {
            ...order.paymentDetails,
            failureReason: verificationResult.error || 'Payment verification failed',
            failedAt: new Date()
          }
        }
      );

      return NextResponse.json(
        { error: verificationResult.error || 'Payment verification failed' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
