# Authentication System Testing Guide

## Overview
This guide provides step-by-step instructions to test the newly implemented authentication system with email verification flow.

## Test Flow Summary

### 1. Signup Flow (POST /api/auth/register)
- **Does NOT create user directly**
- **Generates verification code, hashes it, saves to PendingUser collection**
- **Sends verification code via email**
- **Returns: `{ success: true, message: "Verification code sent" }`**

### 2. Verify Flow (POST /api/auth/verify)
- **Accepts `{ email, code }`**
- **Compares code with hashed one in PendingUser**
- **If valid → moves data to User collection, deletes PendingUser**
- **Returns: `{ success: true, message: "Account created successfully. You can now log in." }`**

### 3. Login Flow (POST /api/auth/login)
- **Only checks credentials against permanent User collection**
- **Does NOT send verification codes**
- **Returns JWT/session if valid**

## Manual Testing Steps

### Step 1: Test Registration
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "phone": "+1234567890"
  }'
\`\`\`

**Expected Response:**
\`\`\`json
{
  "success": true,
  "message": "Verification code sent"
}
\`\`\`

### Step 2: Check Email for Verification Code
- Check the email inbox for `test@example.com`
- Note the 6-digit verification code
- Code expires in 10 minutes

### Step 3: Test Verification
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
\`\`\`

**Expected Response:**
\`\`\`json
{
  "success": true,
  "message": "Account created successfully. You can now log in."
}
\`\`\`

### Step 4: Test Login
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
\`\`\`

**Expected Response:**
\`\`\`json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "role": "customer"
    }
  }
}
\`\`\`

## Frontend Testing

### Test Signup Page
1. Navigate to `/signup`
2. Fill in the registration form
3. Submit - should show verification code input
4. Enter the code from email
5. Should redirect to `/login` with success message

### Test Login Page
1. Navigate to `/signin`
2. Enter email and password
3. Should login successfully and redirect to home

## Error Cases to Test

### Invalid Verification Code
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "000000"
  }'
\`\`\`

**Expected Response:**
\`\`\`json
{
  "success": false,
  "message": "Invalid or expired code"
}
\`\`\`

### Login Before Verification
1. Register a new user
2. Try to login without verifying
3. Should get error: "Please verify your email before logging in"

### Duplicate Registration
1. Try to register with same email twice
2. Should get error: "User with this email already exists"

## Database Verification

### Check PendingUser Collection
\`\`\`javascript
// In MongoDB shell or compass
db.pendingusers.find({ email: "test@example.com" })
\`\`\`

### Check User Collection After Verification
\`\`\`javascript
// In MongoDB shell or compass
db.users.find({ email: "test@example.com" })
\`\`\`

## Production Testing Checklist

- [ ] Registration creates PendingUser (not User)
- [ ] Email verification code is sent
- [ ] Verification moves PendingUser to User
- [ ] Login only works for verified users
- [ ] Login does not send verification emails
- [ ] All API responses follow consistent format
- [ ] Rate limiting works on all endpoints
- [ ] Password hashing is secure
- [ ] JWT tokens are set as httpOnly cookies
- [ ] Frontend shows verification step after signup
- [ ] Frontend redirects properly after verification
- [ ] Error messages are user-friendly

## Notes
- Verification codes expire in 10 minutes
- PendingUser entries auto-delete when expired
- All passwords are hashed with bcrypt (12 salt rounds)
- JWT tokens are stored in httpOnly cookies for security
- Rate limiting prevents brute force attacks
