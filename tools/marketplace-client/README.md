# CNC Marketplace Client

A comprehensive client library and CLI tool for the CNC Jog Controls plugin marketplace. This tool enables developers to search, install, publish, and manage CNC plugins with ease.

## Features

- 🔍 **Plugin Search & Discovery** - Find plugins by name, category, tags, and author
- 📦 **Package Management** - Install, update, and uninstall plugins with dependency resolution
- 🚀 **Publishing Tools** - Publish and manage your plugins in the marketplace
- 🔐 **Authentication** - Secure login with token-based authentication
- ⚙️ **Configuration Management** - Flexible configuration with profiles and environments
- 📊 **Rich CLI Interface** - Beautiful tables, progress bars, and colored output
- 🔧 **TypeScript Support** - Full TypeScript definitions for library usage

## Installation

### Global Installation (CLI)

```bash
npm install -g @cnc-jog-controls/marketplace-client
```

### Library Installation

```bash
npm install @cnc-jog-controls/marketplace-client
```

## CLI Usage

### Authentication

```bash
# Login to marketplace
cnc-marketplace login

# Login with token
cnc-marketplace login --token YOUR_TOKEN

# Check current user
cnc-marketplace whoami

# Logout
cnc-marketplace logout
```

### Search and Discovery

```bash
# Search for plugins
cnc-marketplace search "machine control"

# Search with filters
cnc-marketplace search "visualization" --category visualization --limit 10

# Get plugin information
cnc-marketplace info awesome-plugin

# List installed plugins
cnc-marketplace list
cnc-marketplace list --outdated
```

### Installation Management

```bash
# Install a plugin
cnc-marketplace install awesome-plugin

# Install specific version
cnc-marketplace install awesome-plugin --version 1.2.0

# Install globally
cnc-marketplace install awesome-plugin --global

# Uninstall plugin
cnc-marketplace uninstall old-plugin

# Update plugins
cnc-marketplace update awesome-plugin
cnc-marketplace update --all
```

### Publishing

```bash
# Publish current directory
cnc-marketplace publish

# Publish with tag
cnc-marketplace publish --tag beta

# Dry run (test without publishing)
cnc-marketplace publish --dry-run

# Unpublish plugin
cnc-marketplace unpublish my-plugin --version 1.0.0

# Deprecate plugin
cnc-marketplace deprecate my-plugin --message "Use v2.0.0 instead"
```

### Configuration

```bash
# View configuration
cnc-marketplace config list

# Set configuration
cnc-marketplace config set registry.defaultUrl https://my-registry.com

# Reset to defaults
cnc-marketplace config reset
```

### Utilities

```bash
# Run diagnostics
cnc-marketplace doctor

# Clear cache
cnc-marketplace cache clear

# Show examples
cnc-marketplace examples
```

## Library Usage

### Basic Usage

```typescript
import { CNCMarketplace } from '@cnc-jog-controls/marketplace-client'

const marketplace = new CNCMarketplace({
  registryUrl: 'https://registry.cnc-jog-controls.com',
  logLevel: 'info'
})

await marketplace.initialize()

// Search for plugins
const results = await marketplace.searchPlugins('machine control', 10)
console.log(`Found ${results.total} plugins`)

// Install a plugin
await marketplace.installPlugin('awesome-cnc-plugin', '1.0.0')

// Check authentication status
if (await marketplace.isAuthenticated()) {
  // Publish a plugin
  await marketplace.publishPlugin('./my-plugin')
}
```

### Advanced Usage

```typescript
import { 
  MarketplaceClient,
  SearchManager,
  PackageManager,
  AuthManager 
} from '@cnc-jog-controls/marketplace-client'

// Use individual components
const client = new MarketplaceClient()
const searchManager = new SearchManager()
const packageManager = new PackageManager()
const authManager = new AuthManager()

// Advanced search
const searchResults = await searchManager.search('visualization', {
  category: 'visualization',
  tags: ['3d', 'graphics'],
  minRating: 4.0,
  sort: 'rating',
  limit: 20
})

// Get plugin details
const pluginInfo = await client.getPluginInfo('awesome-plugin')
console.log(`Plugin: ${pluginInfo.name} v${pluginInfo.version}`)
console.log(`Downloads: ${pluginInfo.downloads}`)
console.log(`Rating: ${pluginInfo.rating}/5`)

// Install with options
await packageManager.install('awesome-plugin', {
  version: '1.0.0',
  global: false,
  force: true
})

// List installed plugins
const installed = await packageManager.listInstalled({
  outdatedOnly: true
})

installed.forEach(plugin => {
  console.log(`${plugin.name}: ${plugin.version} → ${plugin.latestVersion}`)
})
```

### Authentication

```typescript
import { AuthManager } from '@cnc-jog-controls/marketplace-client'

const authManager = new AuthManager()

// Interactive login
await authManager.interactiveLogin()

// Token-based login
await authManager.loginWithToken('your-auth-token')

// Get current user
const user = await authManager.getCurrentUser()
if (user) {
  console.log(`Logged in as ${user.username}`)
}
```

### Publishing

```typescript
import { PublishManager } from '@cnc-jog-controls/marketplace-client'

const publishManager = new PublishManager()

// Publish plugin
await publishManager.publish('./my-plugin', {
  tag: 'latest',
  public: true,
  dryRun: false
})

// Deprecate old version
await publishManager.deprecate('my-plugin', {
  version: '1.0.0',
  message: 'Please upgrade to v2.0.0'
})
```

## Plugin Development

### Plugin Structure

Your plugin should have the following structure:

```
my-plugin/
├── package.json          # Plugin manifest
├── README.md            # Plugin documentation
├── LICENSE              # License file
├── src/                 # Source code
│   ├── index.ts         # Main entry point
│   └── components/      # Plugin components
├── dist/                # Built files
└── assets/              # Static assets
```

### Package.json Example

```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "An awesome CNC plugin",
  "main": "dist/index.js",
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "keywords": ["cnc", "machine-control", "awesome"],
  "cncPlugin": {
    "apiVersion": "1.0.0",
    "category": "machine-control",
    "permissions": ["machine.control", "file.read"],
    "displayName": "My Awesome Plugin",
    "icon": "assets/icon.png"
  },
  "dependencies": {
    "@cnc-jog-controls/plugin-api": "^1.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Configuration

The marketplace client uses a hierarchical configuration system:

1. Default configuration
2. Global configuration file (`~/.cnc-marketplace/config.json`)
3. Environment variables
4. Command line options

### Configuration Options

```json
{
  "registry": {
    "defaultUrl": "https://registry.cnc-jog-controls.com",
    "timeout": 30000,
    "retries": 3
  },
  "auth": {
    "tokenStorage": "file",
    "sessionTimeout": 86400000,
    "autoRefresh": true
  },
  "package": {
    "defaultAccess": "public",
    "maxPackageSize": 52428800,
    "validateBeforePublish": true
  },
  "ui": {
    "outputFormat": "table",
    "colorOutput": true,
    "progressBars": true
  }
}
```

## Environment Variables

- `CNC_REGISTRY_URL` - Override default registry URL
- `CNC_AUTH_TOKEN` - Set authentication token
- `CNC_LOG_LEVEL` - Set logging level (debug, info, warn, error)
- `CNC_CONFIG_DIR` - Override configuration directory

## API Reference

### MarketplaceClient

Main client for interacting with the marketplace API.

#### Methods

- `getPluginInfo(name, version?)` - Get detailed plugin information
- `searchPlugins(query, options)` - Search for plugins
- `getDownloadUrl(name, version?)` - Get plugin download URL
- `publishPlugin(packageData, options)` - Publish a plugin
- `unpublishPlugin(name, version?)` - Unpublish a plugin

### PackageManager

Manages plugin installation and local package operations.

#### Methods

- `install(name, options)` - Install a plugin
- `uninstall(name, options)` - Uninstall a plugin
- `listInstalled(options)` - List installed plugins
- `updateAll(options)` - Update all plugins

### SearchManager

Provides advanced search and discovery capabilities.

#### Methods

- `search(query, options)` - Search with filters
- `getPopular(limit)` - Get popular plugins
- `getByCategory(category, options)` - Get plugins by category
- `getSuggestions(query, limit)` - Get search suggestions

### AuthManager

Handles authentication and user management.

#### Methods

- `interactiveLogin(username?, registry?)` - Interactive login flow
- `loginWithToken(token, registry?)` - Login with token
- `logout(registry?)` - Logout from registry
- `getCurrentUser(registry?)` - Get current user info
- `isAuthenticated(registry?)` - Check authentication status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Development Setup

```bash
git clone https://github.com/cnc-jog-controls/marketplace-client.git
cd marketplace-client
npm install
npm run build
npm link

# Test CLI locally
cnc-marketplace --help
```

### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://docs.cnc-jog-controls.com/marketplace/)
- 🐛 [Issues](https://github.com/cnc-jog-controls/marketplace-client/issues)
- 💬 [Discussions](https://github.com/cnc-jog-controls/marketplace-client/discussions)
- 📧 [Email Support](mailto:support@cnc-jog-controls.com)