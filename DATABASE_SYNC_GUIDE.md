# Database Sync & Environment Variable Setup Guide

## Current Status

**Localhost Database**: `organic_orchard`

- ✓ Connected successfully
- ✓ Contains 2 products:
  1. "Pure Walnut Oil 250ML From Gilgit" - Price: 1199
  2. "Apples" - Price: 20

**Vercel Database**: Currently not configured (missing MONGODB_URI environment variable)

---

## The Problem

Products show on localhost but NOT on Vercel because:

1. Vercel doesn't have `MONGODB_URI` environment variable set
2. This causes Vercel to not connect to MongoDB
3. Result: Empty product list on Vercel

---

## The Solution (Step by Step)

### Step 1: Copy Your MongoDB Connection String

Your local MongoDB connection string (from `.env.local`):

```
mongodb+srv://Reyan:reyan1122@cluster0.ym1qsw1.mongodb.net/organic_orchard?retryWrites=true&w=majority&appName=Cluster0
```

**Important**: This connects to the `organic_orchard` database - this is where your products are stored.

---

### Step 2: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard**:

   - Visit: https://vercel.com/dashboard
   - Find your project: **Organics-by-wallian**

2. **Navigate to Settings**:

   - Click **Settings** (in top menu)
   - Click **Environment Variables** (in left sidebar)

3. **Add MONGODB_URI Variable**:

   - Click **"Add New"**
   - **Name**: `MONGODB_URI`
   - **Value**: Paste your connection string:
     ```
     mongodb+srv://Reyan:reyan1122@cluster0.ym1qsw1.mongodb.net/organic_orchard?retryWrites=true&w=majority&appName=Cluster0
     ```
   - **Environment**: Select all three:
     - ✓ Production
     - ✓ Preview
     - ✓ Development
   - Click **Save**

4. **Add JWT_SECRET** (if not already there):

   - Click **"Add New"**
   - **Name**: `JWT_SECRET`
   - **Value**: `luxury-dry-fruits-super-secret-jwt-key-2025`
   - **Environment**: Select all three
   - Click **Save**

5. **Add RESEND_API_KEY** (if not already there):
   - Click **"Add New"**
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_CZJmq6NC_M7FiSAomFxYqDzU7soS6EKLG`
   - **Environment**: Select all three
   - Click **Save**

---

### Step 3: Verify MongoDB Configuration in Vercel

After adding variables, Vercel should show them in the Environment Variables list. You should see:

- ✓ MONGODB_URI
- ✓ JWT_SECRET
- ✓ RESEND_API_KEY

---

### Step 4: Trigger Redeployment

After setting environment variables, you need to redeploy:

**Option A: Manual Redeploy (Easiest)**

1. Go to **Deployments** tab in Vercel
2. Find the latest deployment
3. Click the **⋮** (three dots menu)
4. Click **Redeploy**
5. Wait for build to complete

**Option B: Automatic Redeploy (via GitHub)**

1. Go to your GitHub repository
2. Make a small change to any file (e.g., add a comment)
3. Commit and push
4. Vercel will automatically redeploy
5. Monitor the deployment in Vercel dashboard

---

### Step 5: Verify It Works

Once redeployed:

1. **Go to your Vercel app**:

   - Visit your deployed URL (e.g., https://your-project.vercel.app)

2. **Check Products Page**:

   - Navigate to `/products`
   - You should see the same 2 products as localhost:
     - "Pure Walnut Oil 250ML From Gilgit" - Price: 1199
     - "Apples" - Price: 20

3. **Compare with Localhost**:
   - Open `http://localhost:3001/products` side by side
   - Both should show identical products

---

## Troubleshooting

### Products Still Not Showing?

**Check 1: Verify Environment Variable is Set**

- Go to Vercel → Settings → Environment Variables
- Confirm `MONGODB_URI` is there
- Confirm it includes `/organic_orchard` in the URL

**Check 2: Check Vercel Logs**

- Go to Vercel Dashboard → Deployments
- Click the latest deployment
- Click **Function Logs** tab
- Look for error messages containing "MongoDB" or "connect"
- Share any errors for debugging

**Check 3: Verify Network Access**

- MongoDB Atlas → Network Access
- Ensure IP `0.0.0.0/0` is whitelisted (or add specific Vercel IPs)
- This allows Vercel to connect to MongoDB

**Check 4: Manually Check API Response**

- Go to `https://your-vercel-url/api/products`
- You should see JSON with products array
- If you see `{"products":[]}`, the connection is working but no products exist in Vercel's database

---

## Final Checklist

- [ ] Environment variables added to Vercel dashboard
- [ ] MONGODB_URI points to `organic_orchard` database
- [ ] All three environment types selected (Production, Preview, Development)
- [ ] Redeployment triggered
- [ ] Products appear on Vercel's products page
- [ ] Products match localhost exactly

---

## Quick Reference: Connection String Format

```
mongodb+srv://[username]:[password]@[cluster]/[database_name]?retryWrites=true&w=majority&appName=[app_name]
```

Your specific URL:

- **Username**: Reyan
- **Password**: reyan1122
- **Cluster**: cluster0.ym1qsw1
- **Database**: organic_orchard ← This is critical!
- **AppName**: Cluster0

If any part is different, the connection might not work.

---

## Need Help?

If products are still not showing after following these steps:

1. Double-check the MONGODB_URI value includes `/organic_orchard`
2. Check Vercel Function Logs for error messages
3. Verify MongoDB Atlas Network Access allows Vercel connections
4. Try a manual redeploy after waiting 1-2 minutes
