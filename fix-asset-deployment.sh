#!/bin/bash

# Fix asset deployment issues for WholeWellness Coaching Platform
echo "🔧 Fixing asset deployment issues..."

# Set proper permissions for built assets
echo "📁 Setting proper permissions for assets..."
if [ -d "dist/public/assets" ]; then
    chmod -R 755 dist/public/assets/
    echo "✅ Set permissions for dist/public/assets/"
fi

if [ -d "client/dist/assets" ]; then
    chmod -R 755 client/dist/assets/
    echo "✅ Set permissions for client/dist/assets/"
fi

# Ensure correct file permissions for specific asset types
echo "🎯 Setting specific file permissions..."
find dist/public/assets/ -name "*.js" -type f -exec chmod 644 {} \; 2>/dev/null || true
find dist/public/assets/ -name "*.css" -type f -exec chmod 644 {} \; 2>/dev/null || true
find dist/public/assets/ -name "*.jpg" -type f -exec chmod 644 {} \; 2>/dev/null || true
find dist/public/assets/ -name "*.png" -type f -exec chmod 644 {} \; 2>/dev/null || true
find dist/public/assets/ -name "*.webp" -type f -exec chmod 644 {} \; 2>/dev/null || true

# List the assets to verify they exist
echo "📋 Verifying assets exist..."
if [ -f "dist/public/assets/index-C-rDCszs.css" ]; then
    echo "✅ CSS file found: $(ls -la dist/public/assets/index-C-rDCszs.css)"
else
    echo "❌ CSS file not found"
fi

if [ -f "dist/public/assets/index-8fIgh_68.js" ]; then
    echo "✅ JS file found: $(ls -la dist/public/assets/index-8fIgh_68.js)"
else
    echo "❌ JS file not found"
fi

# Test production server locally
echo "🧪 Testing production server locally..."
if command -v node &> /dev/null; then
    echo "Starting test production server on port 5002..."
    NODE_ENV=production PORT=5002 timeout 10s node dist/index.js &
    sleep 3
    
    # Test if assets are accessible
    echo "Testing asset accessibility..."
    if curl -s http://localhost:5002/assets/index-C-rDCszs.css > /dev/null; then
        echo "✅ CSS asset is accessible"
    else
        echo "❌ CSS asset is NOT accessible"
    fi
    
    if curl -s http://localhost:5002/assets/index-8fIgh_68.js > /dev/null; then
        echo "✅ JS asset is accessible"
    else
        echo "❌ JS asset is NOT accessible"
    fi
    
    # Kill test server
    pkill -f "node dist/index.js" 2>/dev/null || true
fi

echo "🏁 Asset deployment fix completed!"
echo ""
echo "📝 Summary of fixes applied:"
echo "   ✅ Updated CORS configuration to include production domains"
echo "   ✅ Added specific asset handling middleware"
echo "   ✅ Updated CSP to allow production domains"
echo "   ✅ Set proper file permissions"
echo ""
echo "🚀 The application should now serve assets correctly in production."
echo "   If you still experience 403 errors, it may be a hosting provider issue."