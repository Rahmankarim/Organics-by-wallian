# Vercel Environment Variables Setup

## Issue: Database Mismatch Between Local and Vercel

**Problem**: 
- Local (localhost): Connects to `organic_orchard` database
- Vercel: Might be connecting to a different database

**Solution**: Set the correct MONGODB_URI environment variable in Vercel

## Your Local Configuration

```
Database: organic_orchard
MONGODB_URI: mongodb+srv://Reyan:reyan1122@cluster0.ym1qsw1.mongodb.net/organic_orchard?retryWrites=true&w=majority&appName=Cluster0
```

## Steps to Fix on Vercel

### 1. Go to Vercel Dashboard

- Visit: https://vercel.com/dashboard
- Select your project: **Organics-by-wallian**
- Go to **Settings** → **Environment Variables**

### 2. Add/Update Environment Variables

Add these variables with the exact values from your `.env.local`:

| Variable Name | Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://Reyan:reyan1122@cluster0.ym1qsw1.mongodb.net/organic_orchard?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | `luxury-dry-fruits-super-secret-jwt-key-2025` |
| `RESEND_API_KEY` | `re_CZJmq6NC_M7FiSAomFxYqDzU7soS6EKLG` |
| `STRIPE_SECRET_KEY` | `sk_test_your_stripe_secret_key` |
| `STRIPE_PUBLIC_KEY` | `pk_test_your_stripe_public_key` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_your_webhook_secret` |
| `NEXT_PUBLIC_APP_URL` | `https://your-vercel-app-url.vercel.app` |
| `NODE_ENV` | `production` |

### 3. Critical: Set Environment for All Deployment Types

When adding each variable, make sure to select:
- ✅ **Production** (for live deployments)
- ✅ **Preview** (for pull request deployments)
- ✅ **Development** (for local development)

### 4. Verify MongoDB Database Name

Ensure the URL includes the correct database name: `organic_orchard`

**Current URL Structure**:
```
mongodb+srv://[username]:[password]@[cluster]/organic_orchard?retryWrites=true&w=majority
```

**Key Part**: `/organic_orchard` ← This must match your local database name

### 5. Redeploy After Adding Variables

After setting environment variables:

1. Go to **Deployments**
2. Click the latest deployment
3. Click **Redeploy** button
4. Wait for build to complete

Or trigger a redeployment by:
- Pushing a new commit to the branch
- Running: `vercel --prod` from CLI

### 6. Verify It's Working

1. Visit your Vercel app URL
2. Navigate to Products page
3. Check if products load correctly
4. Open browser DevTools → Network tab
5. Check `/api/products` response - should show your products

## Troubleshooting

### Products Still Not Showing?

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Deployments → Function logs
   - Look for MongoDB connection errors

2. **Verify MONGODB_URI**:
   - Log into MongoDB Atlas
   - Copy the connection string again
   - Make sure database name is `organic_orchard`

3. **Check IP Whitelist**:
   - MongoDB Atlas → Network Access
   - Ensure Vercel IP range is whitelisted (0.0.0.0/0 or specific IPs)

4. **Database Contents**:
   - Log into MongoDB Atlas
   - Check `organic_orchard` database has products in `products` collection

### Different Database on Vercel?

If Vercel was showing different data before:

1. Check which database it was using:
   - MongoDB Atlas → Databases
   - Look for database names like: `organics`, `test`, `dev`, etc.

2. If you want to keep that database, update MONGODB_URI to point to it:
   ```
   mongodb+srv://Reyan:reyan1122@cluster0.ym1qsw1.mongodb.net/YOUR_OTHER_DB_NAME?...
   ```

3. If you want to use `organic_orchard` (recommended):
   - Set MONGODB_URI as shown above
   - Ensure all products are in `organic_orchard` database
   - Redeploy

## Sync Databases (Optional)

If you have products in multiple databases and want to consolidate:

1. Export from old database
2. Import to `organic_orchard`
3. Update MONGODB_URI to use `organic_orchard`

## Quick Command Reference

To redeploy from command line:
```bash
vercel --prod
```

To view environment variables from CLI:
```bash
vercel env pull
```

This will create a `.env.local` file with all your Vercel environment variables.

## Summary

✅ **To Fix**: Set `MONGODB_URI` in Vercel to use `organic_orchard` database
✅ **Result**: Both local and Vercel will use the same database
✅ **Verify**: Products appear on both localhost:3000 and vercel app URL
