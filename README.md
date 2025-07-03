# CNC Jog Controls - Electron App

[![Build and Release](https://github.com/whttlr/electron-app/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/whttlr/electron-app/actions/workflows/build-and-release.yml)
[![Documentation](https://github.com/whttlr/electron-app/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/whttlr/electron-app/actions/workflows/deploy-docs.yml)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/whttlr/electron-app)](https://github.com/whttlr/electron-app/releases/latest)

A comprehensive CNC machine control application with an integrated UI-based plugin ecosystem.

## 📑 Table of Contents

- [📥 Quick Download](#-quick-download)
- [🎯 Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🗄️ Database Integration](#️-database-integration)
- [🔧 Plugin Development](#-plugin-development)
- [🏗️ Architecture](#️-architecture)
- [🚀 Automated Build & Release System](#-automated-build--release-system)
- [🧪 Testing](#-testing)
- [📚 Documentation System](#-documentation-system)
- [🔄 Recent Updates](#-recent-updates)
- [🤝 Contributing](#-contributing)

## 📥 Quick Download

### Latest Release
**[⬇️ Download for macOS](https://github.com/whttlr/electron-app/releases/latest/download/CNC-Jog-Controls-0.1.0.dmg)** | **[📖 View Documentation](https://whttlr.github.io/electron-app/)**

- **macOS**: Intel (x64) - `CNC-Jog-Controls-0.1.0.dmg`
- **Requirements**: macOS 10.15 (Catalina) or later

**All Releases**: [github.com/whttlr/electron-app/releases](https://github.com/whttlr/electron-app/releases)

*Downloads are automatically built and tested with every release.*

## 🎯 Features

### Core Application
- **Machine Position Controls**: 3D sliders for X, Y, Z axis positioning
- **Jog Controls**: Directional buttons for incremental movement
- **G-code Editor**: Syntax highlighting and real-time validation
- **Machine Status Monitoring**: Real-time position, status, and alarm monitoring
- **Workspace Management**: Project organization and file handling

### Plugin System
- **🔧 UI-Based Development**: Create, manage, and configure plugins through the integrated interface
- **📚 Comprehensive Documentation**: Step-by-step guides and API reference in `/docs/plugins/`
- **🏪 Marketplace Integration**: Discover, install, and publish plugins with dependency resolution
- **🔄 Version Management**: Automatic update checking and plugin version control
- **🔐 Registry Support**: Connect to multiple plugin registries for enterprise deployment

## 🚀 Quick Start

### 1. Install the Application

```bash
git clone <repository-url>
cd electron-app
npm install

# Initialize the database (first time only)
npx prisma migrate dev --name init
```

### 2. Run the Application

```bash
npm run electron:dev
```

The Electron app will start with the main dashboard accessible.

### 3. Explore the Plugin System

1. **Navigate to Plugins**: Click the "Plugins" tab in the main interface
2. **Browse Marketplace**: Explore available plugins in the Marketplace tab
3. **Install Plugins**: Click "Install" on any plugin to add it to your system
4. **Configure Plugins**: Use the "Configure" button to set placement and settings

## 🔧 Plugin Development

### UI-Based Plugin Management

The plugin system is now fully integrated into the main application UI:

#### Local Plugins Tab
- **Upload Plugins**: Drag-and-drop ZIP files or click to select
- **Manage Installed**: Enable/disable, configure, and remove plugins
- **Check Updates**: Automatic update detection with bulk update capabilities
- **Export/Import**: Backup and restore plugin configurations

#### Marketplace Tab
- **Discover Plugins**: Browse community and verified plugins
- **Search & Filter**: Find plugins by category, tags, or keywords
- **Dependency Resolution**: Automatic handling of plugin dependencies
- **Installation**: One-click installation with progress tracking

#### Registry Tab
- **Connect to Registries**: Configure connections to public or private registries
- **Publish Plugins**: Upload your local plugins to registries
- **Sync**: Keep your plugin list synchronized with connected registries

## 🗄️ Database Integration

### Supabase Backend

The application uses **Supabase** as its primary database backend for persistent storage, accessed through a secure bundled API server.

#### Architecture Overview
```
Electron App (Renderer)
    ↓ HTTP Requests
Bundled API Server (Express.js) ← Embedded in Electron
    ↓ Secure Connection
Supabase Database ← PostgreSQL with Row Level Security
```

#### Key Features
- **Secure Credentials**: Database keys never exposed to renderer process
- **RESTful API**: Clean HTTP interface for all database operations
- **Real-time Capable**: Built-in support for live updates via Supabase
- **Type Safety**: Full TypeScript interfaces for all data models
- **Production Ready**: Encrypted connections and proper error handling

#### Available Services

**Machine Configuration Management**
```typescript
import { bundledApiSupabaseService } from './services/bundled-api-supabase'

// Get all machine configurations
const configs = await bundledApiSupabaseService.getMachineConfigs()

// Create new configuration
const newConfig = await bundledApiSupabaseService.createMachineConfig({
  name: 'CNC Router 3018',
  work_area_x: 300,
  work_area_y: 180,
  work_area_z: 45,
  units: 'mm'
})
```

**Job History Tracking**
```typescript
// Create and track CNC jobs
const job = await bundledApiSupabaseService.createJob({
  job_name: 'Logo Engraving',
  machine_config_id: config.id,
  gcode_file: 'logo.gcode'
})

// Update job status in real-time
await bundledApiSupabaseService.updateJobStatus(job.id, 'running')
await bundledApiSupabaseService.updateJobStatus(job.id, 'completed', positionLog)
```

#### Database Schema

**Machine Configurations** (`machine_configs`)
- `id` - UUID primary key
- `name` - Machine configuration name
- `work_area_x/y/z` - Working area dimensions
- `units` - Units (mm/in)
- `connection_settings` - Serial port configuration (JSON)
- `created_at/updated_at` - Timestamps

**CNC Jobs** (`cnc_jobs`)
- `id` - UUID primary key
- `machine_config_id` - Reference to machine configuration
- `job_name` - Human-readable job name
- `gcode_file` - G-code file name (optional)
- `status` - Job status (pending/running/completed/failed/etc.)
- `start_time/end_time` - Job timing
- `position_log` - Position tracking data (JSON)
- `created_at` - Timestamp

**Plugin Configurations** (`plugin_configs`)
- Plugin settings persistence (ready for future use)

**Machine State** (`machine_state`)
- Real-time machine status tracking (ready for future use)

#### API Endpoints

All database operations are accessible via the bundled API server:

```bash
# Machine Configurations
GET    /api/v1/supabase/machine-configs     # List all configs
POST   /api/v1/supabase/machine-configs     # Create new config
GET    /api/v1/supabase/machine-configs/:id # Get specific config
PUT    /api/v1/supabase/machine-configs/:id # Update config
DELETE /api/v1/supabase/machine-configs/:id # Delete config

# Job History
GET    /api/v1/supabase/jobs                # List jobs (with pagination)
POST   /api/v1/supabase/jobs                # Create new job
PATCH  /api/v1/supabase/jobs/:id/status     # Update job status
```

#### Development Setup

1. **Database Setup** (One-time):
   ```sql
   -- Execute in Supabase SQL Editor (docs/supabase-schema.sql)
   -- Creates all tables, indexes, and sample data
   ```

2. **API Server** (Automatic):
   ```bash
   # API server starts automatically with Electron app
   # Runs on localhost:3000 by default
   # Environment variables loaded from /api/.env
   ```

3. **Integration Testing**:
   ```typescript
   // Use SupabaseTestComponent for testing database operations
   import { SupabaseTestComponent } from './components'
   ```

#### Configuration Files

**API Environment** (`/api/.env`)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-key (production)
```

**Connection Security**
- Content Security Policy updated to allow localhost connections
- Row Level Security enabled in Supabase
- Credentials never exposed to renderer process
- HTTPS connections to Supabase in production

#### Migration from File-Based Storage

Replace local configuration files with database-backed storage:

```typescript
// Before (file-based)
import machineConfig from '../config/machine.json'

// After (database-backed)
const configs = await bundledApiSupabaseService.getMachineConfigs()
const activeConfig = configs.find(c => c.name === 'default') || configs[0]
```

For detailed implementation guides, see:
- [Bundled API Integration](docs/supabase-bundled-api.md)
- [Database Schema](docs/supabase-schema.sql)
- [Implementation Next Steps](SUPABASE_INTEGRATION_NEXT_STEPS.md)

### Plugin Development Workflow

#### 1. Create a Plugin
Create a new directory with this structure:
```
my-awesome-plugin/
├── package.json          # Plugin manifest with dependencies
├── README.md            # Documentation
├── icon.png             # Plugin icon (optional)
├── src/
│   ├── index.tsx        # Main React component
│   └── components/      # Additional components
└── assets/              # Static assets
```

#### 2. Plugin Manifest (package.json)
```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "An awesome CNC plugin",
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
      "other-plugin": "^1.2.0"
    }
  }
}
```

#### 3. Plugin Component (src/index.tsx)
```tsx
import React, { useState } from 'react';
import { Card, Button, Typography } from 'antd';

const { Title, Text } = Typography;

interface MyPluginProps {
  machineStatus?: any;
  onMachineCommand?: (command: string) => void;
}

const MyAwesomePlugin: React.FC<MyPluginProps> = ({ 
  machineStatus, 
  onMachineCommand 
}) => {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <Card title="My Awesome Plugin" size="small">
      <Title level={5}>Machine Status</Title>
      <Text type="secondary">
        Status: {machineStatus?.connected ? 'Connected' : 'Disconnected'}
      </Text>
      <Button 
        type="primary" 
        onClick={() => setIsRunning(!isRunning)}
      >
        {isRunning ? 'Stop' : 'Start'}
      </Button>
    </Card>
  );
};

export default MyAwesomePlugin;
```

#### 4. Package and Upload
1. **Create ZIP**: Zip your plugin directory
2. **Upload**: Go to Plugins tab → Local Plugins → Upload Plugin
3. **Configure**: Set placement, screen, and other settings
4. **Test**: Your plugin will appear in the configured location

### Plugin Categories

- **`visualization`** - 3D viewers, charts, graphs, display components
- **`control`** - Machine control interfaces, jog controls, manual operations  
- **`productivity`** - Workflow tools, calculators, code generators, utilities
- **`utility`** - General purpose tools, file management, system utilities

### Plugin Placements

- **`dashboard`** - Small card on the main dashboard
- **`standalone`** - Full-screen application with navigation menu item
- **`modal`** - Popup dialog for focused tasks
- **`sidebar`** - Side panel for tool palettes

## 🏗️ Architecture

### Project Structure
```
electron-app/
├── src/                          # Main application source
│   ├── components/               # Reusable UI components
│   ├── views/                    # Application screens
│   │   ├── Dashboard/            # Main dashboard
│   │   ├── Controls/             # CNC controls
│   │   ├── Plugins/              # Plugin management UI
│   │   └── Settings/             # Application settings
│   ├── services/                 # Service layer
│   │   └── plugin/               # Plugin management service
│   ├── core/                     # Core business logic
│   ├── ui/                       # UI components by feature
│   └── utils/                    # Utility functions
├── config/                       # Configuration files
├── docs/                         # Documentation
│   └── plugins/                  # Plugin development guides
└── build-resources/              # Electron build resources
```

### Self-Contained Modules

The application follows a self-contained module architecture where each functional domain is organized with:
- `index.ts` - Public API exports
- `config.ts` - Module configuration
- `__tests__/` - Module-specific tests
- `__mocks__/` - Mock data for testing
- `README.md` - Module documentation

## UI-Based Plugin System

The plugin system is fully integrated into the main application UI, providing a seamless experience for plugin development, management, and distribution.

### Key Features

- **Visual Feedback**: Real-time progress and status indicators
- **Dependency Management**: Automatic resolution with user confirmation
- **Configuration**: Form-based setup with visual interface
- **Integration**: Seamless workflow within the main application
- **Security**: Secure credential storage and validation

## Database Schema Updates

When making changes to the database schema:

```bash
# Generate and apply a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma client (after schema changes)
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

## 🚀 Automated Build & Release System

### CI/CD Pipeline

The project features a comprehensive GitHub Actions pipeline that automatically builds, tests, and releases the application:

#### **Automated Builds**
Every push to `main` triggers:
- **Multi-platform builds**: macOS (Universal), Windows, Linux
- **Quality assurance**: Linting, unit tests, build verification
- **Automatic releases**: Version tagging and GitHub releases
- **Documentation updates**: Auto-updated download links

#### **Release Types**

**Beta Releases** (Automatic)
- Triggered on every push to `main`
- Version format: `v0.1.0-beta.abc1234`
- Pre-release flag enabled
- Available immediately for testing

**Stable Releases** (Manual)
- Triggered via GitHub Actions "Run workflow"
- Version format: `v0.1.0`
- Full release with changelog
- Promoted to "Latest Release"

#### **Build Artifacts**

| Platform | File Type | Download | Compatibility |
|----------|-----------|----------|---------------|
| **macOS** | `.dmg` | Universal Binary | Intel + Apple Silicon, macOS 10.15+ |
| **Windows** | `.exe` | NSIS Installer | Windows 10+, 64-bit |
| **Linux** | `.AppImage` | Portable | Most distributions, 64-bit |

#### **Download Distribution**

**Documentation Site**: [whttlr.github.io/electron-app/download](https://whttlr.github.io/electron-app/download)
- Platform-specific download buttons
- System requirements and installation guides
- Automatically updated with latest releases

**Direct Download Links** (Latest Release):
```
macOS:    https://github.com/whttlr/electron-app/releases/latest/download/CNC-Jog-Controls.dmg
Windows:  https://github.com/whttlr/electron-app/releases/latest/download/CNC-Jog-Controls-Setup.exe
Linux:    https://github.com/whttlr/electron-app/releases/latest/download/CNC-Jog-Controls.AppImage
```

### **GitHub Actions Workflows**

#### Build and Release (`.github/workflows/build-and-release.yml`)
```yaml
Triggers:
  - Push to main (excludes docs)
  - Pull requests to main
  - Manual workflow dispatch

Jobs:
  1. Test: Lint, unit tests, build verification
  2. Build: Multi-platform Electron builds
  3. Release: GitHub release creation
  4. Update-docs: Documentation updates
```

#### Documentation Deployment (`.github/workflows/deploy-docs.yml`)
```yaml
Triggers:
  - Push to main (docs changes)
  - Manual workflow dispatch

Deploys: Docusaurus site to GitHub Pages
```

### **Setting Up CI/CD**

For new repositories or forks:

1. **Enable GitHub Actions**:
   ```
   Repository Settings → Actions → General
   - Enable "Read and write permissions" for GITHUB_TOKEN
   ```

2. **Enable GitHub Pages**:
   ```
   Repository Settings → Pages
   - Source: "GitHub Actions"
   ```

3. **First Release**:
   - Push to main branch
   - Workflow automatically creates first release
   - Documentation site deploys

### **Local Development Builds**

For development and testing:

```bash
# Development build
npm run build              # Build React application
npm run electron:build     # Build Electron application

# Platform-specific builds
npm run electron:build:mac    # macOS only
npm run electron:build:win    # Windows only  
npm run electron:build:linux  # Linux only

# Documentation
npm run docs:start         # Start docs dev server
npm run docs:build         # Build documentation
```

### **Release Management**

#### **Creating a Stable Release**
1. Go to **Actions** tab in GitHub
2. Select **"Build and Release Electron App"** workflow
3. Click **"Run workflow"**
4. Choose **"release"** from dropdown
5. Workflow creates stable release with full changelog

#### **Version Bumping**
Update version in `package.json` before stable releases:
```bash
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0  
npm version major  # 1.0.0 → 2.0.0
```

#### **Release Notes**
- Auto-generated from commit messages
- Includes "What's Changed" section
- Download instructions for each platform
- Links to full changelog

### **Monitoring Builds**

**Build Status**: [github.com/whttlr/electron-app/actions](https://github.com/whttlr/electron-app/actions)
- Real-time build progress
- Build logs and artifacts
- Test results and coverage

**Release History**: [github.com/whttlr/electron-app/releases](https://github.com/whttlr/electron-app/releases)
- All releases and pre-releases
- Download statistics
- Release notes and changelogs

## 🧪 Testing

```bash
npm test                   # Run Jest unit tests
npm run test:e2e          # Run Playwright end-to-end tests
npm run lint              # Run ESLint code analysis
```

## 🔄 GitHub Actions Workflows

### Available Workflows

The project includes several GitHub Actions workflows for continuous integration and deployment:

#### 1. Unit Tests
```yaml
# Trigger: Push, Pull Request
# Path: .github/workflows/test.yml
name: Unit Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ci
```

#### 2. Security Scanning
```yaml
# Trigger: Push to main, Pull Request, Schedule
# Path: .github/workflows/security.yml
name: Security Scan
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Weekly on Monday
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm audit --audit-level=moderate
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

#### 3. ESLint Code Analysis
```yaml
# Trigger: Push, Pull Request
# Path: .github/workflows/lint.yml
name: Code Quality
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - name: Upload ESLint Report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: eslint-report
          path: eslint-report.json
```

#### 4. Playwright E2E Tests
```yaml
# Trigger: Push to main, Pull Request
# Path: .github/workflows/e2e.yml
name: E2E Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

#### 5. Email Notifications
```yaml
# Trigger: Workflow failure, Release
# Path: .github/workflows/notify.yml
name: Notifications
on:
  workflow_run:
    workflows: ["Build and Release"]
    types: [completed]
  release:
    types: [published]
jobs:
  email:
    runs-on: ubuntu-latest
    steps:
      - name: Send Email on Failure
        if: github.event.workflow_run.conclusion == 'failure'
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 587
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: "Build Failed: ${{ github.repository }}"
          body: |
            The build failed for repository ${{ github.repository }}.
            
            Commit: ${{ github.sha }}
            Branch: ${{ github.ref }}
            Workflow: ${{ github.event.workflow_run.name }}
            
            View details: ${{ github.event.workflow_run.html_url }}
          to: ${{ secrets.NOTIFICATION_EMAIL }}
          from: ${{ secrets.EMAIL_USERNAME }}
      
      - name: Send Release Email
        if: github.event_name == 'release'
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 587
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: "New Release: ${{ github.event.release.tag_name }}"
          body: |
            A new release has been published!
            
            Release: ${{ github.event.release.name }}
            Tag: ${{ github.event.release.tag_name }}
            
            ${{ github.event.release.body }}
            
            Download: ${{ github.event.release.html_url }}
          to: ${{ secrets.NOTIFICATION_EMAIL }}
          from: ${{ secrets.EMAIL_USERNAME }}
```

#### 6. Slack Integration
```yaml
# Trigger: Push to main, Release, Workflow failure
# Path: .github/workflows/slack.yml
name: Slack Notifications
on:
  push:
    branches: [main]
  release:
    types: [published]
  workflow_run:
    workflows: ["Build and Release", "Unit Tests", "E2E Tests"]
    types: [completed]
jobs:
  slack:
    runs-on: ubuntu-latest
    steps:
      - name: Slack Notification - Build Status
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#cnc-builds'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          fields: repo,message,commit,author,action,eventName,ref,workflow
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
          MATRIX_CONTEXT: ${{ toJson(matrix) }}
      
      - name: Slack Notification - Release
        if: github.event_name == 'release'
        uses: 8398a7/action-slack@v3
        with:
          status: 'success'
          channel: '#cnc-releases'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          custom_payload: |
            {
              text: "🚀 New Release Published!",
              attachments: [{
                color: 'good',
                fields: [{
                  title: 'Release',
                  value: '${{ github.event.release.tag_name }}',
                  short: true
                }, {
                  title: 'Repository',
                  value: '${{ github.repository }}',
                  short: true
                }],
                actions: [{
                  type: 'button',
                  text: 'Download Release',
                  url: '${{ github.event.release.html_url }}'
                }]
              }]
            }
```

#### 7. Release Automation
```yaml
# Trigger: Tag push, Manual dispatch
# Path: .github/workflows/release.yml
name: Publish Release
on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Release version (e.g., v1.0.0)'
        required: true
        type: string
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run test:ci
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.event.inputs.version || github.ref_name }}
          release_name: Release ${{ github.event.inputs.version || github.ref_name }}
          body: |
            ## What's Changed
            - Automated release from GitHub Actions
            
            ## Downloads
            - [Windows Installer](../../releases/latest/download/CNC-Jog-Controls-Setup.exe)
            - [macOS DMG](../../releases/latest/download/CNC-Jog-Controls.dmg)
            - [Linux AppImage](../../releases/latest/download/CNC-Jog-Controls.AppImage)
          draft: false
          prerelease: false
```

### Required Secrets

Set up these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

```bash
# Email notifications
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NOTIFICATION_EMAIL=team@yourcompany.com

# Slack integration
SLACK_WEBHOOK=https://hooks.slack.com/services/...

# Security scanning
SNYK_TOKEN=your-snyk-token

# GitHub token (automatically provided)
GITHUB_TOKEN=automatic
```

### Usage Examples

#### Running Tests Locally
```bash
# Before pushing - run the same checks as CI
npm run lint                    # ESLint analysis
npm run test:ci                 # Unit tests with coverage
npm run build                   # Build verification
npm run test:e2e                # E2E tests
```

#### Triggering Workflows
```bash
# Push to main - triggers all workflows
git push origin main

# Create release - triggers release workflow
git tag v1.0.0
git push origin v1.0.0

# Manual release via GitHub UI
# Go to Actions > Publish Release > Run workflow
```

#### Security Scanning
```bash
# Local security audit
npm audit --audit-level=moderate

# Check for vulnerabilities
npm audit fix

# Run Snyk locally (requires token)
npx snyk test
```

## 📚 Documentation System

### **Live Documentation Site**

**[whttlr.github.io/electron-app](https://whttlr.github.io/electron-app/)** - Full documentation with search and navigation

#### **Documentation Structure**
- **Getting Started**: Installation, first run, basic controls
- **Features**: Detailed feature documentation and guides
- **Architecture**: System design and technical details
- **Development**: Contributing and development setup
- **Download**: Latest releases and installation

#### **Cross-Referenced Documentation**
- **Main App Docs**: Application features and user guides
- **Plugin Registry**: [whttlr.github.io/plugin-registry](https://whttlr.github.io/plugin-registry/) - Plugin development and marketplace

### **Documentation Development**

```bash
# Local documentation development
npm run docs:install      # Install Docusaurus dependencies
npm run docs:start        # Start development server (localhost:3000)
npm run docs:build        # Build for production
npm run docs:serve        # Preview production build
```

#### **Auto-Deployment**
- Documentation automatically deploys on push to `main`
- Download page updates with latest release links
- Cross-links maintained with plugin registry

### **Available Documentation**

**Local Documentation** (`/docs/` directory):
- **[Architecture Overview](docs/architecture/ARCHITECTURE.md)** - System architecture and design patterns
- **[Plugin Development Guide](docs/plugins/)** - Complete plugin development documentation
- **[Marketplace Integration](docs/plugins/MARKETPLACE-INTEGRATION.md)** - UI-based marketplace features

**Online Documentation** (Generated):
- **User Guides**: Installation, configuration, troubleshooting
- **Feature Documentation**: Controls, visualization, plugins
- **Developer Docs**: Architecture, contributing, API reference
- **Download Center**: Platform-specific downloads with instructions

## 🔄 Recent Updates

### Plugin System Overhaul
- **UI-Based Management**: Complete migration from CLI to integrated UI
- **Dependency Resolution**: Automatic dependency detection and installation
- **Version Management**: Update checking, notifications, and bulk updates
- **Registry Integration**: Connect to multiple registries for plugin distribution
- **Import/Export**: Backup and restore plugin configurations

### Modern Architecture
- **Self-Contained Modules**: Clean separation of concerns with modular architecture
- **TypeScript**: Full type safety throughout the application
- **React 18**: Modern React with hooks and context patterns
- **Ant Design**: Professional UI component library
- **Testing**: Comprehensive test suite with Jest and Playwright

### Automated CI/CD Pipeline
- **Multi-Platform Builds**: Automatic macOS, Windows, Linux builds
- **Quality Assurance**: Automated testing, linting, and verification
- **Release Management**: Beta and stable releases with auto-generated changelogs
- **Documentation Deployment**: Auto-updating docs with download links
- **Distribution**: Direct download links and GitHub releases integration

### Security & Performance
- **Plugin Sandboxing**: Secure plugin execution environment
- **Checksum Verification**: Plugin integrity validation
- **Lazy Loading**: Performance optimization with progressive loading
- **Caching**: Intelligent caching for better responsiveness

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Pull request process
- Coding standards

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.