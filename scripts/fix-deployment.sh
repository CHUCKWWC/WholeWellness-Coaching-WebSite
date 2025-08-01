#!/bin/bash

echo "🚀 Fixing deployment white screen issue..."

# Ensure the server/public directory exists
mkdir -p server/public

# Copy the built frontend files to the expected location
if [ -d "dist/public" ]; then
    echo "📁 Copying built files from dist/public/ to server/public/"
    cp -r dist/public/* server/public/
    echo "✅ Frontend files copied successfully"
    
    # List the files that were copied
    echo "📋 Files now in server/public/:"
    ls -la server/public/
else
    echo "❌ dist/public/ directory not found. Please run 'npm run build' first."
    exit 1
fi

echo "🎉 Deployment fix complete! The white screen issue should be resolved."