#!/bin/bash

# Manual Setup Script - Bypass dependency issues and use direct execution
# This creates shell aliases that work without global npm linking

set -e

echo "🚀 Setting up CNC Plugin Development Tools (Manual Method)..."
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//')
echo_success "Node.js version $NODE_VERSION found"

# Create a bin directory for our scripts
BIN_DIR="$PROJECT_ROOT/bin"
mkdir -p "$BIN_DIR"

echo_status "Creating executable scripts..."

# Create cnc-plugin script
cat > "$BIN_DIR/cnc-plugin" << 'EOF'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT/tools/plugin-cli"
npx ts-node src/cli.ts "$@"
EOF

# Create cnc-marketplace script  
cat > "$BIN_DIR/cnc-marketplace" << 'EOF'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT/tools/marketplace-client"
npx ts-node src/cli.ts "$@"
EOF

# Create cnc-api-docs script
cat > "$BIN_DIR/cnc-api-docs" << 'EOF'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT/tools/api-docs-generator"
npx ts-node src/cli.ts "$@"
EOF

# Make scripts executable
chmod +x "$BIN_DIR"/*

echo_success "Created executable scripts in $BIN_DIR"

# Install basic dependencies for each tool
echo_status "Installing basic dependencies..."

install_deps() {
    local tool_dir=$1
    local tool_name=$2
    
    echo_status "Installing dependencies for $tool_name..."
    cd "$PROJECT_ROOT/tools/$tool_dir"
    
    # Install only essential dependencies
    npm install --no-package-lock \
        commander \
        chalk \
        fs-extra \
        typescript \
        ts-node \
        "@types/node" || true
        
    echo_success "$tool_name dependencies installed"
}

install_deps "plugin-cli" "Plugin CLI"
install_deps "marketplace-client" "Marketplace Client" 
install_deps "api-docs-generator" "API Docs Generator"

# Add to PATH instructions
echo ""
echo_success "🎉 Manual setup complete!"
echo ""
echo "To use the tools, either:"
echo ""
echo "Option 1: Add to your PATH"
echo "  ${YELLOW}export PATH=\"$BIN_DIR:\$PATH\"${NC}"
echo "  ${YELLOW}echo 'export PATH=\"$BIN_DIR:\$PATH\"' >> ~/.bashrc${NC}"
echo "  ${YELLOW}source ~/.bashrc${NC}"
echo ""
echo "Option 2: Use full path"
echo "  ${YELLOW}$BIN_DIR/cnc-plugin create my-plugin${NC}"
echo "  ${YELLOW}$BIN_DIR/cnc-marketplace search visualization${NC}"
echo "  ${YELLOW}$BIN_DIR/cnc-api-docs generate src${NC}"
echo ""
echo "Option 3: Create aliases"
echo "  ${YELLOW}alias cnc-plugin='$BIN_DIR/cnc-plugin'${NC}"
echo "  ${YELLOW}alias cnc-marketplace='$BIN_DIR/cnc-marketplace'${NC}"
echo "  ${YELLOW}alias cnc-api-docs='$BIN_DIR/cnc-api-docs'${NC}"
echo ""

# Test if we can add to PATH automatically
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo_warning "Adding $BIN_DIR to PATH for this session..."
    export PATH="$BIN_DIR:$PATH"
    
    # Test the commands
    echo_status "Testing commands..."
    if "$BIN_DIR/cnc-plugin" --help >/dev/null 2>&1; then
        echo_success "cnc-plugin working"
    else
        echo_warning "cnc-plugin may need dependencies"
    fi
fi

echo ""
echo_success "Ready to create plugins! Try:"
echo "  ${YELLOW}cnc-plugin create my-first-plugin${NC}"
echo ""