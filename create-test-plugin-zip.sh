#!/bin/bash

# Create a properly structured plugin ZIP for testing the upload system

echo "🔧 Creating test plugin ZIP..."

# Create a temporary directory with correct structure
TEMP_DIR="temp-plugin"
mkdir -p "$TEMP_DIR"

# Copy plugin files with correct structure
cp "my-plugins/my-first-plugin/package.json" "$TEMP_DIR/"
cp "my-plugins/my-first-plugin/README.md" "$TEMP_DIR/"
mkdir -p "$TEMP_DIR/src"
cp "my-plugins/my-first-plugin/src/index.js" "$TEMP_DIR/src/"

# Create the ZIP file with correct structure (contents only, not the temp folder)
cd "$TEMP_DIR" && zip -r "../my-first-plugin-upload.zip" . && cd ..

# Clean up
rm -rf "$TEMP_DIR"

echo "✅ Created my-first-plugin-upload.zip"
echo ""
echo "📁 ZIP Contents:"
unzip -l "my-first-plugin-upload.zip"
echo ""
echo "🎯 Ready to test! Upload this ZIP file through the plugin upload system."