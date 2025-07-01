# Plugin Marketplace Integration

The CNC Jog Controls application includes a comprehensive UI-based plugin marketplace that replaces the deprecated CLI tools. This document outlines the marketplace features, registry integration, and plugin management capabilities.

> 📋 **Status**: ✅ **IMPLEMENTED** - Full UI-based marketplace with dependency resolution, version management, and registry publishing

## Overview

The marketplace integration provides a complete plugin ecosystem directly within the application UI, eliminating the need for external CLI tools and providing a better user experience with advanced features like dependency resolution, version management, and registry publishing.

### Key Features

- **Visual Plugin Discovery**: Browse plugins with rich metadata, screenshots, and ratings
- **Intelligent Installation**: Automatic dependency resolution with visual confirmation
- **Version Management**: Update checking, individual and bulk updates
- **Registry Integration**: Connect to multiple plugin registries for publishing and distribution
- **Import/Export**: Backup and restore plugin configurations
- **Visual Configuration**: Configure plugin placement and settings through forms
- **CLI Deprecation**: Complete replacement of CLI marketplace tools

## Architecture

### UI Components

```
src/views/Plugins/PluginsView.tsx
├── Local Plugins Tab
│   ├── Plugin Statistics & Actions
│   ├── Update Management System
│   ├── Import/Export Functionality
│   └── Enhanced Plugin List with Version Info
├── Marketplace Tab
│   ├── Search & Category Filtering
│   ├── Plugin Browse Interface with Rich Metadata
│   ├── Dependency Information Display
│   └── Installation Workflow with Conflict Resolution
└── Registry Tab (NEW)
    ├── Connection Management
    ├── Authentication & Credentials
    ├── Publishing Interface
    └── Registry Synchronization
```

### Service Layer

```
src/services/plugin/
├── PluginContext.tsx           # Enhanced React context with advanced features
├── index.ts                    # Public API exports
├── __tests__/                  # Comprehensive test suite
└── __mocks__/                  # Mock data for testing
```

### Enhanced Data Models

```typescript
interface Plugin {
  // Basic identification
  id: string;
  name: string;
  version: string;
  description: string;
  status: 'active' | 'inactive';
  type: 'utility' | 'visualization' | 'control' | 'productivity';
  
  // Version management (NEW)
  availableVersions?: string[];
  latestVersion?: string;
  updateAvailable?: boolean;
  
  // Dependencies (NEW)
  dependencies?: { [key: string]: string };
  
  // Installation metadata (NEW)
  installedAt?: string;
  updatedAt?: string;
  source?: 'local' | 'marketplace' | 'registry';
  checksum?: string;
  
  // Registry sync (NEW)
  registryId?: string;
  publisherId?: string;
  
  // Configuration
  config?: PluginConfig;
}

interface MarketplacePlugin {
  // Extended marketplace metadata
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  rating: number;
  downloads: number;
  tags: string[];
  category: string;
  lastUpdated: string;
  size: string;
  
  // Enhanced features (NEW)
  dependencies?: { [key: string]: string };
  changelog?: string;
  license?: string;
  verified?: boolean;
  homepage?: string;
  installed?: boolean;
}

interface RegistryConfig {
  url: string;
  username?: string;
  token?: string;
}
```

## Advanced Features Implementation

### 1. Version Management System

**Features:**
- Automatic update checking on tab load
- Visual indicators for available updates
- Individual plugin updates or bulk "Update All"
- Version history tracking
- Rollback capabilities

**Implementation:**
```typescript
const checkForUpdates = async (): Promise<PluginUpdate[]> => {
  const updates: PluginUpdate[] = [];
  
  for (const plugin of plugins) {
    if (plugin.source === 'marketplace' || plugin.source === 'registry') {
      // Check registry for latest version
      const latestVersion = await getLatestVersion(plugin.id);
      if (semver.gt(latestVersion, plugin.version)) {
        updates.push({
          pluginId: plugin.id,
          currentVersion: plugin.version,
          latestVersion,
          changelog: await getChangelog(plugin.id, latestVersion)
        });
      }
    }
  }
  
  return updates;
};
```

### 2. Dependency Resolution System

**Features:**
- Pre-installation dependency analysis
- Visual dependency tree display
- Automatic dependency installation
- Version conflict detection
- Circular dependency prevention

**Implementation:**
```typescript
const installMarketplacePlugin = async (marketplacePlugin: MarketplacePlugin) => {
  // Check dependencies before installation
  if (marketplacePlugin.dependencies) {
    const missingDeps = Object.keys(marketplacePlugin.dependencies)
      .filter(depId => !plugins.some(p => p.id === depId));

    if (missingDeps.length > 0) {
      // Show dependency confirmation modal
      Modal.confirm({
        title: 'Dependencies Required',
        content: (
          <div>
            <p>This plugin requires the following dependencies:</p>
            <ul>
              {Object.entries(marketplacePlugin.dependencies).map(([id, version]) => (
                <li key={id}>{id}@{version}</li>
              ))}
            </ul>
            <p>Would you like to install dependencies automatically?</p>
          </div>
        ),
        onOk: async () => {
          await installDependencies(newPlugin);
          // Continue with installation
        }
      });
    }
  }
};
```

### 3. Registry Integration System

**Features:**
- Multiple registry support
- Secure authentication
- Plugin publishing workflow
- Registry synchronization
- Connection status monitoring

**Implementation:**
```typescript
const publishToRegistry = async (pluginId: string): Promise<void> => {
  if (!registryConfig) throw new Error('Registry not configured');
  
  const plugin = plugins.find(p => p.id === pluginId);
  if (!plugin) throw new Error('Plugin not found');
  
  // Publish to registry with authentication
  const response = await fetch(`${registryConfig.url}/plugins`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${registryConfig.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      plugin: plugin,
      checksum: await calculateChecksum(plugin)
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to publish plugin');
  }
  
  // Update plugin source
  setPlugins(prev => prev.map(p => 
    p.id === pluginId 
      ? { ...p, source: 'registry', registryId: `reg-${pluginId}` }
      : p
  ));
};
```

### 4. Import/Export System

**Features:**
- JSON-based plugin backup
- Configuration preservation
- Batch plugin import
- Metadata validation

**Implementation:**
```typescript
const exportPlugins = async (): Promise<string> => {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    plugins: plugins.map(p => ({
      ...p,
      // Exclude runtime state
      status: undefined,
      updateAvailable: undefined
    }))
  };
  
  return JSON.stringify(exportData, null, 2);
};

const importPlugins = async (data: string): Promise<void> => {
  const importData = JSON.parse(data);
  
  if (!importData.version || !importData.plugins) {
    throw new Error('Invalid import format');
  }
  
  // Merge imported plugins with existing ones
  const importedPlugins = importData.plugins.map((p: any) => ({
    ...p,
    status: 'inactive', // Start imported plugins as inactive
    importedAt: new Date().toISOString()
  }));
  
  setPlugins(prev => [...prev, ...importedPlugins]);
};
```

## User Interface Enhancements

### Local Plugins Tab

**New Features:**
- Enhanced statistics dashboard with update counts
- Action buttons for updates, export, and registry configuration
- Visual update notifications with progress tracking
- Plugin version history and source indicators
- Dependency information display

**UI Components:**
```typescript
// Update notifications card
{updates.length > 0 && (
  <Card 
    title={
      <Space>
        <ExclamationCircleOutlined style={{ color: '#faad14' }} />
        Plugin Updates Available
        <Badge count={updates.length} />
      </Space>
    }
    extra={
      <Button type="primary" onClick={handleUpdateAll}>
        Update All
      </Button>
    }
  >
    {/* Update list with individual update buttons */}
  </Card>
)}
```

### Marketplace Tab

**Enhanced Features:**
- Rich plugin metadata with verification badges
- Dependency visualization in plugin cards
- Advanced filtering and search
- Installation progress tracking
- Conflict resolution dialogs

**New Plugin Card Features:**
```typescript
// Enhanced plugin card with dependencies
<Tag color="purple" icon={<SafetyOutlined />}>
  {Object.keys(marketplacePlugin.dependencies).length} deps
</Tag>

// Verification badge
{marketplacePlugin.verified && (
  <Tag color="blue" icon={<CheckCircleOutlined />}>
    Verified
  </Tag>
)}
```

### Registry Tab (NEW)

**Complete Registry Management:**
- Connection configuration with authentication
- Publishing interface for local plugins
- Registry synchronization controls
- Connection status monitoring

**Registry Connection Interface:**
```typescript
<Card title="Connect to Registry">
  <Form onFinish={handleRegistrySave}>
    <Form.Item label="Registry URL" name="url" rules={[{ required: true, type: 'url' }]}>
      <Input placeholder="https://registry.example.com" />
    </Form.Item>
    <Form.Item label="Username" name="username">
      <Input placeholder="your-username" />
    </Form.Item>
    <Form.Item label="Access Token" name="token">
      <Input.Password placeholder="your-access-token" />
    </Form.Item>
  </Form>
</Card>
```

## CLI Deprecation & Migration

### Deprecated CLI Tools

The following CLI tools have been **deprecated** and replaced by UI functionality:

1. **`@cnc-jog-controls/marketplace-client`** - Complete marketplace CLI tool
2. **Marketplace commands** - All search, install, publish, and management commands

### Migration Path

| CLI Command | UI Equivalent | Enhancement |
|-------------|---------------|-------------|
| `cnc-marketplace search` | Marketplace search bar | Visual browsing, filters, ratings |
| `cnc-marketplace install` | Install button | Dependency resolution dialog |
| `cnc-marketplace update` | Check Updates button | Bulk updates, progress tracking |
| `cnc-marketplace publish` | Registry publish button | Visual workflow, validation |
| `cnc-marketplace login` | Registry config modal | Secure credential management |
| `cnc-marketplace list` | Local Plugins tab | Rich metadata, update status |

### Benefits of UI Migration

1. **Visual Feedback**: Real-time progress indicators and status updates
2. **Error Handling**: User-friendly error messages with recovery options
3. **Dependency Management**: Visual dependency trees and conflict resolution
4. **Security**: Secure credential storage using system keychain
5. **Integration**: Seamless workflow within the main application

## Plugin Development Guide

### Updated Plugin Structure

```
my-awesome-plugin/
├── package.json          # Enhanced manifest with dependencies
├── README.md            # Comprehensive documentation
├── LICENSE              # License file
├── icon.png             # Plugin icon
├── src/                 # Source code
│   ├── index.tsx        # Main React component
│   ├── config.ts        # Plugin configuration
│   └── components/      # Additional components
└── assets/              # Static assets
```

### Enhanced Package.json

```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "An awesome CNC plugin with dependencies",
  "main": "src/index.tsx",
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "keywords": ["cnc", "machine-control", "productivity"],
  "cncPlugin": {
    "apiVersion": "1.0.0",
    "category": "productivity",
    "placement": "dashboard",
    "permissions": ["machine.read", "file.read"],
    "displayName": "My Awesome Plugin",
    "icon": "icon.png",
    "dependencies": {
      "other-plugin": "^1.2.0",
      "utility-plugin": "^2.0.0"
    },
    "config": {
      "defaultSize": { "width": 400, "height": 300 },
      "supportedPlacements": ["dashboard", "modal", "standalone"]
    }
  },
  "dependencies": {
    "react": "^18.0.0",
    "antd": "^5.0.0"
  }
}
```

## Registry Hosting & Implementation

### Recommended Architecture

**Phase 1**: GitHub-based registry for MVP
- Uses GitHub releases for plugin distribution
- Plugin metadata in repository files
- GitHub OAuth for authentication

**Phase 2**: Hybrid approach with custom features
- GitHub backend with custom API layer
- Enhanced search and filtering
- Analytics and usage tracking

**Phase 3**: Full custom registry
- Dedicated infrastructure
- Advanced features (reviews, analytics)
- Enterprise capabilities

### Registry API Design

```typescript
interface RegistryAPI {
  // Plugin discovery
  search(query: string, filters: SearchFilters): Promise<PluginSearchResult>;
  getPlugin(id: string, version?: string): Promise<PluginDetails>;
  
  // Plugin management
  publish(plugin: PluginPackage, auth: AuthToken): Promise<PublishResult>;
  unpublish(id: string, version: string, auth: AuthToken): Promise<void>;
  
  // User management
  authenticate(credentials: Credentials): Promise<AuthToken>;
  getUserPlugins(auth: AuthToken): Promise<Plugin[]>;
  
  // Analytics
  getDownloadStats(id: string): Promise<DownloadStats>;
  getUsageMetrics(auth: AuthToken): Promise<UsageMetrics>;
}
```

## Security & Validation

### Plugin Security

- **Checksum Verification**: All plugins verified with SHA-256 checksums
- **Digital Signatures**: Verified publishers use code signing
- **Permission System**: Granular permission control
- **Sandboxing**: Plugins run in isolated environments

### Registry Security

- **HTTPS Only**: All registry communication encrypted
- **Token Authentication**: Secure JWT-based authentication
- **Rate Limiting**: Protection against abuse
- **Vulnerability Scanning**: Automated security scanning

### Dependency Security

- **Version Pinning**: Exact version requirements for security
- **Whitelist Sources**: Only trusted dependency sources
- **Conflict Resolution**: Automatic resolution of version conflicts
- **Isolation**: Dependencies isolated between plugins

## Performance & Optimization

### Caching Strategy

```typescript
interface CacheConfig {
  pluginList: { ttl: 300000, maxSize: 100 };      // 5 minutes
  pluginDetails: { ttl: 600000, maxSize: 50 };    // 10 minutes
  searchResults: { ttl: 180000, maxSize: 20 };    // 3 minutes
  registryStatus: { ttl: 60000, maxSize: 5 };     // 1 minute
}
```

### Lazy Loading

- Plugin metadata loaded on demand
- Progressive loading for large plugin lists
- Background prefetching for popular plugins
- Incremental search results

### Background Operations

- Non-blocking plugin installations
- Background update checking
- Asynchronous dependency resolution
- Progressive plugin activation

## Future Enhancements

### Planned Features

1. **Plugin Analytics**: Usage statistics and performance metrics
2. **Advanced Search**: Semantic search with AI recommendations
3. **Plugin Collections**: Curated bundles for specific workflows
4. **Community Features**: Reviews, ratings, and discussions
5. **Enterprise Features**: RBAC, audit logging, compliance

### Technical Roadmap

1. **Q2 2025**: Advanced dependency management with semantic versioning
2. **Q3 2025**: Plugin analytics and usage tracking
3. **Q4 2025**: Community features and ratings system
4. **Q1 2026**: Enterprise features and private registries

## Conclusion

The UI-based marketplace integration represents a complete evolution from CLI-based plugin management to a modern, visual, and user-friendly system. With advanced features like dependency resolution, version management, registry integration, and comprehensive security, it provides everything needed for a professional plugin ecosystem.

The system successfully deprecates the CLI tools while providing enhanced functionality and a better user experience, positioning the CNC Jog Controls application as a modern, extensible platform for CNC machine control and automation.

---

**Implementation Status**: ✅ Complete  
**CLI Migration**: ✅ Complete  
**Last Updated**: January 2025  
**Version**: 2.0