# EasyPaisa Payment Integration - Testing Guide

## Overview

This document provides instructions for testing the EasyPaisa payment integration in your Pakistani ecommerce platform.

## Prerequisites

1. **EasyPaisa Merchant Account**: Register with EasyPaisa and obtain sandbox credentials
2. **RSA Key Pair**: Generate 2048-bit RSA keys for secure communication
3. **Environment Variables**: Configure all required environment variables

## Environment Setup

### 1. Generate RSA Key Pair

Generate a 2048-bit RSA key pair for secure communication:

```bash
# Generate private key
openssl genrsa -out easypaisa_private.pem 2048

# Generate public key
openssl rsa -in easypaisa_private.pem -pubout -out easypaisa_public.pem

# Format for environment variables (replace newlines with \n)
cat easypaisa_private.pem | tr '\n' '\\n'
cat easypaisa_public.pem | tr '\n' '\\n'
```

### 2. Environment Variables

Add these to your `.env.local` file:

```bash
# EasyPaisa Payment Gateway
EASYPAISA_STORE_ID=your-sandbox-store-id
EASYPAISA_API_KEY=your-sandbox-api-key
EASYPAISA_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----
EASYPAISA_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nEASYPAISA_PUBLIC_KEY_HERE\n-----END PUBLIC KEY-----
EASYPAISA_BASE_URL=https://sandbox.easypaisa.com.pk/easypay
EASYPAISA_WEBHOOK_SECRET=your-webhook-secret-key
```

### 3. Merchant Portal Setup

1. Login to EasyPaisa merchant portal
2. Upload your public key (`easypaisa_public.pem`)
3. Configure webhook URL: `https://yourdomain.com/api/easypaisa/webhook`
4. Note down your Store ID and API Key

## Testing Scenarios

### 1. Successful Payment Flow

1. **Add items to cart** and proceed to checkout
2. **Fill shipping information** with valid Pakistani details:

   - Phone: `03001234567` (Pakistani mobile format)
   - Address: Any Pakistani address
   - Postal Code: 5-digit code (e.g., `44000`)
   - Province: Select from Pakistani provinces

3. **Select EasyPaisa** as payment method
4. **Click "Pay with EasyPaisa"** button
5. **Verify redirect** to EasyPaisa payment page
6. **Complete payment** on EasyPaisa sandbox
7. **Verify redirect** back to success page
8. **Check order status** in admin panel

### 2. Failed Payment Testing

1. Follow steps 1-4 from successful flow
2. **Cancel payment** on EasyPaisa page
3. **Verify redirect** to order page with error status
4. **Check order remains** in pending status

### 3. Webhook Testing

1. **Use ngrok** to expose local webhook endpoint:

   ```bash
   ngrok http 3001
   ```

2. **Update webhook URL** in EasyPaisa merchant portal to ngrok URL:

   ```
   https://your-ngrok-id.ngrok.io/api/easypaisa/webhook
   ```

3. **Monitor webhook calls** in terminal logs
4. **Verify order updates** after webhook receives payment confirmation

## Test Data

### Valid Pakistani Phone Numbers

- `03001234567` - Mobilink/Jazz
- `03301234567` - Warid/Jazz
- `03451234567` - Telenor
- `03551234567` - Ufone

### Valid Pakistani Postal Codes

- `44000` - Islamabad
- `75500` - Karachi
- `54000` - Lahore
- `25000` - Peshawar

### Pakistani Provinces

- Islamabad Capital Territory
- Punjab
- Sindh
- Khyber Pakhtunkhwa
- Balochistan
- Gilgit-Baltistan
- Azad Jammu and Kashmir

## API Endpoints

### Initiate Payment

```
POST /api/easypaisa/initiate
Content-Type: application/json

{
  "orderId": "order_id_here",
  "amount": 1500,
  "customerPhone": "03001234567",
  "customerEmail": "customer@example.com",
  "returnUrl": "https://yourdomain.com/order-success",
  "cancelUrl": "https://yourdomain.com/order-cancelled"
}
```

### Webhook Endpoint

```
POST /api/easypaisa/webhook
Content-Type: application/x-www-form-urlencoded

storeId=your-store-id&orderRefNum=txn-ref&transactionId=123456&paymentStatus=paid&amount=150000&merchantOrderID=order-id&responseCode=00&merchantHashedRes=signature
```

## Debugging

### 1. Enable Debug Logging

Add to your development environment:

```javascript
// In easypaisa utils or route files
console.log("EasyPaisa Debug:", {
  orderId,
  amount,
  phone: formattedPhone,
  signature: signature.substring(0, 50) + "...",
});
```

### 2. Common Issues

#### Invalid Phone Number

- **Error**: "Invalid Pakistani phone number format"
- **Solution**: Use format `03XXXXXXXXX` (11 digits starting with 03)

#### Signature Verification Failed

- **Error**: "Invalid signature"
- **Solution**: Check RSA keys and ensure proper formatting in environment variables

#### Webhook Not Receiving Calls

- **Error**: Order status not updating
- **Solution**:
  - Verify webhook URL is accessible
  - Check ngrok is running for local testing
  - Ensure webhook endpoint returns 200 status

#### Amount Mismatch

- **Error**: "Amount mismatch"
- **Solution**: Ensure amounts are in correct format (paisas for EasyPaisa API)

### 3. Monitoring

Monitor these log files during testing:

```bash
# Application logs
tail -f logs/app.log

# Webhook logs
tail -f logs/webhook.log

# EasyPaisa API logs
tail -f logs/easypaisa.log
```

## Production Deployment

### 1. Switch to Production

Update environment variables for production:

```bash
# Production EasyPaisa URLs
EASYPAISA_BASE_URL=https://easypaisa.com.pk/easypay
EASYPAISA_STORE_ID=your-production-store-id
EASYPAISA_API_KEY=your-production-api-key
```

### 2. Security Checklist

- [ ] RSA private key is securely stored
- [ ] Webhook secret is properly configured
- [ ] HTTPS is enabled for all communication
- [ ] Environment variables are not exposed in client code
- [ ] Webhook signature verification is enabled
- [ ] Error messages don't expose sensitive information

### 3. Performance Considerations

- [ ] Webhook endpoint responds within 10 seconds
- [ ] Database connections are properly handled
- [ ] Error handling covers all edge cases
- [ ] Logging is configured for production

## Support

### EasyPaisa Support

- **Technical Support**: tech-support@easypaisa.com.pk
- **Business Support**: business@easypaisa.com.pk
- **Documentation**: [EasyPaisa Developer Portal]

### Common Error Codes

| Code | Description | Action                    |
| ---- | ----------- | ------------------------- |
| 00   | Success     | Payment completed         |
| 01   | Failed      | Payment failed            |
| 02   | Pending     | Payment in progress       |
| 03   | Cancelled   | Payment cancelled by user |
| 04   | Expired     | Payment session expired   |

## Testing Checklist

- [ ] Successful payment flow works end-to-end
- [ ] Failed payment is handled correctly
- [ ] Cancelled payment redirects properly
- [ ] Webhook updates order status correctly
- [ ] Pakistani phone validation works
- [ ] Amount calculations are correct
- [ ] Order confirmation emails are sent
- [ ] Admin panel shows correct payment status
- [ ] Refund process works (if implemented)
- [ ] Error handling covers edge cases
