#!/bin/bash

# Build script for WholeWellness Coaching Platform
echo "🔨 Building WholeWellness Coaching Platform..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend with Vite
echo "🎨 Building frontend..."
npx vite build

# Build backend with esbuild
echo "⚙️ Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ Build completed successfully!"