import crypto from 'crypto'

// Easypaisa Payment Integration
// Note: This is a sample implementation. You'll need to get actual credentials from Easypaisa

interface EasypaisaConfig {
  storeId: string
  accountId: string
  secretKey: string
  baseUrl: string
}

interface PaymentRequest {
  orderId: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone: string
  description: string
  returnUrl: string
  cancelUrl: string
}

interface PaymentResponse {
  success: boolean
  transactionId?: string
  redirectUrl?: string
  error?: string
}

export class EasypaisaPayment {
  private config: EasypaisaConfig

  constructor() {
    this.config = {
      storeId: process.env.EASYPAISA_STORE_ID || '',
      accountId: process.env.EASYPAISA_ACCOUNT_ID || '',
      secretKey: process.env.EASYPAISA_SECRET_KEY || '',
      baseUrl: process.env.EASYPAISA_BASE_URL || 'https://easypaisa.com.pk/easypay'
    }
  }

  private generateHash(data: string): string {
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(data)
      .digest('hex')
      .toUpperCase()
  }

  private generateDateTime(): string {
    return new Date().toISOString().replace(/[:.]/g, '').slice(0, 14)
  }

  async initiatePayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const dateTime = this.generateDateTime()
      const expiryDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString().replace(/[:.]/g, '').slice(0, 14)

      // Create the data string for hash generation
      const dataString = [
        this.config.storeId,
        this.config.accountId,
        paymentRequest.amount.toFixed(2),
        'PKR',
        paymentRequest.orderId,
        paymentRequest.description,
        dateTime,
        expiryDateTime,
        paymentRequest.customerName,
        paymentRequest.customerEmail,
        paymentRequest.customerPhone,
        paymentRequest.returnUrl,
        paymentRequest.cancelUrl
      ].join('&')

      const hash = this.generateHash(dataString)

      // Prepare the payment form data
      const paymentData = {
        store_id: this.config.storeId,
        account_id: this.config.accountId,
        amount: paymentRequest.amount.toFixed(2),
        currency: 'PKR',
        order_id: paymentRequest.orderId,
        description: paymentRequest.description,
        datetime: dateTime,
        expiry_datetime: expiryDateTime,
        customer_name: paymentRequest.customerName,
        customer_email: paymentRequest.customerEmail,
        customer_phone: paymentRequest.customerPhone,
        return_url: paymentRequest.returnUrl,
        cancel_url: paymentRequest.cancelUrl,
        hash: hash,
        payment_method: 'MA' // Mobile Account
      }

      // For Easypaisa, we typically redirect the user to their payment page
      // This creates a form that auto-submits to Easypaisa
      const redirectUrl = this.createPaymentForm(paymentData)

      return {
        success: true,
        redirectUrl: redirectUrl,
        transactionId: paymentRequest.orderId
      }

    } catch (error) {
      console.error('Easypaisa payment initiation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initiation failed'
      }
    }
  }

  private createPaymentForm(paymentData: any): string {
    // Create an HTML form that auto-submits to Easypaisa
    // In a real implementation, you'd save this to a temporary file or return it as HTML
    const formFields = Object.entries(paymentData)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
      .join('\n')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecting to Easypaisa...</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #355E3B; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <h2>Redirecting to Easypaisa Payment Gateway...</h2>
        <div class="spinner"></div>
        <p>Please wait while we redirect you to secure payment...</p>
        <form id="paymentForm" action="${this.config.baseUrl}" method="POST">
          ${formFields}
        </form>
        <script>
          window.onload = function() {
            document.getElementById('paymentForm').submit();
          }
        </script>
      </body>
      </html>
    `
  }

  async verifyPayment(transactionData: any): Promise<{ success: boolean; verified: boolean; error?: string }> {
    try {
      const {
        transaction_id,
        order_id,
        amount,
        status,
        datetime,
        hash
      } = transactionData

      // Recreate the hash to verify the response
      const dataString = [
        this.config.storeId,
        this.config.accountId,
        amount,
        'PKR',
        order_id,
        transaction_id,
        status,
        datetime
      ].join('&')

      const expectedHash = this.generateHash(dataString)

      if (hash !== expectedHash) {
        return {
          success: false,
          verified: false,
          error: 'Hash verification failed'
        }
      }

      // Check if payment was successful
      const isSuccessful = status === 'SUCCESS' || status === 'PAID'

      return {
        success: true,
        verified: isSuccessful
      }

    } catch (error) {
      console.error('Easypaisa payment verification error:', error)
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      }
    }
  }

  // Alternative payment method - Cash on Delivery integration
  async initiateCOD(orderDetails: any): Promise<PaymentResponse> {
    try {
      // For COD, we just create a pending payment record
      return {
        success: true,
        transactionId: `COD_${orderDetails.orderId}_${Date.now()}`
      }
    } catch (error) {
      return {
        success: false,
        error: 'COD initiation failed'
      }
    }
  }
}

export const easypaisaPayment = new EasypaisaPayment()