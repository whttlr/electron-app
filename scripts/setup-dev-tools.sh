#!/bin/bash

# CNC Jog Controls Plugin Development Tools Setup Script
# This script sets up the plugin development tools for local development

set -e

echo "🚀 Setting up CNC Jog Controls Plugin Development Tools..."
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo_error "Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if ! npx semver -r ">=$REQUIRED_VERSION" "$NODE_VERSION" &> /dev/null; then
    echo_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18 or later."
    exit 1
fi

echo_success "Node.js version $NODE_VERSION is compatible"

# Setup Plugin CLI
echo_status "Setting up Plugin CLI..."
cd "$PROJECT_ROOT/tools/plugin-cli"

echo_status "Installing dependencies..."
npm install

echo_status "Building CLI..."
npm run build

echo_status "Linking CLI globally..."
npm link

echo_success "Plugin CLI installed globally as 'cnc-plugin'"

# Setup Marketplace Client
echo_status "Setting up Marketplace Client..."
cd "$PROJECT_ROOT/tools/marketplace-client"

echo_status "Installing dependencies..."
npm install

echo_status "Building Marketplace Client..."
npm run build

echo_status "Linking Marketplace Client globally..."
npm link

echo_success "Marketplace Client installed globally as 'cnc-marketplace'"

# Setup API Docs Generator
echo_status "Setting up API Documentation Generator..."
cd "$PROJECT_ROOT/tools/api-docs-generator"

echo_status "Installing dependencies..."
npm install

echo_status "Building API Docs Generator..."
npm run build

echo_status "Linking API Docs Generator globally..."
npm link

echo_success "API Docs Generator installed globally as 'cnc-api-docs'"

# Test installations
echo ""
echo_status "Testing installations..."

echo_status "Testing Plugin CLI..."
if cnc-plugin --version &> /dev/null; then
    echo_success "Plugin CLI working: $(cnc-plugin --version)"
else
    echo_error "Plugin CLI test failed"
fi

echo_status "Testing Marketplace Client..."
if cnc-marketplace --version &> /dev/null; then
    echo_success "Marketplace Client working: $(cnc-marketplace --version)"
else
    echo_error "Marketplace Client test failed"
fi

echo_status "Testing API Docs Generator..."
if cnc-api-docs --version &> /dev/null; then
    echo_success "API Docs Generator working: $(cnc-api-docs --version)"
else
    echo_error "API Docs Generator test failed"
fi

echo ""
echo_success "🎉 Plugin Development Tools setup complete!"
echo ""
echo "Available commands:"
echo "  ${BLUE}cnc-plugin${NC}      - Create and manage plugins"
echo "  ${BLUE}cnc-marketplace${NC} - Install and publish plugins"
echo "  ${BLUE}cnc-api-docs${NC}    - Generate API documentation"
echo ""
echo "Quick start:"
echo "  ${YELLOW}cnc-plugin create my-first-plugin${NC}"
echo "  ${YELLOW}cnc-marketplace search machine-control${NC}"
echo "  ${YELLOW}cnc-api-docs generate src --output docs/api${NC}"
echo ""
echo "For more information:"
echo "  ${BLUE}cnc-plugin --help${NC}"
echo "  ${BLUE}cnc-marketplace --help${NC}"
echo "  ${BLUE}cnc-api-docs --help${NC}"
echo ""
echo_success "Happy plugin development! 🛠️"