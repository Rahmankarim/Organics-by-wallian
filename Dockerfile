# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files only
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install prod deps only
RUN pnpm install --prod --frozen-lockfile

# Copy built app (only what exists)
COPY --from=builder /app/.next ./.next

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["pnpm", "start"]
# Cloud Run deployment Sat, Dec  6, 2025  6:56:21 PM
