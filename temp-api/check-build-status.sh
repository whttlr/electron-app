#!/bin/bash

echo "🔍 Checking Mac build status..."

cd ../electron-app

echo "📂 Checking for build outputs..."

if [ -d "dist-electron" ]; then
    echo "✅ dist-electron directory exists"
    echo "📁 Contents of dist-electron:"
    ls -la dist-electron/
    
    if [ -d "dist-electron/mac" ]; then
        echo "🍎 Mac build directory found!"
        echo "📦 Mac build contents:"
        ls -la dist-electron/mac/
    fi
    
    # Look for DMG file
    if ls dist-electron/*.dmg 1> /dev/null 2>&1; then
        echo "🎉 DMG file found!"
        ls -la dist-electron/*.dmg
    else
        echo "⚠️  No DMG file found yet"
    fi
    
else
    echo "❌ dist-electron directory not found - build may have failed or still running"
fi

# Check if there are any running processes
if pgrep -f "electron-builder" > /dev/null; then
    echo "🔄 electron-builder is still running..."
else
    echo "🛑 No electron-builder processes found"
fi