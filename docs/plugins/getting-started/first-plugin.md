# Your First Plugin

In this tutorial, you'll create your first CNC Jog Controls plugin from scratch. We'll build a simple "Machine Status Monitor" plugin that displays real-time machine information in a custom panel.

## Prerequisites

Before starting, make sure you have:
- Node.js 18+ installed
- Basic knowledge of TypeScript/JavaScript
- CNC Jog Controls application installed
- Code editor (VS Code recommended)

## Step 1: Set Up Development Environment

### Install Plugin CLI
First, install the plugin development CLI tool:

```bash
npm install -g @cnc-jog-controls/plugin-cli
```

### Create New Plugin
Create your first plugin using the CLI:

```bash
# Create a new plugin project
cnc-plugin create machine-status-monitor

# Navigate to the project directory
cd machine-status-monitor
```

This creates a project structure like this:

```
machine-status-monitor/
├── src/
│   ├── index.ts              # Main plugin entry point
│   ├── manifest.json         # Plugin metadata
│   ├── components/           # React components
│   │   └── StatusPanel.tsx   # Main status panel component
│   ├── services/             # Plugin services
│   │   └── StatusService.ts  # Status monitoring service
│   ├── assets/               # Static assets
│   │   └── icon.png          # Plugin icon
│   └── locales/              # Internationalization
│       └── en.json           # English translations
├── tests/                    # Test files
│   └── StatusPanel.test.tsx  # Component tests
├── docs/                     # Plugin documentation
│   └── README.md             # Plugin documentation
├── package.json              # npm package configuration
├── tsconfig.json             # TypeScript configuration
├── webpack.config.js         # Build configuration
└── .gitignore                # Git ignore rules
```

## Step 2: Understanding the Plugin Manifest

Open `src/manifest.json` to see the plugin metadata:

```json
{
  "name": "machine-status-monitor",
  "version": "1.0.0",
  "description": "Real-time machine status monitoring panel",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "license": "MIT",
  "keywords": ["machine", "status", "monitoring", "real-time"],
  "category": "productivity",
  "main": "dist/index.js",
  "icon": "assets/icon.png",
  "permissions": [
    "machine:read",
    "ui:render"
  ],
  "api": {
    "version": "1.0",
    "compatibility": ">=1.0.0"
  },
  "configuration": {
    "schema": "config/schema.json",
    "defaults": "config/defaults.json"
  },
  "localization": {
    "defaultLocale": "en",
    "supportedLocales": ["en"]
  }
}
```

### Key Fields Explained:
- **`permissions`** - What the plugin is allowed to do
- **`category`** - Plugin category for organization
- **`main`** - Entry point file after build
- **`api.compatibility`** - Minimum API version required

## Step 3: Implement the Main Plugin Class

Open `src/index.ts` and implement your plugin:

```typescript
import { Plugin, PluginContext, MachineStatus } from '@cnc-jog-controls/plugin-api'
import { StatusPanel } from './components/StatusPanel'
import { StatusService } from './services/StatusService'

/**
 * Machine Status Monitor Plugin
 * Displays real-time machine status information
 */
export default class MachineStatusMonitorPlugin extends Plugin {
  private statusService: StatusService
  private statusPanel: React.ComponentType

  constructor() {
    super()
    this.statusService = new StatusService()
    this.statusPanel = StatusPanel
  }

  /**
   * Plugin activation - called when plugin is loaded
   */
  async onActivate(context: PluginContext): Promise<void> {
    console.log('Machine Status Monitor plugin activated')

    // Initialize status service
    await this.statusService.initialize(context)

    // Register UI panel in the sidebar
    context.ui.registerPanel({
      id: 'machine-status-monitor',
      title: 'Machine Status',
      icon: 'monitor',
      component: this.statusPanel,
      position: 'sidebar',
      defaultSize: { width: 300, height: 400 }
    })

    // Register menu item
    context.ui.registerMenuItem({
      id: 'toggle-status-monitor',
      label: 'Toggle Status Monitor',
      parent: 'view',
      action: () => this.togglePanel(context)
    })

    // Subscribe to machine events
    context.machine.on('statusChange', this.onMachineStatusChange.bind(this))
    context.machine.on('connectionChange', this.onConnectionChange.bind(this))

    // Start monitoring
    await this.statusService.startMonitoring()
  }

  /**
   * Plugin deactivation - called when plugin is unloaded
   */
  async onDeactivate(context: PluginContext): Promise<void> {
    console.log('Machine Status Monitor plugin deactivated')

    // Stop monitoring
    await this.statusService.stopMonitoring()

    // Unregister UI components
    context.ui.unregisterPanel('machine-status-monitor')
    context.ui.unregisterMenuItem('toggle-status-monitor')

    // Unsubscribe from events
    context.machine.off('statusChange', this.onMachineStatusChange)
    context.machine.off('connectionChange', this.onConnectionChange)
  }

  /**
   * Handle machine status changes
   */
  private onMachineStatusChange(status: MachineStatus): void {
    this.statusService.updateStatus(status)
  }

  /**
   * Handle connection changes
   */
  private onConnectionChange(connected: boolean): void {
    this.statusService.updateConnection(connected)
  }

  /**
   * Toggle status panel visibility
   */
  private togglePanel(context: PluginContext): void {
    const panel = context.ui.getPanel('machine-status-monitor')
    if (panel) {
      panel.visible ? panel.hide() : panel.show()
    }
  }
}
```

## Step 4: Create the Status Service

Create `src/services/StatusService.ts`:

```typescript
import { PluginContext, MachineStatus } from '@cnc-jog-controls/plugin-api'
import { EventEmitter } from 'events'

export interface StatusData {
  connection: {
    connected: boolean
    port: string | null
    baudRate: number | null
  }
  position: {
    x: number
    y: number
    z: number
    units: 'mm' | 'inch'
  }
  state: {
    status: string
    isMoving: boolean
    isHoming: boolean
    isAlarmed: boolean
  }
  performance: {
    feedRate: number
    spindleSpeed: number
    uptime: number
  }
}

export class StatusService extends EventEmitter {
  private context: PluginContext | null = null
  private statusData: StatusData
  private monitoringInterval: NodeJS.Timeout | null = null
  private updateInterval = 500 // Update every 500ms

  constructor() {
    super()
    this.statusData = this.getInitialStatus()
  }

  /**
   * Initialize the service with plugin context
   */
  async initialize(context: PluginContext): Promise<void> {
    this.context = context
    
    // Load initial status
    await this.refreshStatus()
  }

  /**
   * Start monitoring machine status
   */
  async startMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    this.monitoringInterval = setInterval(async () => {
      await this.refreshStatus()
    }, this.updateInterval)

    console.log('Status monitoring started')
  }

  /**
   * Stop monitoring machine status
   */
  async stopMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    console.log('Status monitoring stopped')
  }

  /**
   * Update status from machine event
   */
  updateStatus(status: MachineStatus): void {
    this.statusData.position = {
      x: status.position.x,
      y: status.position.y,
      z: status.position.z,
      units: status.units
    }

    this.statusData.state = {
      status: status.state,
      isMoving: status.isMoving,
      isHoming: status.isHoming,
      isAlarmed: status.isAlarmed
    }

    this.statusData.performance = {
      feedRate: status.feedRate,
      spindleSpeed: status.spindleSpeed,
      uptime: status.uptime
    }

    this.emit('statusUpdated', this.statusData)
  }

  /**
   * Update connection status
   */
  updateConnection(connected: boolean): void {
    this.statusData.connection.connected = connected
    
    if (connected && this.context) {
      // Get connection details
      const connectionInfo = this.context.machine.getConnectionInfo()
      this.statusData.connection.port = connectionInfo.port
      this.statusData.connection.baudRate = connectionInfo.baudRate
    } else {
      this.statusData.connection.port = null
      this.statusData.connection.baudRate = null
    }

    this.emit('connectionUpdated', this.statusData.connection)
  }

  /**
   * Get current status data
   */
  getStatus(): StatusData {
    return { ...this.statusData }
  }

  /**
   * Refresh status from machine
   */
  private async refreshStatus(): Promise<void> {
    if (!this.context) return

    try {
      const machineStatus = await this.context.machine.getStatus()
      this.updateStatus(machineStatus)
    } catch (error) {
      console.error('Failed to refresh machine status:', error)
    }
  }

  /**
   * Get initial status structure
   */
  private getInitialStatus(): StatusData {
    return {
      connection: {
        connected: false,
        port: null,
        baudRate: null
      },
      position: {
        x: 0,
        y: 0,
        z: 0,
        units: 'mm'
      },
      state: {
        status: 'Unknown',
        isMoving: false,
        isHoming: false,
        isAlarmed: false
      },
      performance: {
        feedRate: 0,
        spindleSpeed: 0,
        uptime: 0
      }
    }
  }
}
```

## Step 5: Create the React UI Component

Create `src/components/StatusPanel.tsx`:

```typescript
import React, { useState, useEffect } from 'react'
import { usePluginContext } from '@cnc-jog-controls/plugin-api'
import { StatusService, StatusData } from '../services/StatusService'
import './StatusPanel.css'

export const StatusPanel: React.FC = () => {
  const context = usePluginContext()
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    // Get status service instance
    const statusService = context.getService<StatusService>('StatusService')
    
    if (statusService) {
      // Set initial status
      setStatusData(statusService.getStatus())

      // Subscribe to status updates
      const handleStatusUpdate = (data: StatusData) => {
        setStatusData(data)
        setLastUpdate(new Date())
      }

      statusService.on('statusUpdated', handleStatusUpdate)
      statusService.on('connectionUpdated', handleStatusUpdate)

      // Cleanup
      return () => {
        statusService.off('statusUpdated', handleStatusUpdate)
        statusService.off('connectionUpdated', handleStatusUpdate)
      }
    }
  }, [context])

  if (!statusData) {
    return <div className="status-panel loading">Loading status...</div>
  }

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="status-panel">
      {/* Header */}
      <div className="status-header">
        <h3>Machine Status</h3>
        <div className="last-update">
          Updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Connection Status */}
      <div className="status-section">
        <h4>Connection</h4>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">Status:</span>
            <span className={`value ${statusData.connection.connected ? 'connected' : 'disconnected'}`}>
              {statusData.connection.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {statusData.connection.connected && (
            <>
              <div className="status-item">
                <span className="label">Port:</span>
                <span className="value">{statusData.connection.port}</span>
              </div>
              <div className="status-item">
                <span className="label">Baud Rate:</span>
                <span className="value">{statusData.connection.baudRate}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Machine State */}
      <div className="status-section">
        <h4>Machine State</h4>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">Status:</span>
            <span className={`value status-${statusData.state.status.toLowerCase()}`}>
              {statusData.state.status}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Moving:</span>
            <span className={`value ${statusData.state.isMoving ? 'yes' : 'no'}`}>
              {statusData.state.isMoving ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Homing:</span>
            <span className={`value ${statusData.state.isHoming ? 'yes' : 'no'}`}>
              {statusData.state.isHoming ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Alarm:</span>
            <span className={`value ${statusData.state.isAlarmed ? 'alarm' : 'ok'}`}>
              {statusData.state.isAlarmed ? 'ALARM' : 'OK'}
            </span>
          </div>
        </div>
      </div>

      {/* Position */}
      <div className="status-section">
        <h4>Position ({statusData.position.units})</h4>
        <div className="position-grid">
          <div className="axis">
            <span className="axis-label">X:</span>
            <span className="axis-value">{statusData.position.x.toFixed(3)}</span>
          </div>
          <div className="axis">
            <span className="axis-label">Y:</span>
            <span className="axis-value">{statusData.position.y.toFixed(3)}</span>
          </div>
          <div className="axis">
            <span className="axis-label">Z:</span>
            <span className="axis-value">{statusData.position.z.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Performance */}
      <div className="status-section">
        <h4>Performance</h4>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">Feed Rate:</span>
            <span className="value">{statusData.performance.feedRate} mm/min</span>
          </div>
          <div className="status-item">
            <span className="label">Spindle:</span>
            <span className="value">{statusData.performance.spindleSpeed} RPM</span>
          </div>
          <div className="status-item">
            <span className="label">Uptime:</span>
            <span className="value">{formatUptime(statusData.performance.uptime)}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="status-section">
        <h4>Quick Actions</h4>
        <div className="action-buttons">
          <button 
            className="action-btn"
            onClick={() => context.machine.getStatus()}
            disabled={!statusData.connection.connected}
          >
            Refresh Status
          </button>
          <button 
            className="action-btn"
            onClick={() => context.machine.home()}
            disabled={!statusData.connection.connected || statusData.state.isMoving}
          >
            Home Machine
          </button>
        </div>
      </div>
    </div>
  )
}
```

## Step 6: Add CSS Styling

Create `src/components/StatusPanel.css`:

```css
.status-panel {
  padding: 16px;
  background: var(--bg-primary);
  color: var(--text-primary);
  height: 100%;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.status-panel.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
  color: var(--text-secondary);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.status-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.last-update {
  font-size: 12px;
  color: var(--text-secondary);
}

.status-section {
  margin-bottom: 20px;
}

.status-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-grid {
  display: grid;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.status-item .label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.status-item .value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Connection status colors */
.status-item .value.connected {
  color: var(--success-color);
}

.status-item .value.disconnected {
  color: var(--error-color);
}

/* Machine state colors */
.status-item .value.status-idle {
  color: var(--success-color);
}

.status-item .value.status-run {
  color: var(--warning-color);
}

.status-item .value.status-alarm {
  color: var(--error-color);
}

.status-item .value.yes {
  color: var(--warning-color);
}

.status-item .value.no {
  color: var(--text-secondary);
}

.status-item .value.alarm {
  color: var(--error-color);
  font-weight: 700;
}

.status-item .value.ok {
  color: var(--success-color);
}

/* Position grid */
.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.axis {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.axis-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: 4px;
}

.axis-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

/* Action buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  padding: 10px 16px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.action-btn:disabled {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: not-allowed;
  transform: none;
}

/* Responsive adjustments */
@media (max-width: 400px) {
  .status-panel {
    padding: 12px;
  }
  
  .position-grid {
    grid-template-columns: 1fr;
  }
  
  .status-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
```

## Step 7: Build and Test Your Plugin

### Build the Plugin
```bash
# Build the plugin for production
npm run build
```

### Test in Development Mode
```bash
# Start development server with hot reload
cnc-plugin dev

# Or run tests
npm test
```

### Install in CNC Jog Controls
```bash
# Package the plugin
cnc-plugin package

# Install in the main application
cnc-plugin install machine-status-monitor-1.0.0.zip
```

## Step 8: See Your Plugin in Action

1. **Open CNC Jog Controls** - Start the main application
2. **Open Plugin Manager** - Navigate to Plugins > Plugin Manager
3. **Find Your Plugin** - Look for "Machine Status Monitor" in the plugin list
4. **Activate Plugin** - Click the activate button
5. **See the Panel** - Your status panel should appear in the sidebar
6. **Test Functionality** - Connect to a machine and watch real-time updates

## What You've Learned

Congratulations! You've successfully created your first CNC Jog Controls plugin. You've learned how to:

✅ **Set up a plugin development environment**
✅ **Create a plugin manifest with proper permissions**
✅ **Implement the main plugin class with lifecycle methods**
✅ **Create a service for business logic**
✅ **Build a React UI component with real-time updates**
✅ **Handle machine events and API integration**
✅ **Style your plugin with CSS**
✅ **Build and package your plugin**

## Next Steps

Now that you've created your first plugin, explore these advanced topics:

1. **[Plugin Types](../guides/plugin-types.md)** - Learn about different plugin categories
2. **[API Reference](../api-reference/)** - Explore all available APIs
3. **[Testing Guide](../guides/testing.md)** - Add comprehensive tests
4. **[Performance Optimization](../guides/performance.md)** - Optimize your plugin
5. **[Distribution Guide](../guides/distribution.md)** - Share your plugin with others

## Troubleshooting

### Common Issues

**Plugin won't load:**
- Check the manifest.json syntax
- Verify permission requirements
- Check console for error messages

**UI not showing:**
- Ensure UI components are properly registered
- Check React component syntax
- Verify CSS is loading correctly

**API calls failing:**
- Check if proper permissions are declared
- Verify API methods exist
- Check network connectivity

**Hot reload not working:**
- Restart the development server
- Check file watcher permissions
- Verify webpack configuration

### Getting Help

- **[GitHub Issues](https://github.com/your-org/cnc-jog-controls/issues)** - Report bugs
- **[Discussion Forums](https://github.com/your-org/cnc-jog-controls/discussions)** - Ask questions
- **[Discord Server](https://discord.gg/cnc-jog-controls)** - Real-time help

Happy plugin development! 🚀