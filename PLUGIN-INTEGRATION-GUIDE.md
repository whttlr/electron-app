# Plugin Integration Guide

## How to Add Your Plugin to the CNC Jog Controls UI

There are now multiple ways to integrate plugins into the CNC Jog Controls application, from simple manual integration to advanced upload-based installation.

## 🚀 Method 1: Plugin Upload System (Recommended)

### Easy Plugin Installation via ZIP Upload

The most user-friendly way to install plugins is through the built-in plugin upload system.

#### Step 1: Prepare Your Plugin
1. Create your plugin using `./create-plugin.sh my-plugin`
2. Develop and test your plugin
3. Zip your plugin directory:
   ```bash
   cd my-plugins
   zip -r my-plugin.zip my-plugin/
   ```

#### Step 2: Upload via UI
1. **Open Plugin Uploader**: Go to Dashboard → Developer Tools → "Upload Plugin"
2. **Select ZIP File**: Choose your plugin zip file
3. **Configure Placement**:
   - **Placement Type**: Dashboard, Standalone, Modal, Sidebar, etc.
   - **Target Screen**: Main, Controls, Machine, Workspace, etc.
   - **Size**: Width (grid columns) and height (pixels or auto)
   - **Priority**: Display order (1-200, higher appears first)
4. **Menu Integration** (Optional):
   - Add to application menu
   - Set menu path (e.g., "Tools/My Plugins/Plugin Name")
   - Choose icon and keyboard shortcut
5. **Plugin Settings**:
   - Enable/disable plugin
   - Auto-start on application load
   - Set permissions
6. **Click "Install Plugin"**

#### Step 3: Plugin Auto-Integration
The system automatically:
- ✅ Extracts the ZIP file
- ✅ Validates plugin structure
- ✅ Places files in correct directory
- ✅ Updates plugin registry
- ✅ Configures UI placement
- ✅ Adds menu items (if configured)
- ✅ Makes plugin available immediately

### Upload System Features

#### Placement Options
| Placement | Description | Best For |
|-----------|-------------|----------|
| `dashboard` | Card on dashboard | General purpose plugins |
| `standalone` | Dedicated screen | Complex applications |
| `modal` | Popup dialog | Quick tools |
| `sidebar` | Side panel | Always-available tools |
| `controls` | Control panel integration | Machine operation tools |
| `machine` | Machine status screen | Monitoring tools |
| `workspace` | Workspace screen | Project management |

#### Screen Targeting
| Screen | Description | Use Cases |
|--------|-------------|-----------|
| `main` | Main dashboard | Most plugins |
| `new` | Create new screen | Standalone apps |
| `controls` | Jog controls screen | Movement tools |
| `machine` | Machine status | Monitoring |
| `workspace` | Project workspace | File management |
| `settings` | Settings screen | Configuration tools |

#### Size Configuration
- **Width**: 1-24 grid columns or 'auto'
  - Small: 6 columns
  - Medium: 12 columns
  - Large: 18 columns
  - Full: 24 columns
- **Height**: Pixels or 'auto'
  - Small: 200px
  - Medium: 300px
  - Large: 400px
  - Auto: Fits content

#### Menu Integration
- **Enabled**: Add plugin to application menu
- **Menu Path**: Hierarchical path (e.g., "Tools/My Plugins/Plugin Name")
- **Icon**: Ant Design icon name
- **Shortcut**: Keyboard shortcut (e.g., "Ctrl+Shift+P")

## 🔧 Method 2: Manual Integration (Development)

### Step 1: Copy Your Plugin to the Plugins Directory

```bash
# Create the plugins directory if it doesn't exist
mkdir -p src/plugins

# Copy your plugin
cp -r my-plugins/my-first-plugin src/plugins/
```

### Step 2: Create a Plugin Loader Component

Create `src/components/PluginContainer.tsx`:

```tsx
import React, { useEffect, useRef } from 'react'

interface PluginContainerProps {
  pluginPath: string
  pluginName: string
}

export const PluginContainer: React.FC<PluginContainerProps> = ({ 
  pluginPath, 
  pluginName 
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const pluginInstanceRef = useRef<any>(null)

  useEffect(() => {
    const loadPlugin = async () => {
      try {
        // Import the plugin
        const PluginClass = await import(pluginPath)
        const PluginConstructor = PluginClass.default || PluginClass

        // Create mock API for the plugin
        const mockAPI = {
          events: {
            on: (event: string, handler: Function) => {
              console.log(`Plugin ${pluginName} listening to ${event}`)
            },
            off: (event: string, handler: Function) => {
              console.log(`Plugin ${pluginName} stopped listening to ${event}`)
            },
            emit: (event: string, data: any) => {
              console.log(`Plugin ${pluginName} emitted ${event}:`, data)
            }
          },
          machine: {
            getStatus: () => ({ state: 'idle', position: { x: 0, y: 0, z: 0 } }),
            sendCommand: (cmd: string) => console.log(`Sending command: ${cmd}`)
          },
          logger: {
            info: (msg: string) => console.log(`[${pluginName}] ${msg}`),
            error: (msg: string) => console.error(`[${pluginName}] ${msg}`),
            debug: (msg: string) => console.debug(`[${pluginName}] ${msg}`)
          },
          storage: {
            get: (key: string) => localStorage.getItem(`plugin_${pluginName}_${key}`),
            set: (key: string, value: string) => localStorage.setItem(`plugin_${pluginName}_${key}`, value)
          }
        }

        // Initialize the plugin
        const pluginInstance = new PluginConstructor(mockAPI)
        pluginInstanceRef.current = pluginInstance

        // Initialize and mount the plugin
        await pluginInstance.initialize()
        if (containerRef.current) {
          await pluginInstance.mount(containerRef.current)
        }

      } catch (error) {
        console.error(`Failed to load plugin ${pluginName}:`, error)
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="padding: 20px; border: 1px solid red; color: red;">
              Failed to load plugin: ${pluginName}
              <br>Error: ${error.message}
            </div>
          `
        }
      }
    }

    loadPlugin()

    // Cleanup function
    return () => {
      if (pluginInstanceRef.current) {
        pluginInstanceRef.current.unmount?.()
        pluginInstanceRef.current.destroy?.()
      }
    }
  }, [pluginPath, pluginName])

  return <div ref={containerRef} className="plugin-container" />
}
```

### Step 3: Add Plugin to Dashboard

Update `src/views/Dashboard/DashboardView.tsx` to include your plugin:

```tsx
// Add this import at the top
import { PluginContainer } from '../../components/PluginContainer'

// Add this section in your dashboard grid (after line 297)
{/* Custom Plugins */}
<Col xs={24} lg={12}>
  <Card title="My First Plugin">
    <PluginContainer 
      pluginPath="../plugins/my-first-plugin/src/index.js"
      pluginName="my-first-plugin"
    />
  </Card>
</Col>
```

## Method 2: Plugin Registry Integration

### Step 1: Register Your Plugin

Create `src/plugins/registry.js`:

```javascript
// Plugin Registry - List of available plugins
export const pluginRegistry = [
  {
    id: 'my-first-plugin',
    name: 'My First Plugin',
    description: 'A simple example plugin',
    category: 'utility',
    path: './my-first-plugin/src/index.js',
    enabled: true,
    version: '1.0.0'
  },
  // Add more plugins here
]

export const loadPlugin = async (pluginConfig) => {
  try {
    const PluginModule = await import(pluginConfig.path)
    const PluginClass = PluginModule.default || PluginModule
    return new PluginClass()
  } catch (error) {
    console.error(`Failed to load plugin ${pluginConfig.id}:`, error)
    return null
  }
}
```

### Step 2: Create Plugin Manager Component

Create `src/components/PluginManager.tsx`:

```tsx
import React, { useState, useEffect } from 'react'
import { Card, Switch, Button, List, Badge } from 'antd'
import { pluginRegistry, loadPlugin } from '../plugins/registry'
import { PluginContainer } from './PluginContainer'

export const PluginManager: React.FC = () => {
  const [enabledPlugins, setEnabledPlugins] = useState<string[]>([])
  const [loadedPlugins, setLoadedPlugins] = useState<any[]>([])

  const togglePlugin = (pluginId: string, enabled: boolean) => {
    if (enabled) {
      setEnabledPlugins(prev => [...prev, pluginId])
    } else {
      setEnabledPlugins(prev => prev.filter(id => id !== pluginId))
    }
  }

  const loadAllPlugins = async () => {
    const plugins = []
    for (const config of pluginRegistry) {
      if (enabledPlugins.includes(config.id)) {
        const plugin = await loadPlugin(config)
        if (plugin) {
          plugins.push({ config, instance: plugin })
        }
      }
    }
    setLoadedPlugins(plugins)
  }

  useEffect(() => {
    loadAllPlugins()
  }, [enabledPlugins])

  return (
    <div className="plugin-manager">
      <Card title="Plugin Manager" style={{ marginBottom: 16 }}>
        <List
          dataSource={pluginRegistry}
          renderItem={(plugin) => (
            <List.Item
              actions={[
                <Switch
                  checked={enabledPlugins.includes(plugin.id)}
                  onChange={(checked) => togglePlugin(plugin.id, checked)}
                />
              ]}
            >
              <List.Item.Meta
                title={plugin.name}
                description={plugin.description}
              />
              <Badge text={plugin.category} />
            </List.Item>
          )}
        />
      </Card>

      {/* Render enabled plugins */}
      {loadedPlugins.map(({ config }) => (
        <Card key={config.id} title={config.name} style={{ marginBottom: 16 }}>
          <PluginContainer 
            pluginPath={config.path}
            pluginName={config.id}
          />
        </Card>
      ))}
    </div>
  )
}
```

### Step 3: Add Plugin Manager to Navigation

Update the main navigation to include a "Plugins" section.

## Method 3: Quick Test Integration

For immediate testing, add this to any existing component:

```tsx
// In any component file, add this simple integration:

import React, { useEffect, useRef } from 'react'

const QuickPluginTest: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const testPlugin = async () => {
      try {
        // Load your plugin
        const response = await fetch('/my-plugins/my-first-plugin/src/index.js')
        const pluginCode = await response.text()
        
        // Create a simple execution context
        const mockAPI = {
          events: { on: () => {}, off: () => {}, emit: () => {} },
          machine: { getStatus: () => ({}) },
          logger: { info: console.log, error: console.error }
        }

        // Execute the plugin code
        eval(pluginCode)
        
        // Assuming the plugin creates a global class
        const PluginClass = window.myfirstpluginPlugin
        const plugin = new PluginClass(mockAPI)
        
        await plugin.initialize()
        if (containerRef.current) {
          await plugin.mount(containerRef.current)
        }

      } catch (error) {
        console.error('Plugin test failed:', error)
      }
    }

    testPlugin()
  }, [])

  return <div ref={containerRef} style={{ padding: '20px' }} />
}

export default QuickPluginTest
```

## Step-by-Step Quick Start

1. **Copy your plugin**:
   ```bash
   cp -r my-plugins/my-first-plugin src/plugins/
   ```

2. **Create the PluginContainer component** (copy the code above)

3. **Add to Dashboard** by editing `DashboardView.tsx`

4. **Test it** by starting the application

## File Locations Summary

```
src/
├── components/
│   ├── PluginContainer.tsx     # Plugin wrapper component
│   └── PluginManager.tsx       # Plugin management UI
├── plugins/
│   ├── registry.js             # Plugin registry
│   └── my-first-plugin/        # Your copied plugin
└── views/Dashboard/
    └── DashboardView.tsx       # Updated with plugin
```

## Testing Your Integration

1. Start the development server
2. Navigate to the dashboard
3. Look for your plugin card
4. Check the browser console for plugin logs
5. Interact with your plugin's UI

Your plugin should now be visible and functional in the CNC Jog Controls interface!