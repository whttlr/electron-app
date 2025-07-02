# Plugin System

The CNC Jog Controls plugin system allows you to extend functionality with custom tools, dashboards, and integrations.

## Plugin Types

### Dashboard Cards
Integrated cards that appear on the main dashboard alongside system information.

**Use cases:**
- Quick status displays
- Shortcut buttons
- Mini control panels

### Standalone Screens  
Full-screen applications with their own navigation menu items.

**Use cases:**
- Complex tools and utilities
- Data visualization dashboards
- Configuration interfaces

### Modal Dialogs
Popup interfaces for focused tasks.

**Use cases:**
- Settings and configuration
- Data entry forms
- Confirmation dialogs

### Sidebar Panels
Compact panels that slide in from the side.

**Use cases:**
- Quick reference information
- Tool palettes
- Mini calculators

## Installing Plugins

### From Plugin Registry

1. Navigate to **Plugins** → **Registry**
2. Browse available plugins
3. Click **Install** on desired plugin
4. Configure placement and settings
5. Plugin appears in target location

### Manual Installation

1. Download plugin `.zip` file
2. Go to **Plugins** → **Local**
3. Click **Upload Plugin**
4. Select the `.zip` file
5. Configure and enable

## Plugin Configuration

Each plugin can be configured for:

- **Placement**: Where the plugin appears
- **Screen**: Which screen(s) to show on
- **Size**: Dimensions (for cards/modals)
- **Priority**: Display order
- **Auto-start**: Launch on app startup
- **Permissions**: Access levels

## Popular Plugins

### Machine Monitor
Real-time machine status and performance metrics.
- **Type**: Dashboard Card + Standalone
- **Features**: Temperature monitoring, spindle speed, feed rates

### G-code Snippets
Quick access to commonly used G-code commands.
- **Type**: Sidebar Panel
- **Features**: Snippet library, custom commands, quick insert

### Tool Library
Comprehensive tool management system.
- **Type**: Standalone Screen
- **Features**: Tool database, offset management, wear tracking

### Quick Settings
Fast access to frequently changed settings.
- **Type**: Modal Dialog
- **Features**: Preset configurations, one-click changes

## Development

Want to create your own plugins? Visit our comprehensive [Plugin Registry Documentation](https://whttlr.github.io/plugin-registry/) for:

- [Getting Started Guide](https://whttlr.github.io/plugin-registry/docs/intro)
- [Development Setup](https://whttlr.github.io/plugin-registry/docs/development/overview)
- [API Reference](https://whttlr.github.io/plugin-registry/docs/tutorial-basics/create-a-document)
- [Publishing Guide](https://whttlr.github.io/plugin-registry/docs/tutorial-extras/manage-docs-versions)

## Plugin Marketplace

Discover and share plugins with the community:

🌐 **[Browse Plugin Registry →](https://whttlr.github.io/plugin-registry/plugins)**

The plugin registry provides:
- Curated plugin collection
- User ratings and reviews  
- Development tutorials
- Publishing guidelines