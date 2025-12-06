# Vercel Deployment Checklist

## Before You Deploy to Vercel

This checklist ensures your products will show up correctly on Vercel.

---

## ✅ Pre-Deployment Checklist

### 1. Verify Products Exist Locally
- [ ] Start local dev server: `npm run dev`
- [ ] Go to `http://localhost:3001/products`
- [ ] See products loading? 
  - Expected: 2 products (Walnut Oil, Apples)
  - If empty: Run product seeding script first

### 2. Check Your Environment Variables
- [ ] Open `.env.local`
- [ ] Verify `MONGODB_URI` contains `/organic_orchard`
- [ ] Verify `JWT_SECRET` is set
- [ ] Verify `RESEND_API_KEY` is set

---

## 🚀 Vercel Deployment Steps

### Step 1: Set Environment Variables in Vercel

Go to: **https://vercel.com/dashboard**

1. Select your project: **Organics-by-wallian**
2. Go to **Settings** → **Environment Variables**
3. Add these variables (if not already there):

| Variable | Value | All Environments? |
|----------|-------|------------------|
| `MONGODB_URI` | `mongodb+srv://Reyan:reyan1122@cluster0.ym1qsw1.mongodb.net/organic_orchard?retryWrites=true&w=majority&appName=Cluster0` | ✓ Yes |
| `JWT_SECRET` | `luxury-dry-fruits-super-secret-jwt-key-2025` | ✓ Yes |
| `RESEND_API_KEY` | `re_CZJmq6NC_M7FiSAomFxYqDzU7soS6EKLG` | ✓ Yes |

**⚠️ CRITICAL**: For each variable, select all three:
- ✓ Production
- ✓ Preview  
- ✓ Development

### Step 2: Trigger Redeployment

Choose one:

**Option A: Manual Redeploy**
1. Go to **Deployments** tab
2. Click the latest deployment
3. Click the **⋮** menu → **Redeploy**
4. Wait for build to complete (usually 2-5 minutes)

**Option B: Push to GitHub**
1. Commit your changes locally
2. Run: `git push origin fix-server-component-errors`
3. Vercel will automatically redeploy
4. Watch the deployment status in Vercel dashboard

### Step 3: Wait for Deployment

- [ ] Deployment shows "Ready" ✓
- [ ] No build errors in logs
- [ ] No runtime errors in Function Logs

---

## ✅ Post-Deployment Verification

### Test 1: Check Products on Vercel
1. Go to your Vercel deployment URL
2. Click **Products** page
3. Expected: See 2 products (Walnut Oil at 1199, Apples at 20)
4. If empty: Go to Troubleshooting section below

### Test 2: Compare Localhost vs Vercel
- [ ] Open `http://localhost:3001/products` in one tab
- [ ] Open `https://your-vercel-url/products` in another tab
- [ ] Products should be identical

### Test 3: Check API Response
- Open your browser DevTools (F12)
- Go to **Network** tab
- Navigate to products page
- Look for request to `/api/products`
- Click it and check **Response** tab
- Should see JSON with your 2 products

---

## 🔧 Troubleshooting

### Problem: Products Show on Localhost but NOT on Vercel

**Solution 1: Verify Environment Variables**
1. Go to Vercel Settings → Environment Variables
2. Check `MONGODB_URI` exists
3. Verify it contains `/organic_orchard` (not `/organics`)
4. Manually redeploy after saving

**Solution 2: Check Vercel Logs**
1. Go to Vercel Dashboard → Deployments
2. Click the latest deployment
3. Scroll to **Function Logs** section
4. Look for errors containing:
   - "MongoDB"
   - "ECONNREFUSED"
   - "Cannot find module"
5. Share error message for debugging

**Solution 3: Check MongoDB Atlas**
1. Log into MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
2. Go to **Network Access**
3. Verify IP whitelist includes:
   - `0.0.0.0/0` (Allow all) ✓ OR
   - Vercel IP range (if restricted)
4. Go to **Databases**
5. Verify `organic_orchard` database exists
6. Verify `products` collection has items

**Solution 4: Rebuild from Scratch**
1. Vercel → Deployments → Latest deployment → ⋮ menu
2. Click **Redeploy** (don't use "Rebuild")
3. Wait for full rebuild

---

## 📋 Common Mistakes

❌ **Mistake 1**: Using wrong database name
- Wrong: `mongodb+srv://.../organics?...`
- Right: `mongodb+srv://.../organic_orchard?...`

❌ **Mistake 2**: Not selecting all environments
- Wrong: Only select "Production"
- Right: Select Production + Preview + Development

❌ **Mistake 3**: Not redeploying after adding variables
- Wrong: Add variables and assume it works
- Right: Add variables → Manually redeploy

❌ **Mistake 4**: MongoDB credentials wrong
- Wrong: Different username/password than local
- Right: Use exact same credentials as `.env.local`

---

## ✨ Success Indicators

✅ **You're done when**:
- Vercel deployment shows "Ready"
- Products page loads on Vercel deployment URL
- Same 2 products visible as on localhost
- API `/api/products` returns products in JSON
- No errors in browser console or Vercel logs

---

## 🆘 Emergency: Reset Everything

If nothing works:

1. **Delete current deployment**:
   - Vercel → Settings → Danger Zone → Delete Project
   
2. **Create new deployment**:
   - Push to GitHub (should auto-deploy)
   
3. **Add environment variables**:
   - Follow "Vercel Deployment Steps" above
   
4. **Trigger redeploy**:
   - Vercel → Deployments → Latest → Redeploy

---

**Last Updated**: December 6, 2025
**Status**: 2 products in `organic_orchard` database ✓

