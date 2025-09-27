# Verification URL Fix - Environment Variables for Vercel

## Issue Fixed
- On localhost: verification links went to `/verify?email=...` ✅
- On Vercel: verification links went to `/verify-email?email=...` ❌
- Now: **Both use `/verify?email=...`** ✅

## Environment Variables to Set in Vercel

Add this environment variable to your Vercel deployment:

```bash
NEXT_PUBLIC_BASE_URL=https://your-vercel-domain.vercel.app
```

**Important:** Replace `your-vercel-domain.vercel.app` with your actual Vercel domain.

## Changes Made

### 1. Removed Duplicate Routes
- ❌ Deleted `/app/verify-email/page.tsx`
- ❌ Deleted `/app/api/auth/verify-email/route.ts`
- ✅ Kept only `/app/verify/page.tsx` and `/app/api/auth/verify/route.ts`

### 2. Added Redirect (next.config.mjs)
```javascript
async redirects() {
  return [
    { 
      source: '/verify-email', 
      destination: '/verify', 
      permanent: true 
    }
  ];
},
```

### 3. Updated Email Templates
- All emails now include clickable "Verify Now" buttons
- Links point to `/verify?email=...&code=...`
- Works with both Resend and SMTP fallback

### 4. Enhanced Verify Page
- Handles `code` parameter from URL (auto-verification)
- Supports manual code entry
- Single source of truth for verification

### 5. Environment Variables Added
- **Local (.env.local):** `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
- **Vercel:** `NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app`

## Testing
1. Register a new user
2. Check email - should have "Verify Now" button
3. Click button - should go to `/verify?email=...&code=...`
4. Should auto-verify and redirect to signin
5. Works identically on localhost and Vercel

## Deliverables ✅
- [x] Email links always point to `/verify?email=...` in both localhost and Vercel
- [x] Only one verification page (`/verify`)
- [x] No more `/verify-email` (deleted + redirect added)
- [x] Localhost and production behave identically
- [x] Enhanced logging for debugging on Vercel