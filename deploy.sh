#!/bin/bash
# Deployment script for Replit
echo "🔨 Building application..."
node build.cjs

if [ $? -eq 0 ]; then
    echo "✅ Build successful, starting server..."
    node start.cjs
else
    echo "❌ Build failed"
    exit 1
fi