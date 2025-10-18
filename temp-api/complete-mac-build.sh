#!/bin/bash

echo "🚀 Completing Mac Build with API Integration..."

cd ../electron-app

# Clean old DMG files to avoid confusion
echo "🧹 Cleaning old DMG files..."
rm -f dist-electron/*.dmg
rm -f dist-electron/*.blockmap

# Run the final electron-builder step
echo "📦 Running electron-builder for Mac..."
npx electron-builder --mac --publish=never

# Check results
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    
    echo "📊 Build Results:"
    ls -la dist-electron/*.dmg 2>/dev/null || echo "No DMG files found"
    
    echo "📁 Mac app bundle:"
    ls -la dist-electron/mac/ 2>/dev/null || echo "No Mac bundle found"
    
    echo "💾 File sizes:"
    if ls dist-electron/*.dmg 1> /dev/null 2>&1; then
        du -h dist-electron/*.dmg
    fi
    
else
    echo "❌ Build failed!"
    echo "📝 Check the error messages above"
    exit 1
fi