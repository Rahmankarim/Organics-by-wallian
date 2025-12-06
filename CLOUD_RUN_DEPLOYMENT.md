# Google Cloud Run Deployment Guide

## Your Project is Next.js ✅

Your project is already optimized for Cloud Run! The `package.json` has the correct `start` script.

## Files Created

1. **Dockerfile** - Container image configuration
2. **.dockerignore** - Files to exclude from Docker build
3. **deploy-to-cloud-run.sh** - Automated deployment script

## Prerequisites

1. **Google Cloud Account** - Create one at [console.cloud.google.com](https://console.cloud.google.com)
2. **Google Cloud CLI** - Install from [cloud.google.com/sdk](https://cloud.google.com/sdk/docs/install)
3. **Docker** (optional) - For local testing

## Step-by-Step Deployment

### 1. Setup Google Cloud CLI

```bash
# Install Google Cloud SDK (if not already installed)
# https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID
```

### 2. Update Environment Variables

Edit `deploy-to-cloud-run.sh` and set your environment variables:

```bash
# Get your values from .env.local
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
RESEND_API_KEY=your_resend_key
STRIPE_SECRET_KEY=your_stripe_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Run the Deployment Script

```bash
chmod +x deploy-to-cloud-run.sh
./deploy-to-cloud-run.sh
```

**Or deploy manually using gcloud CLI:**

```bash
# Build and push to Cloud Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/organics-by-wallian

# Deploy to Cloud Run
gcloud run deploy organics-by-wallian \
  --image gcr.io/YOUR_PROJECT_ID/organics-by-wallian \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars MONGODB_URI=your_mongodb_uri,JWT_SECRET=your_secret
```

### 4. Configure Custom Domain (Optional)

```bash
gcloud run domain-mappings create \
  --service=organics-by-wallian \
  --domain=your-domain.com \
  --region=us-central1
```

## Environment Variables to Set in Cloud Run

Go to Cloud Run Console → Your Service → Edit & Deploy → Runtime Settings → Environment Variables

Add these variables:

```
MONGODB_URI          = mongodb+srv://...
JWT_SECRET          = your_jwt_secret
RESEND_API_KEY      = your_resend_api_key
STRIPE_SECRET_KEY   = your_stripe_secret
STRIPE_PUBLIC_KEY   = your_stripe_public_key
STRIPE_WEBHOOK_SECRET = your_webhook_secret
NEXT_PUBLIC_APP_URL = https://your-app-url.run.app
```

## Important Notes

- **Next.js Version**: 14.2.33 (modern & supported)
- **Node Version**: 18 (used in Dockerfile)
- **Memory**: 512Mi (configurable, upgrade if needed)
- **CPU**: 1 vCPU (configurable)
- **Port**: 8080 (required by Cloud Run, already set)
- **Build Timeout**: 30 minutes (may need increase for large builds)

## Troubleshooting

### Build Fails: "JavaScript heap out of memory"

- Already handled! Your `package.json` build script uses 4GB heap
- If still failing on Cloud Run, update Dockerfile build step:

```dockerfile
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### MongoDB Connection Issues

- Ensure IP whitelist includes Google Cloud Run IPs
- Use MongoDB Atlas → Network Access → Add 0.0.0.0/0 (or specific IPs)

### 502 Bad Gateway

- Check logs: `gcloud run logs read organics-by-wallian --region=us-central1`
- Ensure PORT=8080 is set correctly

### Environment Variables Not Loading

- Restart the service after updating variables
- Verify variables are set in Cloud Run console

## Cost Estimate

- **Free Tier**: 2 million requests/month (includes 1st gen)
- **Typical Usage**: ~$5-20/month for small-medium traffic
- **Scaling**: Auto-scales with traffic

## Next Steps

1. Push code to GitHub
2. Enable Cloud Build for CI/CD (optional)
3. Monitor in Cloud Run dashboard
4. Setup logging with Cloud Logging

## Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Deploying Next.js](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/nodejs)
- [MongoDB Atlas Network Access](https://docs.mongodb.com/manual/reference/method/db.auth/)
