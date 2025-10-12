import crypto from 'crypto';

/**
 * EasyPaisa Payment Gateway Utility Functions
 * Handles RSA signing, verification, and API communication
 */

export interface EasyPaisaConfig {
  storeId: string;
  apiKey: string;
  privateKey: string;
  publicKey: string;
  baseUrl: string;
  webhookSecret: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  customerPhone: string;
  customerEmail: string;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  message: string;
  error?: string;
}

/**
 * Get EasyPaisa configuration from environment variables
 */
export function getEasyPaisaConfig(): EasyPaisaConfig {
  const config = {
    storeId: process.env.EASYPAISA_STORE_ID || '',
    apiKey: process.env.EASYPAISA_API_KEY || '',
    privateKey: process.env.EASYPAISA_PRIVATE_KEY || '',
    publicKey: process.env.EASYPAISA_PUBLIC_KEY || '',
    baseUrl: process.env.EASYPAISA_BASE_URL || 'https://sandbox.easypaisa.com.pk/easypay',
    webhookSecret: process.env.EASYPAISA_WEBHOOK_SECRET || ''
  };

  // Validate required configuration
  const missingKeys = Object.entries(config)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`Missing EasyPaisa configuration: ${missingKeys.join(', ')}`);
  }

  return config;
}

/**
 * Create RSA-SHA256 signature for EasyPaisa API requests
 */
export function createSignature(data: string, privateKey: string): string {
  try {
    // Convert PEM string to proper format if needed
    const formattedKey = privateKey.includes('\\n') 
      ? privateKey.replace(/\\n/g, '\n')
      : privateKey;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(data, 'utf8');
    sign.end();
    
    const signature = sign.sign(formattedKey, 'base64');
    return signature;
  } catch (error) {
    console.error('Error creating signature:', error);
    throw new Error('Failed to create RSA signature');
  }
}

/**
 * Verify RSA-SHA256 signature from EasyPaisa webhook
 */
export function verifySignature(data: string, signature: string, publicKey: string): boolean {
  try {
    // Convert PEM string to proper format if needed
    const formattedKey = publicKey.includes('\\n') 
      ? publicKey.replace(/\\n/g, '\n')
      : publicKey;

    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(data, 'utf8');
    verify.end();
    
    return verify.verify(formattedKey, signature, 'base64');
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Generate data string for signing (order matters)
 */
export function generateDataString(params: Record<string, any>): string {
  // Sort parameters by key for consistent signing
  const sortedKeys = Object.keys(params).sort();
  const dataString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return dataString;
}

/**
 * Format Pakistani phone number for EasyPaisa
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('92')) {
    // Already has country code
    return `+${cleaned}`;
  } else if (cleaned.startsWith('03')) {
    // Local Pakistani mobile format
    return `+92${cleaned.substring(1)}`;
  } else if (cleaned.length === 10 && cleaned.startsWith('3')) {
    // Without leading zero
    return `+92${cleaned}`;
  }
  
  // Default: assume it's a local number and add Pakistan country code
  return `+92${cleaned}`;
}

/**
 * Validate Pakistani mobile number format
 */
export function isValidPakistaniPhone(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  // Pakistani mobile numbers: +92 3XX XXXXXXX (total 13 digits including +92)
  const pattern = /^\+923\d{9}$/;
  return pattern.test(formatted);
}

/**
 * Generate unique transaction reference
 */
export function generateTransactionRef(orderId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${orderId}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Hash webhook data for verification
 */
export function hashWebhookData(data: any, secret: string): string {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto
    .createHmac('sha256', secret)
    .update(dataString)
    .digest('hex');
}

/**
 * Validate webhook signature
 */
export function validateWebhookSignature(
  receivedSignature: string,
  data: any,
  secret: string
): boolean {
  const expectedSignature = hashWebhookData(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Parse EasyPaisa error response
 */
export function parseErrorResponse(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unknown error occurred with EasyPaisa payment';
}

/**
 * Convert amount to EasyPaisa format (paisas)
 */
export function convertToPaisas(amount: number): number {
  // EasyPaisa works in paisas (1 PKR = 100 paisas)
  return Math.round(amount * 100);
}

/**
 * Convert from paisas to PKR
 */
export function convertFromPaisas(paisas: number): number {
  return paisas / 100;
}