#!/bin/bash
# Deploy to Google Cloud Run

# Set your project ID
PROJECT_ID="your-gcp-project-id"
REGION="us-central1"
SERVICE_NAME="organics-by-wallian"
IMAGE_NAME="organics-by-wallian"

# Authenticate with GCP (run this once)
# gcloud auth login
# gcloud config set project $PROJECT_ID

# Build the Docker image
echo "Building Docker image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$IMAGE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 3600 \
  --set-env-vars MONGODB_URI=$MONGODB_URI,JWT_SECRET=$JWT_SECRET,NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

echo "✅ Deployment complete!"
echo "Your app is running at: https://$SERVICE_NAME-xxxxx.run.app"
