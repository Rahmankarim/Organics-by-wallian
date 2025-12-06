# Google Cloud Run Deployment - Complete Guide

## Prerequisites Checklist
- [x] Docker installed: ✓ (version 28.4.0)
- [ ] Google Cloud SDK (gcloud CLI) - Need to install
- [ ] Google Cloud Account with billing enabled
- [ ] Your Project ID: **organicsbywallian**
- [ ] Project Number: **933510987393**

---

## Step 1: Install Google Cloud SDK

### Option A: Windows (Recommended)
1. Download: https://dl.google.com/dl/cloud/sdk/cloud-sdk-msi-x86_64.zip
2. Extract the ZIP file
3. Run: `google-cloud-sdk/install.bat`
4. Follow the installation wizard
5. Restart your terminal
6. Verify: `gcloud --version`

### Option B: Windows (Chocolatey)
```bash
choco install google-cloud-sdk
```

### Option C: Manual Download
- Visit: https://cloud.google.com/sdk/docs/install-sdk
- Download the Windows installer
- Run the installer
- Complete setup wizard

---

## Step 2: Initialize Google Cloud SDK

After installation, run these commands:

```bash
# Initialize gcloud
gcloud init

# When prompted:
# 1. Choose "Y" to log in to your Google Account
# 2. Select or create a configuration
# 3. Set default project to: organicsbywallian
# 4. Set default region to: asia-south1

# Verify authentication
gcloud auth list

# Set project
gcloud config set project organicsbywallian

# Verify project is set
gcloud config list
```

---

## Step 3: Enable Required APIs

In Google Cloud Console (https://console.cloud.google.com/):

1. Go to APIs & Services → Enable APIs
2. Search for and enable:
   - ✓ Cloud Run Admin API
   - ✓ Cloud Build API
   - ✓ Container Registry API
   - ✓ Service Management API

Or use CLI:
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

---

## Step 4: Create a Service Account (Optional but Recommended)

```bash
# Create service account
gcloud iam service-accounts create organics-runner

# Grant permissions
gcloud projects add-iam-policy-binding organicsbywallian \
  --member="serviceAccount:organics-runner@organicsbywallian.iam.gserviceaccount.com" \
  --role="roles/run.admin"
```

---

## Step 5: Deploy to Cloud Run

Navigate to your project folder:
```bash
cd "c:\Users\PMLS\Downloads\organicsbywallianmain"
```

Deploy with this command:
```bash
gcloud run deploy organics-by-wallian \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI=mongodb+srv://Reyan:reyan1122@cluster0.ym1qsw1.mongodb.net/organic_orchard?retryWrites=true&w=majority&appName=Cluster0,JWT_SECRET=luxury-dry-fruits-super-secret-jwt-key-2025,RESEND_API_KEY=re_CZJmq6NC_M7FiSAomFxYqDzU7soS6EKLG,NODE_ENV=production
```

### What This Command Does:
- `deploy organics-by-wallian` - Service name
- `--source .` - Build from current directory
- `--region asia-south1` - Deploy to Asia (Pakistan region)
- `--platform managed` - Fully managed service
- `--allow-unauthenticated` - Public access (no auth required)
- `--set-env-vars` - Pass environment variables

---

## Step 6: Monitor Deployment

The deployment will:
1. Build your Docker container (~2-5 minutes)
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Provide a public URL

Watch the logs:
```bash
gcloud run deploy organics-by-wallian \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated
```

---

## Step 7: Verify Deployment

After deployment completes, you'll see:
```
Service [organics-by-wallian] revision [organics-by-wallian-00001] has been deployed 
and is serving 100 percent of traffic.
Service URL: https://organics-by-wallian-xyz.a.run.app
```

### Test Your Deployment:

```bash
# Get the service URL
gcloud run services describe organics-by-wallian --region asia-south1

# Test the API
curl https://organics-by-wallian-xyz.a.run.app/api/products

# Test the website
# Go to: https://organics-by-wallian-xyz.a.run.app
# Navigate to /products page
# Should see your 2 products
```

---

## Environment Variables on Cloud Run

The environment variables are already set in the deployment command above:
- ✓ MONGODB_URI - Points to organic_orchard database
- ✓ JWT_SECRET - For authentication
- ✓ RESEND_API_KEY - For emails
- ✓ NODE_ENV - Set to production

---

## Troubleshooting

### Issue: `gcloud: command not found`
**Solution**: Reinstall Google Cloud SDK and restart terminal

### Issue: Authentication Error
**Solution**: Run `gcloud auth login` again

### Issue: Build Fails
**Solution**: 
1. Check Dockerfile exists in project root
2. Run `npm run build` locally to verify build works
3. Check Cloud Build logs in GCP Console

### Issue: Products Not Showing
**Solution**:
1. Verify MONGODB_URI is set in Cloud Run environment
2. Check MongoDB connection allows Cloud Run IPs
3. View logs: `gcloud run logs read organics-by-wallian --region asia-south1`

### Issue: High Latency/Slow Response
**Solution**:
1. Increase memory: `--memory 512Mi`
2. Increase CPU: `--cpu 2`
3. Increase timeout: `--timeout 3600`

---

## View Logs

```bash
# View recent logs
gcloud run logs read organics-by-wallian --region asia-south1 --limit 50

# Follow logs in real-time
gcloud run logs read organics-by-wallian --region asia-south1 --tail
```

---

## Update Deployment

If you make changes and want to redeploy:

```bash
# Just run the deploy command again (it will rebuild and redeploy)
gcloud run deploy organics-by-wallian \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated
```

---

## Scaling & Performance

```bash
# Set min/max instances
gcloud run deploy organics-by-wallian \
  --source . \
  --region asia-south1 \
  --min-instances 1 \
  --max-instances 100

# View current configuration
gcloud run services describe organics-by-wallian --region asia-south1
```

---

## Cost Estimate

Cloud Run pricing (as of 2025):
- **Free Tier**: 2 million requests/month, 360,000 GB-seconds/month
- **After free tier**: $0.40 per million requests + $0.00001667 per GB-second

Your typical usage will likely stay within free tier.

---

## Next Steps After Deployment

1. ✓ Get your public URL from Cloud Run
2. [ ] Test the website on the public URL
3. [ ] Connect your domain (point DNS to Cloud Run URL)
4. [ ] Set up SSL certificate
5. [ ] Monitor performance and logs
6. [ ] Set up automatic deployments from GitHub

---

## Connect Your Domain

To point your domain to Cloud Run:

1. Get your Cloud Run URL (e.g., `https://organics-by-wallian-xyz.a.run.app`)
2. In your domain registrar (e.g., GoDaddy, Namecheap):
   - Go to DNS settings
   - Add a CNAME record:
     - **Name**: @ (or www)
     - **Value**: `organics-by-wallian-xyz.a.run.app`
   - Save changes (can take 15-30 minutes to propagate)

---

## Quick Command Reference

```bash
# Deploy
gcloud run deploy organics-by-wallian --source . --region asia-south1 --platform managed --allow-unauthenticated

# View logs
gcloud run logs read organics-by-wallian --region asia-south1

# Get service info
gcloud run services describe organics-by-wallian --region asia-south1

# Delete service
gcloud run services delete organics-by-wallian --region asia-south1
```

---

**Status**: Ready to deploy - Just need to install Google Cloud SDK first
**Project**: organicsbywallian
**Region**: asia-south1 (Pakistan)
**Docker**: ✓ Ready

