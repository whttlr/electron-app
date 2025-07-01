#!/bin/bash

# CNC Jog Controls Plugin Development Tools Setup Script (Fixed Version)
# This script sets up the plugin development tools with dependency fixes

set -e

echo "🚀 Setting up CNC Jog Controls Plugin Development Tools (Fixed Version)..."
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
echo_success "Node.js version $NODE_VERSION found"

setup_tool() {
    local tool_name=$1
    local tool_dir=$2
    local command_name=$3
    
    echo_status "Setting up $tool_name..."
    cd "$PROJECT_ROOT/tools/$tool_dir"
    
    # Clean install to avoid dependency conflicts
    if [ -d "node_modules" ]; then
        echo_status "Cleaning existing node_modules..."
        rm -rf node_modules package-lock.json
    fi
    
    echo_status "Installing dependencies..."
    npm install --no-package-lock
    
    echo_status "Building $tool_name..."
    if npm run build; then
        echo_success "$tool_name built successfully"
    else
        echo_error "Failed to build $tool_name"
        return 1
    fi
    
    echo_status "Linking $tool_name globally..."
    if npm link; then
        echo_success "$tool_name linked as '$command_name'"
    else
        echo_warning "Failed to link $tool_name globally, but build succeeded"
    fi
}

# Setup Plugin CLI
if ! setup_tool "Plugin CLI" "plugin-cli" "cnc-plugin"; then
    echo_error "Plugin CLI setup failed"
    exit 1
fi

# Setup Marketplace Client
if ! setup_tool "Marketplace Client" "marketplace-client" "cnc-marketplace"; then
    echo_error "Marketplace Client setup failed"  
    exit 1
fi

# Setup API Docs Generator
if ! setup_tool "API Docs Generator" "api-docs-generator" "cnc-api-docs"; then
    echo_error "API Docs Generator setup failed"
    exit 1
fi

# Test installations
echo ""
echo_status "Testing installations..."

test_command() {
    local cmd=$1
    local name=$2
    
    if command -v "$cmd" &> /dev/null; then
        if version_output=$("$cmd" --version 2>/dev/null); then
            echo_success "$name working: $version_output"
            return 0
        else
            echo_warning "$name installed but version check failed"
            return 1
        fi
    else
        echo_error "$name not found in PATH"
        return 1
    fi
}

# Test each command
test_command "cnc-plugin" "Plugin CLI"
test_command "cnc-marketplace" "Marketplace Client" 
test_command "cnc-api-docs" "API Docs Generator"

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
echo "  ${YELLOW}cd my-first-plugin${NC}"
echo "  ${YELLOW}cnc-plugin dev${NC}"
echo ""
echo "If commands are not found, try:"
echo "  ${YELLOW}export PATH=\"\$(npm config get prefix)/bin:\$PATH\"${NC}"
echo "  ${YELLOW}source ~/.bashrc${NC}"
echo ""
echo_success "Happy plugin development! 🛠️"