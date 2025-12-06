# Use Node 18 slim image for smaller size
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy the rest of the project
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port 8080 (required by Cloud Run)
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
