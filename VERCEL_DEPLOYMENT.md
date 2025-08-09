# 🚀 Vercel Deployment Guide

This guide will help you deploy your Luxury Dry Fruits E-commerce platform to Vercel successfully.

## 📋 Prerequisites

- GitHub account with the repository
- Vercel account (free tier available)
- MongoDB Atlas account (for production database)

## 🔧 Step 1: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**: Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. **Create a Cluster**: 
   - Choose "Build a Database" → "Free Shared" tier
   - Select your preferred cloud provider and region
   - Name your cluster (e.g., "luxury-dry-fruits")
3. **Create Database User**:
   - Go to "Database Access" → "Add New Database User"
   - Create username and password (save these!)
   - Grant "Read and write to any database" permissions
4. **Configure Network Access**:
   - Go to "Network Access" → "Add IP Address"
   - Select "Allow access from anywhere" (0.0.0.0/0) for Vercel deployment
5. **Get Connection String**:
   - Go to "Clusters" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `OrganicsByWalian`

## 🌐 Step 2: Deploy to Vercel

### Option A: Direct GitHub Integration (Recommended)

1. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository `Organics-by-wallian`

2. **Configure Build Settings**:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Set Environment Variables**:
   Click on "Environment Variables" and add the following:

   ```bash
   # Required Variables
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/OrganicsByWalian
   JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random-at-least-32-characters
   JWT_EXPIRES_IN=7d
   
   # NextAuth (if using authentication)
   NEXTAUTH_SECRET=another-super-secret-key-for-nextauth-at-least-32-characters
   NEXTAUTH_URL=https://your-project-name.vercel.app
   
   # Optional: Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Optional: Stripe (for payments)
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete (should take 2-3 minutes)

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: organics-by-wallian
# - Directory: ./
# - Override settings? No

# Set environment variables
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Deploy to production
vercel --prod
```

## 🔑 Step 3: Generate Secure Secrets

Use these commands to generate secure secrets:

```bash
# For JWT_SECRET (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# For NEXTAUTH_SECRET (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or use online generator: https://generate-secret.vercel.app/32
```

## 🗄️ Step 4: Seed Your Database (Optional)

After deployment, you can populate your database with sample data:

1. **Access your deployed site**: `https://your-project-name.vercel.app`
2. **Call the seed endpoint**: 
   ```bash
   curl -X POST https://your-project-name.vercel.app/api/admin/seed
   ```
3. **Or visit in browser**: `https://your-project-name.vercel.app/api/admin/seed` (POST request)

## ✅ Step 5: Verify Deployment

1. **Check Homepage**: Visit your site URL
2. **Test Admin Dashboard**: Go to `/admin/dashboard`
3. **Check Database Connection**: Admin dashboard should show real data
4. **Test API Endpoints**: `/api/admin/analytics` should return data

## 🔧 Troubleshooting

### Build Failures

**Issue**: "Invalid/Missing environment variable: MONGODB_URI"
**Solution**: The latest code handles missing environment variables gracefully during build. Make sure to set `MONGODB_URI` in Vercel after deployment.

**Issue**: Import/Module errors
**Solution**: Check that all dependencies are in `package.json` and run `npm install` locally first.

### Runtime Issues

**Issue**: "Database not configured" errors
**Solution**: Verify `MONGODB_URI` is set correctly in Vercel environment variables.

**Issue**: Authentication not working
**Solution**: Ensure `JWT_SECRET` and `NEXTAUTH_SECRET` are set and `NEXTAUTH_URL` matches your domain.

### Performance Issues

**Issue**: Slow API responses
**Solution**: MongoDB Atlas free tier has limitations. Consider upgrading for better performance.

## 🚀 Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] All required environment variables set in Vercel
- [ ] Custom domain configured (optional)
- [ ] SSL certificate is active (automatic with Vercel)
- [ ] Database seeded with initial data
- [ ] Admin dashboard accessible
- [ ] API endpoints working
- [ ] Email configuration tested (if using)
- [ ] Payment gateway tested (if using Stripe)

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas connection logs
3. Verify all environment variables are set correctly
4. Test API endpoints individually

## 🔄 Updates

To deploy updates:
1. Push changes to your main branch on GitHub
2. Vercel will automatically redeploy
3. No additional configuration needed

---

Your Luxury Dry Fruits E-commerce platform should now be live on Vercel! 🎉
