#!/bin/bash

# Simple Plugin Development Tools Setup
# This creates working commands without complex builds or global installs

set -e

echo "🚀 Setting up CNC Plugin Development Tools (Simple Method)..."
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

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

NODE_VERSION=$(node --version)
echo_success "Node.js $NODE_VERSION found"

# Create a bin directory
BIN_DIR="$PROJECT_ROOT/bin"
mkdir -p "$BIN_DIR"

echo_status "Creating plugin development commands..."

# Create cnc-plugin wrapper
cat > "$BIN_DIR/cnc-plugin" << 'EOF'
#!/bin/bash
# CNC Plugin CLI Wrapper

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PLUGIN_CLI_DIR="$PROJECT_ROOT/tools/plugin-cli"

# Ensure we're in the right directory
cd "$PLUGIN_CLI_DIR"

# Install minimal dependencies if not present
if [ ! -d "node_modules" ]; then
    echo "Installing CLI dependencies..."
    npm install --no-package-lock commander chalk inquirer fs-extra typescript ts-node @types/node >/dev/null 2>&1
fi

# Command handling
case "$1" in
    "create")
        echo "🚀 Creating new plugin: $2"
        mkdir -p "$2"
        cd "$2"
        
        # Copy from basic template
        if [ -d "$PROJECT_ROOT/examples/plugins/machine-status-monitor" ]; then
            echo "📋 Copying from example template..."
            cp -r "$PROJECT_ROOT/examples/plugins/machine-status-monitor/"* .
            
            # Update package.json name
            if [ -f "package.json" ]; then
                sed -i '' "s/machine-status-monitor/$2/g" package.json
                sed -i '' "s/Machine Status Monitor/$(echo $2 | sed 's/-/ /g')/g" package.json
            fi
            
            echo "✅ Plugin '$2' created successfully!"
            echo ""
            echo "Next steps:"
            echo "  cd $2"
            echo "  npm install"
            echo "  npm run dev"
        else
            echo "❌ Template not found. Creating basic structure..."
            # Create basic package.json
            cat > package.json << EOL
{
  "name": "$2",
  "version": "1.0.0",
  "description": "A CNC Jog Controls plugin",
  "main": "dist/index.js",
  "scripts": {
    "dev": "echo 'Development server not set up yet'",
    "build": "echo 'Build not set up yet'"
  },
  "cncPlugin": {
    "apiVersion": "1.0.0",
    "category": "utility",
    "displayName": "$(echo $2 | sed 's/-/ /g')",
    "permissions": []
  }
}
EOL
            echo "✅ Basic plugin '$2' created!"
        fi
        ;;
    "dev")
        echo "🔧 Starting development server..."
        echo "This would start a development server for your plugin"
        echo "For now, you can use: npm run dev"
        ;;
    "build")
        echo "📦 Building plugin..."
        echo "This would build your plugin for production"
        echo "For now, you can use: npm run build"
        ;;
    "--help"|"help"|"")
        echo "CNC Plugin CLI"
        echo ""
        echo "Usage:"
        echo "  cnc-plugin create <name>    Create a new plugin"
        echo "  cnc-plugin dev              Start development server"
        echo "  cnc-plugin build            Build plugin for production"
        echo "  cnc-plugin --help           Show this help"
        echo ""
        echo "Examples:"
        echo "  cnc-plugin create my-awesome-plugin"
        echo "  cnc-plugin dev"
        echo ""
        ;;
    "--version"|"version")
        echo "cnc-plugin v1.0.0"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use 'cnc-plugin --help' for usage information"
        exit 1
        ;;
esac
EOF

# Create cnc-marketplace wrapper
cat > "$BIN_DIR/cnc-marketplace" << 'EOF'
#!/bin/bash
# CNC Marketplace CLI Wrapper

case "$1" in
    "search")
        echo "🔍 Searching marketplace for: $2"
        echo "This would search the plugin marketplace"
        echo "Marketplace functionality coming soon!"
        ;;
    "install")
        echo "📦 Installing plugin: $2"
        echo "This would install a plugin from the marketplace"
        echo "For now, you can copy plugins manually from examples/"
        ;;
    "publish")
        echo "🚀 Publishing plugin to marketplace..."
        echo "This would publish your plugin to the marketplace"
        echo "Publishing functionality coming soon!"
        ;;
    "--help"|"help"|"")
        echo "CNC Marketplace CLI"
        echo ""
        echo "Usage:"
        echo "  cnc-marketplace search <query>     Search for plugins"
        echo "  cnc-marketplace install <plugin>   Install a plugin"
        echo "  cnc-marketplace publish            Publish your plugin"
        echo "  cnc-marketplace --help             Show this help"
        echo ""
        ;;
    "--version"|"version")
        echo "cnc-marketplace v1.0.0"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use 'cnc-marketplace --help' for usage information"
        exit 1
        ;;
esac
EOF

# Create cnc-api-docs wrapper
cat > "$BIN_DIR/cnc-api-docs" << 'EOF'
#!/bin/bash
# CNC API Docs CLI Wrapper

case "$1" in
    "generate")
        echo "📖 Generating API documentation from: $2"
        echo "This would generate API documentation"
        echo "For now, check the docs/ directory for existing documentation"
        ;;
    "serve")
        echo "🌐 Serving documentation from: $2"
        echo "This would serve documentation locally"
        echo "You can open the HTML files directly in your browser"
        ;;
    "--help"|"help"|"")
        echo "CNC API Documentation Generator"
        echo ""
        echo "Usage:"
        echo "  cnc-api-docs generate <source>    Generate API docs from source"
        echo "  cnc-api-docs serve <docs>         Serve documentation locally"
        echo "  cnc-api-docs --help               Show this help"
        echo ""
        ;;
    "--version"|"version")
        echo "cnc-api-docs v1.0.0"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use 'cnc-api-docs --help' for usage information"
        exit 1
        ;;
esac
EOF

# Make scripts executable
chmod +x "$BIN_DIR"/*

echo_success "Created simple CLI tools in $BIN_DIR"

# Add to PATH for current session
export PATH="$BIN_DIR:$PATH"

echo ""
echo_success "🎉 Simple setup complete!"
echo ""
echo "To use the tools:"
echo ""
echo "1. Add to your PATH:"
echo "   ${YELLOW}export PATH=\"$BIN_DIR:\$PATH\"${NC}"
echo "   ${YELLOW}echo 'export PATH=\"$BIN_DIR:\$PATH\"' >> ~/.bashrc${NC}"
echo "   ${YELLOW}source ~/.bashrc${NC}"
echo ""
echo "2. Or use full paths:"
echo "   ${YELLOW}$BIN_DIR/cnc-plugin create my-plugin${NC}"
echo ""
echo "3. Test the commands:"
echo "   ${YELLOW}cnc-plugin --help${NC}"
echo "   ${YELLOW}cnc-marketplace --help${NC}"
echo "   ${YELLOW}cnc-api-docs --help${NC}"
echo ""
echo "Quick start:"
echo "   ${YELLOW}cnc-plugin create my-first-plugin${NC}"
echo "   ${YELLOW}cd my-first-plugin${NC}"
echo "   ${YELLOW}npm install${NC}"
echo ""
echo_success "Happy plugin development! 🛠️"
echo ""
echo "Note: This is a simplified version. The commands create basic"
echo "plugin structures and provide helpful guidance. For advanced"
echo "features, see the examples/ directory."