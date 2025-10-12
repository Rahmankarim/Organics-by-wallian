import { NextRequest, NextResponse } from 'next/server';
import {
  getEasyPaisaConfig,
  verifySignature,
  generateDataString,
  validateWebhookSignature,
  convertFromPaisas,
  parseErrorResponse
} from '@/lib/easypaisa-utils';
import dbConnect, { Order } from '@/lib/mongoose';

/**
 * EasyPaisa Webhook Handler
 * POST /api/easypaisa/webhook
 * 
 * Handles payment notifications from EasyPaisa
 */

interface EasyPaisaWebhookData {
  storeId: string;
  orderRefNum: string;
  transactionId: string;
  transactionDateTime: string;
  paymentStatus: string;
  amount: string;
  merchantOrderID: string;
  responseMessage: string;
  responseCode: string;
  merchantHashedRes: string;
  checkSum?: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const config = getEasyPaisaConfig();
    
    // Parse webhook data
    let webhookData: EasyPaisaWebhookData;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      webhookData = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      webhookData = Object.fromEntries(formData.entries()) as any;
    } else {
      // Try to parse as JSON anyway
      const text = await request.text();
      try {
        webhookData = JSON.parse(text);
      } catch {
        // If not JSON, try to parse as URL-encoded
        const urlParams = new URLSearchParams(text);
        webhookData = Object.fromEntries(urlParams.entries()) as any;
      }
    }

    console.log('EasyPaisa Webhook Received:', {
      orderRefNum: webhookData.orderRefNum,
      transactionId: webhookData.transactionId,
      paymentStatus: webhookData.paymentStatus,
      amount: webhookData.amount,
      merchantOrderID: webhookData.merchantOrderID,
      responseCode: webhookData.responseCode,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!webhookData.orderRefNum || !webhookData.merchantOrderID) {
      console.error('Invalid webhook data: missing required fields');
      return NextResponse.json(
        { error: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    // Verify webhook signature/checksum if provided
    if (webhookData.merchantHashedRes || webhookData.checkSum) {
      let isValidSignature = false;
      
      try {
        if (webhookData.merchantHashedRes) {
          // Verify RSA signature
          const { merchantHashedRes, ...dataToVerify } = webhookData;
          const dataString = generateDataString(dataToVerify);
          isValidSignature = verifySignature(dataString, merchantHashedRes, config.publicKey);
        } else if (webhookData.checkSum) {
          // Verify HMAC signature
          isValidSignature = validateWebhookSignature(
            webhookData.checkSum,
            webhookData,
            config.webhookSecret
          );
        }
      } catch (error) {
        console.error('Signature verification error:', error);
        isValidSignature = false;
      }

      if (!isValidSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Find the order
    const order = await Order.findById(webhookData.merchantOrderID);
    if (!order) {
      console.error('Order not found:', webhookData.merchantOrderID);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Map EasyPaisa payment status to our system
    let paymentStatus: string;
    let orderStatus: string = order.status;

    switch (webhookData.paymentStatus?.toLowerCase()) {
      case 'paid':
      case 'success':
      case 'successful':
      case 'completed':
        paymentStatus = 'succeeded';
        orderStatus = 'confirmed';
        break;
      case 'failed':
      case 'failure':
      case 'error':
        paymentStatus = 'failed';
        orderStatus = 'cancelled';
        break;
      case 'pending':
      case 'processing':
        paymentStatus = 'processing';
        orderStatus = 'pending';
        break;
      case 'cancelled':
      case 'canceled':
        paymentStatus = 'cancelled';
        orderStatus = 'cancelled';
        break;
      default:
        paymentStatus = 'failed';
        orderStatus = 'pending';
        console.warn('Unknown payment status:', webhookData.paymentStatus);
    }

    // Verify amount if provided
    if (webhookData.amount) {
      const paidAmount = convertFromPaisas(parseInt(webhookData.amount));
      const orderAmount = order.total;
      
      // Allow small variance (e.g., 0.01 PKR) due to floating-point precision
      if (Math.abs(paidAmount - orderAmount) > 0.01) {
        console.error('Amount mismatch:', {
          orderAmount,
          paidAmount,
          orderId: order._id
        });
        
        // Still update the order but mark it for manual review
        paymentStatus = 'failed';
        orderStatus = 'pending';
      }
    }

    // Update order with payment information
    const updateData: any = {
      paymentStatus,
      status: orderStatus,
      'payment.transactionId': webhookData.transactionId || webhookData.orderRefNum,
      'payment.provider': 'easypaisa',
      'payment.status': paymentStatus,
      'payment.completedAt': new Date(),
      'payment.webhookData': webhookData,
      'payment.responseCode': webhookData.responseCode,
      'payment.responseMessage': webhookData.responseMessage
    };

    // Set payment intent ID if not already set
    if (!order.paymentIntentId && webhookData.transactionId) {
      updateData.paymentIntentId = webhookData.transactionId;
    }

    // Update the order
    await Order.findByIdAndUpdate(order._id, {
      $set: updateData
    });

    console.log('Order updated successfully:', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus,
      orderStatus,
      transactionId: webhookData.transactionId
    });

    // TODO: Send email notification for successful payment
    // if (paymentStatus === 'succeeded') {
    //   try {
    //     await sendOrderConfirmationEmail(order);
    //     console.log('Order confirmation email sent');
    //   } catch (emailError) {
    //     console.error('Failed to send confirmation email:', emailError);
    //   }
    // }

    // Return success response to EasyPaisa
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      orderId: order._id,
      paymentStatus,
      orderStatus
    });

  } catch (error: any) {
    console.error('EasyPaisa webhook error:', error);
    
    const errorMessage = parseErrorResponse(error);
    
    // Return error response but with 200 status to prevent retries
    // unless it's a validation error
    const statusCode = error.status === 400 || error.status === 404 ? error.status : 200;
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}

// Handle GET requests (for testing/verification)
export async function GET(request: NextRequest) {
  // Simple health check endpoint
  return NextResponse.json({
    message: 'EasyPaisa webhook endpoint is active',
    timestamp: new Date().toISOString(),
    status: 'ready'
  });
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}