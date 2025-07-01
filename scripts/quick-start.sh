#!/bin/bash

# Quick Start Plugin Development - No Complex Setup Required
# This creates working plugin development without any compilation

set -e

echo "🚀 Quick Start Plugin Development Setup"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo_note() {
    echo -e "${YELLOW}📝 $1${NC}"
}

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

echo_success "Node.js $(node --version) found"

# Create plugins workspace
PLUGINS_DIR="$PROJECT_ROOT/my-plugins"
mkdir -p "$PLUGINS_DIR"

echo_info "Created plugins workspace: $PLUGINS_DIR"

# Create a simple plugin creation function
cat > "$PROJECT_ROOT/create-plugin.sh" << 'EOF'
#!/bin/bash

# Simple Plugin Creator
if [ -z "$1" ]; then
    echo "Usage: ./create-plugin.sh <plugin-name>"
    echo "Example: ./create-plugin.sh my-awesome-plugin"
    exit 1
fi

PLUGIN_NAME="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGINS_DIR="$SCRIPT_DIR/my-plugins"
PLUGIN_DIR="$PLUGINS_DIR/$PLUGIN_NAME"

if [ -d "$PLUGIN_DIR" ]; then
    echo "❌ Plugin '$PLUGIN_NAME' already exists!"
    exit 1
fi

echo "🚀 Creating plugin: $PLUGIN_NAME"

mkdir -p "$PLUGIN_DIR"
cd "$PLUGIN_DIR"

# Create package.json
cat > package.json << EOL
{
  "name": "$PLUGIN_NAME",
  "version": "1.0.0",
  "description": "A CNC Jog Controls plugin",
  "main": "src/index.js",
  "scripts": {
    "dev": "echo 'Open src/index.js to start developing!'",
    "build": "echo 'Plugin ready for use'"
  },
  "cncPlugin": {
    "apiVersion": "1.0.0",
    "category": "utility",
    "displayName": "$(echo $PLUGIN_NAME | sed 's/-/ /g' | sed 's/\b\w/\U&/g')",
    "description": "A custom CNC plugin",
    "permissions": ["machine.status.read"],
    "ui": {
      "placement": "dashboard",
      "screen": "main",
      "size": {
        "width": 12,
        "height": "auto"
      },
      "priority": 100
    }
  },
  "keywords": ["cnc", "plugin", "machining"],
  "author": "Your Name",
  "license": "MIT"
}
EOL

# Create basic src structure
mkdir -p src

# Create main plugin file
cat > src/index.js << 'EOL'
/**
 * CNC Jog Controls Plugin
 * 
 * This is a basic plugin template. You can modify this file to add your
 * custom functionality to the CNC Jog Controls application.
 */

class __PLUGIN_NAME_CLASS__ {
  constructor(api) {
    this.api = api;
    this.name = '__PLUGIN_NAME__';
  }

  // Called when the plugin is loaded
  async initialize() {
    console.log(`${this.name} plugin initializing...`);
    
    // Register any commands or event listeners here
    this.api.events.on('machine.status.update', this.handleStatusUpdate.bind(this));
    
    console.log(`${this.name} plugin initialized successfully!`);
  }

  // Called when the plugin UI should be mounted
  async mount(container) {
    container.innerHTML = `
      <div style="padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <h2>${this.name} Plugin</h2>
        <p>This is a basic plugin template.</p>
        <p>Edit <code>src/index.js</code> to customize this plugin.</p>
        <button onclick="alert('Hello from ${this.name}!')">Test Button</button>
      </div>
    `;
  }

  // Called when the plugin should be unmounted
  async unmount() {
    console.log(`${this.name} plugin unmounted`);
  }

  // Example event handler
  handleStatusUpdate(data) {
    console.log(`${this.name} received status update:`, data);
  }

  // Called when the plugin is being destroyed
  async destroy() {
    console.log(`${this.name} plugin destroyed`);
  }
}

// Export the plugin class
// Always export to window for browser compatibility
if (typeof window !== 'undefined') {
  window.__PLUGIN_NAME_CLASS__ = __PLUGIN_NAME_CLASS__;
}

// Also support CommonJS if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = __PLUGIN_NAME_CLASS__;
}
EOL

# Replace placeholders in the plugin file
PLUGIN_CLASS_NAME=$(echo "$PLUGIN_NAME" | sed 's/-//g' | sed 's/\b\w/\U&/g')
sed -i '' "s/__PLUGIN_NAME_CLASS__/${PLUGIN_CLASS_NAME}Plugin/g" src/index.js
sed -i '' "s/__PLUGIN_NAME__/$PLUGIN_NAME/g" src/index.js

# Create README
cat > README.md << EOL
# $PLUGIN_NAME

A CNC Jog Controls plugin.

## Description

This plugin was created using the quick start template. You can modify the files to add your custom functionality.

## Files

- \`src/index.js\` - Main plugin file
- \`package.json\` - Plugin configuration
- \`README.md\` - This file

## Development

1. Edit \`src/index.js\` to add your functionality
2. Test your plugin by loading it in CNC Jog Controls
3. Check the browser console for any errors

## Plugin API

Your plugin has access to the CNC Jog Controls API through the \`api\` parameter:

- \`api.events\` - Listen to machine events
- \`api.machine\` - Access machine controls
- \`api.logger\` - Log messages
- \`api.storage\` - Store plugin data

## Next Steps

- Read the plugin documentation in \`docs/plugins/\`
- Look at example plugins in \`examples/plugins/\`
- Join the community for help and tips

Happy coding!
EOL

echo "✅ Plugin '$PLUGIN_NAME' created successfully!"
echo ""
echo "Location: $PLUGIN_DIR"
echo ""
echo "Next steps:"
echo "  cd my-plugins/$PLUGIN_NAME"
echo "  open src/index.js"
echo ""
echo "Edit src/index.js to customize your plugin!"
EOF

chmod +x "$PROJECT_ROOT/create-plugin.sh"

echo_success "Plugin creator ready!"
echo ""
echo "🎯 Quick Start Instructions:"
echo ""
echo "1. Create your first plugin:"
echo "   ${YELLOW}./create-plugin.sh my-awesome-plugin${NC}"
echo ""
echo "2. Edit your plugin:"
echo "   ${YELLOW}cd my-plugins/my-awesome-plugin${NC}"
echo "   ${YELLOW}open src/index.js${NC}"
echo ""
echo "3. View examples:"
echo "   ${YELLOW}ls examples/plugins/${NC}"
echo ""
echo "4. Read documentation:"
echo "   ${YELLOW}open docs/plugins/README.md${NC}"
echo ""
echo_note "This approach bypasses all compilation issues and gets you"
echo_note "started with plugin development immediately!"
echo ""
echo_success "Ready to create plugins! 🛠️"