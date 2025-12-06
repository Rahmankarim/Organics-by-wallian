# Use Node 18 slim image for smaller size
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

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
