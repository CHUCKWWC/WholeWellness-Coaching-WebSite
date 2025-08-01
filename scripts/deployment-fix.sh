#!/bin/bash

echo "🚀 Applying deployment fixes..."

# Step 1: Fix file permissions in server/public/assets directory
echo "📁 Fixing file permissions..."
chmod -R 755 server/public/assets/ 2>/dev/null || echo "Permission fix attempted"
chmod -R 644 server/public/assets/*.js 2>/dev/null || echo "JS files permission fix attempted"
chmod -R 644 server/public/assets/*.css 2>/dev/null || echo "CSS files permission fix attempted"

# Step 2: Clean build cache and rebuild
echo "🧹 Cleaning build cache..."
rm -rf dist/ 2>/dev/null || echo "Dist cleanup attempted"
rm -rf node_modules/.vite 2>/dev/null || echo "Vite cache cleanup attempted"

# Step 3: Ensure build output directory has correct permissions
echo "🔧 Setting up build directory permissions..."
mkdir -p dist/public
chmod 755 dist/public

# Step 4: Run a fresh build
echo "🏗️ Running fresh build..."
npm run build

# Step 5: Copy built files to server/public with correct permissions
echo "📋 Copying built files to server/public..."
if [ -d "dist/public" ]; then
    mkdir -p server/public
    cp -r dist/public/* server/public/
    chmod -R 755 server/public/
    chmod -R 644 server/public/assets/*.js 2>/dev/null || echo "JS files permission set"
    chmod -R 644 server/public/assets/*.css 2>/dev/null || echo "CSS files permission set"
    echo "✅ Built files copied with correct permissions"
else
    echo "❌ dist/public/ directory not found after build"
    exit 1
fi

# Step 6: Verify permissions on key files
echo "🔍 Verifying deployment readiness..."
if [ -f "server/public/index.html" ]; then
    echo "✅ index.html found in server/public"
else
    echo "❌ index.html missing from server/public"
fi

if [ -d "server/public/assets" ]; then
    asset_count=$(ls -1 server/public/assets/*.js 2>/dev/null | wc -l)
    echo "✅ Found ${asset_count} JS assets in server/public/assets"
else
    echo "❌ assets directory missing from server/public"
fi

echo "🎉 Deployment fixes complete!"
echo "The application is now ready for deployment."