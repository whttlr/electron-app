# Plugin Registry Setup Guide

This guide explains how to create and manage a GitHub-based plugin registry for your CNC jog controls application.

## Overview

A plugin registry allows you to centrally manage, distribute, and version control plugins for your application. Using GitHub provides version control, release management, and easy distribution.

## Repository Structure

### 1. Create Registry Repository

Create a new GitHub repository for your plugin registry:

```
cnc-plugin-registry/
├── plugins/                     # Plugin metadata directory
│   ├── machine-monitor/
│   │   └── plugin.json         # Plugin manifest
│   ├── gcode-snippets/
│   │   └── plugin.json
│   └── tool-library/
│       └── plugin.json
├── registry.json               # Registry index file
├── schemas/                    # JSON schemas for validation
│   ├── plugin-schema.json      # Plugin manifest schema
│   └── registry-schema.json    # Registry index schema
└── README.md                   # Registry documentation
```

### 2. Registry Index File (`registry.json`)

```json
{
  "version": "1.0.0",
  "plugins": [
    {
      "id": "machine-monitor",
      "name": "Machine Monitor",
      "description": "Real-time machine status monitoring",
      "author": "Your Organization",
      "version": "1.2.0",
      "downloadUrl": "https://github.com/your-org/cnc-plugin-registry/releases/download/machine-monitor-v1.2.0/machine-monitor.zip",
      "manifestUrl": "https://raw.githubusercontent.com/your-org/cnc-plugin-registry/main/plugins/machine-monitor/plugin.json",
      "category": "monitoring",
      "tags": ["dashboard", "real-time", "status"],
      "minAppVersion": "1.0.0",
      "maxAppVersion": "2.0.0",
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  ],
  "categories": [
    "monitoring",
    "control",
    "visualization",
    "utility",
    "automation"
  ]
}
```

### 3. Plugin Manifest (`plugins/[plugin-id]/plugin.json`)

```json
{
  "id": "machine-monitor",
  "name": "Machine Monitor",
  "version": "1.2.0",
  "description": "Comprehensive machine status monitoring with real-time updates",
  "author": "Your Organization",
  "license": "MIT",
  "homepage": "https://github.com/your-org/machine-monitor-plugin",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/machine-monitor-plugin.git"
  },
  "keywords": ["monitoring", "dashboard", "real-time"],
  "category": "monitoring",
  "placement": "dashboard",
  "screen": "main",
  "size": {
    "width": 400,
    "height": 300
  },
  "priority": 1,
  "autoStart": true,
  "permissions": ["machine.read", "status.read"],
  "compatibility": {
    "minAppVersion": "1.0.0",
    "maxAppVersion": "2.0.0"
  },
  "dependencies": {
    "react": "^18.0.0",
    "antd": "^5.0.0"
  },
  "screenshots": [
    "https://raw.githubusercontent.com/your-org/machine-monitor-plugin/main/screenshots/dashboard.png"
  ],
  "changelog": "https://raw.githubusercontent.com/your-org/machine-monitor-plugin/main/CHANGELOG.md"
}
```

## Implementation Steps

### 1. Set Up Repository Structure

```bash
# Create registry repository
mkdir cnc-plugin-registry
cd cnc-plugin-registry
git init

# Create directory structure
mkdir -p plugins schemas

# Create initial files
touch registry.json README.md
touch schemas/plugin-schema.json schemas/registry-schema.json
```

### 2. Create JSON Schemas

**Plugin Schema (`schemas/plugin-schema.json`):**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "version", "description", "author"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "Unique plugin identifier"
    },
    "name": {
      "type": "string",
      "maxLength": 100
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "description": {
      "type": "string",
      "maxLength": 500
    },
    "placement": {
      "type": "string",
      "enum": ["dashboard", "standalone", "modal", "sidebar"]
    },
    "permissions": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}
```

### 3. Automation with GitHub Actions

**`.github/workflows/validate-registry.yml`:**
```yaml
name: Validate Plugin Registry

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install ajv-cli
        
      - name: Validate registry.json
        run: npx ajv validate -s schemas/registry-schema.json -d registry.json
        
      - name: Validate plugin manifests
        run: |
          for manifest in plugins/*/plugin.json; do
            echo "Validating $manifest"
            npx ajv validate -s schemas/plugin-schema.json -d "$manifest"
          done
```

**`.github/workflows/update-registry.yml`:**
```yaml
name: Update Registry

on:
  release:
    types: [published]

jobs:
  update-registry:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Update registry.json
        run: |
          # Extract plugin info from release
          PLUGIN_ID="${{ github.event.release.tag_name }}"
          DOWNLOAD_URL="${{ github.event.release.assets[0].browser_download_url }}"
          
          # Update registry.json with new plugin version
          node scripts/update-registry.js "$PLUGIN_ID" "$DOWNLOAD_URL"
          
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add registry.json
          git commit -m "Update registry for ${{ github.event.release.tag_name }}"
          git push
```

### 4. Registry Management Scripts

**`scripts/update-registry.js`:**
```javascript
const fs = require('fs');
const path = require('path');

function updateRegistry(pluginId, downloadUrl) {
  const registryPath = path.join(__dirname, '../registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  
  // Find existing plugin or create new entry
  let plugin = registry.plugins.find(p => p.id === pluginId);
  
  if (!plugin) {
    // Read plugin manifest
    const manifestPath = path.join(__dirname, `../plugins/${pluginId}/plugin.json`);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    plugin = {
      id: manifest.id,
      name: manifest.name,
      description: manifest.description,
      author: manifest.author,
      category: manifest.category,
      tags: manifest.keywords || []
    };
    
    registry.plugins.push(plugin);
  }
  
  // Update plugin with release info
  plugin.version = process.env.RELEASE_VERSION;
  plugin.downloadUrl = downloadUrl;
  plugin.lastUpdated = new Date().toISOString();
  
  // Write updated registry
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

// Execute if called directly
if (require.main === module) {
  const [pluginId, downloadUrl] = process.argv.slice(2);
  updateRegistry(pluginId, downloadUrl);
}
```

## Integration with Application

### 1. Registry Client Service

Create a service in your application to fetch from the registry:

```typescript
// src/services/plugin/RegistryService.ts
export class PluginRegistryService {
  private readonly registryUrl = 'https://raw.githubusercontent.com/your-org/cnc-plugin-registry/main/registry.json';

  async fetchRegistry(): Promise<PluginRegistry> {
    const response = await fetch(this.registryUrl);
    return response.json();
  }

  async fetchPluginManifest(manifestUrl: string): Promise<PluginManifest> {
    const response = await fetch(manifestUrl);
    return response.json();
  }

  async downloadPlugin(downloadUrl: string): Promise<ArrayBuffer> {
    const response = await fetch(downloadUrl);
    return response.arrayBuffer();
  }
}
```

### 2. Plugin Store UI

Add a plugin store interface to browse and install from the registry:

```typescript
// Integration in PluginsView.tsx
const registryService = new PluginRegistryService();

const handleInstallFromRegistry = async (pluginId: string) => {
  const registry = await registryService.fetchRegistry();
  const plugin = registry.plugins.find(p => p.id === pluginId);
  
  if (plugin) {
    const pluginData = await registryService.downloadPlugin(plugin.downloadUrl);
    // Install plugin using existing installation logic
  }
};
```

## Security Considerations

1. **Plugin Verification**: Implement signature verification for plugin packages
2. **Permission System**: Validate plugin permissions against registry manifest
3. **Sandboxing**: Run plugins in isolated environments
4. **Content Security**: Validate plugin content and dependencies

## Best Practices

1. **Semantic Versioning**: Use semver for plugin versions
2. **Changelog Maintenance**: Keep detailed changelogs for each plugin
3. **Testing**: Validate all registry changes with automated tests
4. **Documentation**: Maintain comprehensive plugin documentation
5. **Categories**: Organize plugins with clear categories and tags

## Publishing Workflow

1. **Plugin Development**: Develop plugin in separate repository
2. **Release Creation**: Create GitHub release with plugin ZIP
3. **Registry Update**: Automated workflow updates registry.json
4. **Validation**: Registry validates plugin manifest and metadata
5. **Distribution**: Plugin becomes available in application store

This registry system provides a scalable foundation for managing your CNC application's plugin ecosystem with proper versioning, validation, and automated distribution.