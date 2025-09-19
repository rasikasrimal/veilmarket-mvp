#!/bin/bash

# VeilMarket Staging Deployment Script
# This script deploys the application to a staging environment

set -e

echo "🚀 Starting VeilMarket staging deployment..."

# Check required environment variables
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is required"
  exit 1
fi

if [ -z "$S3_ENDPOINT" ] || [ -z "$S3_ACCESS_KEY" ] || [ -z "$S3_SECRET_KEY" ]; then
  echo "❌ ERROR: S3 configuration environment variables are required"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build applications
echo "🔨 Building applications..."
pnpm build

# Run database migrations
echo "🗄️  Running database migrations..."
pnpm db:migrate

# Optional: Seed database if SEED_DATABASE is set
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  pnpm db:seed
fi

# Start applications
echo "🎯 Starting applications..."
if [ "$NODE_ENV" = "production" ]; then
  # Production mode
  concurrently \
    "cd apps/api && pnpm start" \
    "cd apps/web && pnpm start"
else
  # Development mode
  pnpm dev
fi

echo "✅ VeilMarket staging deployment completed!"
echo "📍 Web app: $APP_URL"
echo "📍 API: $API_URL"
echo "📍 API docs: $API_URL/docs"