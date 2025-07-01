# Plugin UI Placement Guide

This guide explains how to configure where and how your plugin appears in the CNC Jog Controls interface.

## UI Configuration

Add a `ui` section to your plugin's `package.json` manifest:

```json
{
  "cncPlugin": {
    "apiVersion": "1.0.0",
    "category": "utility",
    "displayName": "My Plugin",
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
  }
}
```

## Placement Options

### `placement` - Where the plugin UI appears

- **`dashboard`** - Plugin appears as a card on dashboard screens
- **`standalone`** - Plugin gets its own dedicated screen/view
- **`modal`** - Plugin opens in a modal dialog
- **`sidebar`** - Plugin appears in a collapsible sidebar
- **`controls`** - Plugin integrates into control panels
- **`machine`** - Plugin appears on machine status screens
- **`workspace`** - Plugin appears in workspace management areas

### `screen` - Which screen the plugin targets

- **`main`** - Main dashboard (default)
- **`new`** - Creates a new screen for the plugin
- **`controls`** - Jog controls screen
- **`machine`** - Machine status screen
- **`workspace`** - Workspace management screen
- **`settings`** - Settings/configuration screen

## Size Configuration

### `width` - Grid column span
- **Numbers 1-24**: Ant Design grid columns (24 = full width)
- **`"auto"`**: Automatically sized

### `height` - Container height
- **Numbers**: Fixed height in pixels (e.g., 300)
- **`"auto"`**: Height adjusts to content

## Priority

**`priority`** - Display order (higher numbers appear first)
- **0-50**: Low priority (bottom of screen)
- **51-100**: Normal priority (middle)
- **101-200**: High priority (top of screen)

## Configuration Examples

### Small Dashboard Widget
```json
"ui": {
  "placement": "dashboard",
  "screen": "main",
  "size": {
    "width": 6,
    "height": 200
  },
  "priority": 75
}
```

### Full-Width Status Panel
```json
"ui": {
  "placement": "dashboard", 
  "screen": "machine",
  "size": {
    "width": 24,
    "height": "auto"
  },
  "priority": 150
}
```

### Standalone Plugin Screen
```json
"ui": {
  "placement": "standalone",
  "screen": "new",
  "size": {
    "width": "auto",
    "height": "auto"
  },
  "priority": 100
}
```

### Control Panel Integration
```json
"ui": {
  "placement": "controls",
  "screen": "controls", 
  "size": {
    "width": 8,
    "height": 150
  },
  "priority": 120
}
```

### Modal Dialog Plugin
```json
"ui": {
  "placement": "modal",
  "screen": "main",
  "size": {
    "width": "auto",
    "height": 400
  },
  "priority": 100
}
```

## Responsive Behavior

### Grid Breakpoints
- **xs**: Extra small screens (phones)
- **lg**: Large screens (desktops)

The system automatically handles responsive behavior:
- Plugins use `xs={24}` for full width on mobile
- Desktop width is determined by your `width` setting

### Auto-sizing
- **width: "auto"** - Plugin takes available space
- **height: "auto"** - Plugin height adjusts to content
- **Fixed values** - Plugin maintains specified dimensions

## Implementation Details

### Dashboard Integration
```tsx
// Plugins are automatically rendered based on configuration
{renderPluginsForScreen('main', 'dashboard')}
```

### Screen Targeting
- Plugins only appear on their target screen
- Multiple plugins can target the same screen
- Priority determines display order

### Dynamic Loading
- Plugins are loaded based on their placement configuration
- UI configuration is read from package.json manifest
- Size and positioning are applied automatically

## Best Practices

### Size Guidelines
- **Small widgets**: 6-8 columns wide
- **Medium panels**: 12 columns wide  
- **Large displays**: 18-24 columns wide
- **Use auto height** unless you need fixed dimensions

### Priority Strategy
- **System plugins**: 150-200 (machine status, core controls)
- **User plugins**: 50-149 (custom functionality)
- **Debug/dev tools**: 1-49 (development helpers)

### Screen Selection
- **Dashboard plugins**: Use "main" screen for general purpose
- **Specialized tools**: Use appropriate target screens
- **New screens**: Only for complex, standalone functionality

### Performance Considerations
- Plugins on non-visible screens are not loaded
- Large plugins should use lazy loading
- Multiple small plugins perform better than one large plugin

## Migration Guide

### Existing Plugins
Add UI configuration to existing plugins:

```json
// Before (no UI config)
"cncPlugin": {
  "apiVersion": "1.0.0",
  "category": "utility"
}

// After (with UI config)
"cncPlugin": {
  "apiVersion": "1.0.0", 
  "category": "utility",
  "ui": {
    "placement": "dashboard",
    "screen": "main",
    "size": { "width": 12, "height": "auto" },
    "priority": 100
  }
}
```

### Defaults
If no UI configuration is provided:
- **placement**: "dashboard"
- **screen**: "main"
- **width**: 12
- **height**: "auto"
- **priority**: 100

This ensures backward compatibility with existing plugins.