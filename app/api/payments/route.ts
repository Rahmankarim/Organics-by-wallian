import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Order, Product, CartItem } from '@/lib/mongoose';
import { getUserFromRequest } from '@/lib/auth';
import { easypaisaPayment } from '@/lib/easypaisa';

// Route segment config to prevent static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
    const { orderId, amount, currency = 'PKR', paymentMethod = 'easypaisa' } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Order ID and amount are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the order
    const order = await Order.findOne({ 
      orderId, 
      userId: user._id,
      status: 'pending'
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or already processed' },
        { status: 404 }
      );
    }

    // Verify amount matches order total
    if (Math.round(amount) !== Math.round(order.totalAmount)) {
      return NextResponse.json(
        { error: 'Payment amount does not match order total' },
        { status: 400 }
      );
    }

    if (paymentMethod === 'cod') {
      // Handle Cash on Delivery
      const codResult = await easypaisaPayment.initiateCOD({
        orderId: order.orderId,
        amount: order.totalAmount,
        userEmail: user.email
      });

      if (codResult.success) {
        // Update order for COD
        await Order.findOneAndUpdate(
          { orderId },
          {
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            paymentDetails: {
              transactionId: codResult.transactionId,
              paymentMethod: 'cod',
              amount: order.totalAmount,
              currency: 'PKR'
            }
          }
        );

        return NextResponse.json({
          success: true,
          paymentMethod: 'cod',
          transactionId: codResult.transactionId,
          message: 'Order placed successfully. Pay on delivery.'
        });
      } else {
        return NextResponse.json(
          { error: codResult.error || 'COD setup failed' },
          { status: 400 }
        );
      }
    } else {
      // Handle Easypaisa payment
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      const paymentResult = await easypaisaPayment.initiatePayment({
        orderId: order.orderId,
        amount: order.totalAmount,
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        customerPhone: order.shippingAddress?.phoneNumber || '',
        description: `Payment for Order #${order.orderNumber}`,
        returnUrl: `${baseUrl}/orders/${order._id}?payment=success`,
        cancelUrl: `${baseUrl}/orders/${order._id}?payment=cancelled`
      });

      if (paymentResult.success) {
        // Update order with payment details
        await Order.findOneAndUpdate(
          { orderId },
          {
            paymentMethod: 'easypaisa',
            paymentStatus: 'processing',
            paymentDetails: {
              transactionId: paymentResult.transactionId,
              paymentMethod: 'easypaisa',
              amount: order.totalAmount,
              currency: 'PKR'
            }
          }
        );

        return NextResponse.json({
          success: true,
          paymentMethod: 'easypaisa',
          redirectUrl: paymentResult.redirectUrl,
          transactionId: paymentResult.transactionId
        });
      } else {
        return NextResponse.json(
          { error: paymentResult.error || 'Payment initiation failed' },
          { status: 400 }
        );
      }
    }

  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle payment verification/callback from Easypaisa
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transactionData, orderId } = body;

    if (!transactionData || !orderId) {
      return NextResponse.json(
        { error: 'Transaction data and order ID are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the order
    const order = await Order.findOne({ 
      orderId,
      userId: user._id 
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify payment with Easypaisa
    const verificationResult = await easypaisaPayment.verifyPayment(transactionData);

    if (verificationResult.success && verificationResult.verified) {
      // Payment successful - update order
      await Order.findOneAndUpdate(
        { orderId },
        {
          paymentStatus: 'completed',
          status: 'confirmed',
          paymentDetails: {
            ...order.paymentDetails,
            verifiedAt: new Date(),
            easypaisaTransactionId: transactionData.transaction_id,
            easypaisaStatus: transactionData.status
          }
        }
      );

      // Clear user's cart
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
