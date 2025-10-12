import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import {
  getEasyPaisaConfig,
  createSignature,
  generateDataString,
  formatPhoneNumber,
  isValidPakistaniPhone,
  generateTransactionRef,
  convertToPaisas,
  parseErrorResponse
} from '@/lib/easypaisa-utils';
import dbConnect, { Order } from '@/lib/mongoose';

/**
 * EasyPaisa Payment Initiation API
 * POST /api/easypaisa/initiate
 * 
 * Initiates a payment transaction with EasyPaisa
 */

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { orderId, amount, customerPhone, customerEmail, returnUrl, cancelUrl } = body;

    // Validate required fields
    if (!orderId || !amount || !customerPhone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: orderId, amount, customerPhone' 
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid amount. Must be a positive number' 
        },
        { status: 400 }
      );
    }

    // Validate Pakistani phone number
    if (!isValidPakistaniPhone(customerPhone)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Pakistani phone number format. Use format: 03XXXXXXXXX' 
        },
        { status: 400 }
      );
    }

    // Get order from database
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order not found' 
        },
        { status: 404 }
      );
    }

    // Check if order is already paid
    if (order.paymentStatus === 'Paid') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order is already paid' 
        },
        { status: 400 }
      );
    }

    // Get EasyPaisa configuration
    const config = getEasyPaisaConfig();
    
    // Format phone number
    const formattedPhone = formatPhoneNumber(customerPhone);
    
    // Generate unique transaction reference
    const transactionRef = generateTransactionRef(orderId);
    
    // Convert amount to paisas (EasyPaisa uses paisas, not rupees)
    const amountInPaisas = convertToPaisas(amount);
    
    // Prepare payment request parameters
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const paymentParams = {
      storeId: config.storeId,
      amount: amountInPaisas.toString(),
      postBackURL: `${baseUrl}/api/easypaisa/webhook`,
      orderRefNum: transactionRef,
      merchantHashedReq: '', // Will be filled after signing
      integrationModel: 'hosted',
      autoRedirect: '1',
      paymentMethod: 'InitialRequest',
      returnURL: returnUrl || `${baseUrl}/orders/${orderId}?payment=success`,
      cancelURL: cancelUrl || `${baseUrl}/orders/${orderId}?payment=cancelled`,
      merchantName: 'Luxury Dry Fruits',
      merchantOrderID: orderId,
      customerMobile: formattedPhone,
      customerEmail: customerEmail || order.customerEmail || '',
      productName: `Order #${order.orderNumber}`,
      productDescription: `Payment for order ${order.orderNumber}`,
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours expiry
    };

    // Generate data string for signing (excluding merchantHashedReq)
    const { merchantHashedReq, ...paramsToSign } = paymentParams;
    const dataString = generateDataString(paramsToSign);
    
    // Create RSA signature
    const signature = createSignature(dataString, config.privateKey);
    paymentParams.merchantHashedReq = signature;

    console.log('EasyPaisa Payment Request:', {
      orderId,
      transactionRef,
      amount: amountInPaisas,
      phone: formattedPhone,
      dataString: dataString.substring(0, 100) + '...' // Log first 100 chars for debugging
    });

    // Make request to EasyPaisa API
    const response = await axios.post(
      `${config.baseUrl}/Index.jsf`,
      paymentParams,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    // Handle EasyPaisa response
    if (response.status === 200) {
      // Update order with transaction reference
      await Order.findByIdAndUpdate(orderId, {
        $set: {
          'payment.transactionRef': transactionRef,
          'payment.provider': 'easypaisa',
          'payment.status': 'pending',
          'payment.initiatedAt': new Date(),
        }
      });

      // EasyPaisa typically returns a redirect URL or HTML form
      let redirectUrl = '';
      
      if (typeof response.data === 'string' && response.data.includes('form')) {
        // If response contains HTML form, extract action URL
        const actionMatch = response.data.match(/action=["\']([^"\']+)["\']/) 
        if (actionMatch) {
          redirectUrl = actionMatch[1];
        }
      } else if (response.data.redirectUrl) {
        redirectUrl = response.data.redirectUrl;
      } else if (response.data.paymentUrl) {
        redirectUrl = response.data.paymentUrl;
      }

      return NextResponse.json({
        success: true,
        transactionId: transactionRef,
        redirectUrl: redirectUrl || `${config.baseUrl}/payment/${transactionRef}`,
        message: 'Payment initiated successfully',
        paymentData: response.data
      });

    } else {
      throw new Error(`EasyPaisa API returned status ${response.status}`);
    }

  } catch (error: any) {
    console.error('EasyPaisa initiate payment error:', error);
    
    // Log detailed error for debugging
    if (error.response) {
      console.error('EasyPaisa API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }

    const errorMessage = parseErrorResponse(error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to initiate payment.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to initiate payment.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to initiate payment.' },
    { status: 405 }
  );
}