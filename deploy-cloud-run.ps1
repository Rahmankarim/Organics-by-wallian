#!/usr/bin/env pwsh

$gcloudPath = "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"

$env_vars = @(
    "MONGODB_URI=mongodb+srv://Reyan:reyan1122@cluster0.ym1qsw1.mongodb.net/organic_orchard?retryWrites=true&w=majority&appName=Cluster0"
    "JWT_SECRET=luxury-dry-fruits-super-secret-jwt-key-2025"
    "RESEND_API_KEY=re_CZJmq6NC_M7FiSAomFxYqDzU7soS6EKLG"
    "NODE_ENV=production"
) -join ","

Write-Host "Deploying to Cloud Run..."
Write-Host "Environment variables count: $(($env_vars -split ',').Count)"

& $gcloudPath run deploy organics-by-wallian `
  --source . `
  --region asia-south1 `
  --allow-unauthenticated `
  --set-env-vars=$env_vars `
  --platform managed
