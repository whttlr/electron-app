#!/bin/bash

echo "🚀 Starting Mac Electron Build Process..."

# Navigate to electron app directory
cd ../electron-app

echo "📍 Current directory: $(pwd)"

# Check if we have the necessary files
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in electron-app directory"
    exit 1
fi

echo "📦 Running npm run electron:build:mac..."

# Run the build
npm run electron:build:mac

# Check build result
if [ $? -eq 0 ]; then
    echo "✅ Mac build completed successfully!"
    echo "📁 Build output should be in dist-electron/"
    ls -la dist-electron/ 2>/dev/null || echo "⚠️  dist-electron directory not found"
else
    echo "❌ Mac build failed!"
    exit 1
fi