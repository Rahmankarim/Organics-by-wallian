#!/bin/bash
cd "/c/Users/PMLS/Downloads/organicsbywallianmain"

echo "🚀 Starting Cloud Run Deployment..."
echo "=================================="

"C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd" run deploy organics-by-wallian \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars \
    MONGODB_URI="mongodb+srv://Reyan:reyan1122@cluster0.ym1qsw1.mongodb.net/organic_orchard?retryWrites=true&w=majority&appName=Cluster0" \
    JWT_SECRET="luxury-dry-fruits-super-secret-jwt-key-2025" \
    RESEND_API_KEY="re_CZJmq6NC_M7FiSAomFxYqDzU7soS6EKLG" \
    NODE_ENV="production"

echo ""
echo "✅ Deployment Complete!"
echo "=================================="
