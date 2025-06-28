# Theme Module - Ant Design v5 Integration

Modern theming system with Ant Design v5 token-based architecture, dark mode support, and comprehensive design tokens.

## Overview

The theme module provides:
- **Ant Design v5 Token System**: Modern token-based theming with algorithms
- **Dark/Light Mode**: System preference detection with manual override
- **Design Token System**: Comprehensive color, spacing, typography tokens
- **CSS Custom Properties**: Advanced styling for non-Ant components
- **CNC-Specific Colors**: Machine status and axis color mappings
- **TypeScript Support**: Full type safety for theme configuration

## Usage

### Basic Setup with Ant Design v5

```typescript
import { ThemeProvider } from '@/ui/theme';

function App() {
  return (
    <ThemeProvider enableDarkMode={true}>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Using the Enhanced Theme Hook

```typescript
import { useTheme, useAntdTheme } from '@/ui/theme';

function MyComponent() {
  const { 
    themeConfig, 
    isDarkMode, 
    setDarkMode, 
    updateTheme, 
    antdTheme 
  } = useTheme();
  
  // Access Ant Design tokens directly
  const antdTokens = useAntdTheme();

  return (
    <div>
      <button onClick={() => setDarkMode(!isDarkMode)}>
        Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
      </button>
      
      <button onClick={() => updateTheme({ 
        primaryColor: '#ff4d4f',
        borderRadius: 12,
        spacing: 24 
      })}>
        Update Theme
      </button>

      <div style={{
        color: antdTokens.colorPrimary,
        padding: antdTokens.padding,
        borderRadius: antdTokens.borderRadius
      }}>
        Using Ant Design tokens directly
      </div>
    </div>
  );
}
```

### Advanced Theme Configuration

```typescript
import { CustomThemeConfig } from '@/ui/theme';

const customTheme: Partial<CustomThemeConfig> = {
  primaryColor: '#00b96b',
  borderRadius: 8,
  fontSize: 16,
  spacing: 20,
  axisColors: {
    x: '#52c41a', // Green for X
    y: '#ff4d4f', // Red for Y
    z: '#1890ff'  // Blue for Z
  },
  cncColors: {
    connected: '#52c41a',
    disconnected: '#8c8c8c',
    error: '#ff4d4f',
    warning: '#faad14',
    homing: '#1890ff',
    jogging: '#096dd9'
  }
};

<ThemeProvider initialTheme={customTheme} enableDarkMode={true}>
  <App />
</ThemeProvider>
```

## API Reference

### ThemeProvider Props

```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Partial<CustomThemeConfig>;
  enableDarkMode?: boolean; // Default: true
}
```

### useTheme Hook

Returns comprehensive theme context:

```typescript
interface ThemeContextType {
  themeConfig: CustomThemeConfig;      // Custom theme configuration
  isDarkMode: boolean;                 // Current dark mode state
  setDarkMode: (dark: boolean) => void; // Toggle dark mode
  updateTheme: (config: Partial<CustomThemeConfig>) => void; // Update theme
  antdTheme: AntdThemeConfig;          // Generated Ant Design theme
}
```

### useAntdTheme Hook

Direct access to Ant Design v5 design tokens:

```typescript
const tokens = useAntdTheme();
// Returns: colorPrimary, colorText, borderRadius, fontSize, etc.
```

### Theme Configuration Types

```typescript
interface CustomThemeConfig {
  primaryColor: string;      // Main brand color
  borderRadius: number;      // Global border radius in px
  fontSize: number;          // Base font size in px  
  spacing: number;           // Base spacing unit in px
  axisColors: AxisColors;    // CNC axis colors
  cncColors: CNCColors;      // Machine status colors
}

interface AxisColors {
  x: string;  // X-axis color
  y: string;  // Y-axis color
  z: string;  // Z-axis color
}

interface CNCColors {
  connected: string;     // Machine connected
  disconnected: string;  // Machine disconnected
  error: string;         // Error state
  warning: string;       // Warning state
  homing: string;        // Homing operation
  jogging: string;       // Jogging operation
}
```

## Ant Design v5 Token System

### Automatic Token Generation

The theme system automatically generates Ant Design tokens from your configuration:

```typescript
// Your configuration
const config = {
  primaryColor: '#1890ff',
  borderRadius: 6,
  fontSize: 14,
  spacing: 16
};

// Automatically generates Ant Design tokens
{
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 6,
    fontSize: 14,
    padding: 16,
    // ... many more derived tokens
  },
  components: {
    Button: { borderRadius: 6, controlHeight: 36 },
    Card: { borderRadius: 6, paddingLG: 24 },
    Input: { borderRadius: 6, controlHeight: 36 },
    // ... customized for all components
  }
}
```

### Algorithm Support

```typescript
// Automatic dark mode algorithm
const antdTheme = {
  algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: { /* ... */ }
};

// Multiple algorithms can be combined
const compactDarkTheme = {
  algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
  token: { /* ... */ }
};
```

### Component-Level Customization

```typescript
// Automatic component token generation
components: {
  Button: {
    borderRadius: themeConfig.borderRadius,
    controlHeight: 36,
    paddingInline: 16,
    fontWeight: 500,
  },
  Card: {
    borderRadius: themeConfig.borderRadius,
    headerBg: isDarkMode ? '#1f1f1f' : '#fafafa',
    paddingLG: themeConfig.spacing * 1.5,
  },
  Slider: {
    handleColor: themeConfig.primaryColor,
    trackBg: themeConfig.primaryColor,
  }
}
```

## CSS Custom Properties

### Automatic CSS Variable Generation

The theme automatically sets CSS custom properties for advanced styling:

```css
/* Theme configuration variables */
--primary-color: #1890ff;
--border-radius: 6px;
--font-size: 14px;
--spacing: 16px;

/* CNC-specific variables */
--axis-x-color: #52c41a;
--axis-y-color: #ff4d4f; 
--axis-z-color: #1890ff;
--cnc-connected-color: #52c41a;
--cnc-error-color: #ff4d4f;

/* Theme mode variables */
--bg-color: #ffffff;
--text-color: #000000;
--border-color: #d9d9d9;
--theme-mode: light;
```

### CSS Usage Examples

```css
.my-component {
  background: var(--primary-color);
  border-radius: var(--border-radius);
  padding: var(--spacing);
  color: var(--text-color);
}

.axis-indicator.x {
  color: var(--axis-x-color);
}

.machine-status.connected {
  color: var(--cnc-connected-color);
}

/* Data attribute selectors */
[data-theme="dark"] .my-component {
  background: var(--surface-color);
}
```

## Dark Mode Features

### System Integration

```typescript
// Automatic system preference detection
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Listen for system changes
mediaQuery.addEventListener('change', (e) => {
  if (noUserPreference) {
    setDarkMode(e.matches);
  }
});

// Persistent user preference
localStorage.setItem('jog-controls-dark-mode', 'true');
```

### CSS Variables by Mode

**Light Mode:**
```css
--bg-color: #ffffff;
--surface-color: #fafafa;
--text-color: #000000;
--text-secondary: #666666;
--border-color: #d9d9d9;
--hover-bg: #f5f5f5;
```

**Dark Mode:**
```css
--bg-color: #141414;
--surface-color: #1f1f1f;
--text-color: #ffffff;
--text-secondary: #b3b3b3;
--border-color: #424242;
--hover-bg: #262626;
```

## CNC-Specific Features

### Axis Color System

```typescript
// Consistent axis colors across the application
const axisColors = {
  x: '#52c41a', // Green - horizontal movement
  y: '#ff4d4f', // Red - depth movement  
  z: '#1890ff'  // Blue - vertical movement
};

// Usage in components
<AxisButton axis="x" style={{ color: 'var(--axis-x-color)' }}>
  X-Axis
</AxisButton>
```

### Machine Status Colors

```typescript
// Semantic status colors
const cncColors = {
  connected: '#52c41a',    // Success green
  disconnected: '#8c8c8c', // Neutral gray
  error: '#ff4d4f',        // Error red
  warning: '#faad14',      // Warning orange
  homing: '#1890ff',       // Process blue
  jogging: '#096dd9'       // Active blue
};

// Usage
<StatusIndicator 
  status="connected" 
  style={{ color: 'var(--cnc-connected-color)' }}
>
  Machine Online
</StatusIndicator>
```

## Migration from v4

### Key Differences

1. **Token-Based**: Replace LESS variables with design tokens
2. **Algorithm System**: Built-in dark mode and theme variations
3. **Component Tokens**: Individual component customization
4. **Better TypeScript**: Full type safety for theme configuration

### Migration Example

**Old v4 Approach:**
```typescript
// ConfigProvider with basic theme
<ConfigProvider 
  theme={{
    token: { colorPrimary: '#1890ff' }
  }}
>
```

**New v5 Approach:**
```typescript
// Comprehensive token-based theming
<ThemeProvider 
  initialTheme={{
    primaryColor: '#1890ff',
    borderRadius: 6,
    spacing: 16
  }}
>
```

## Performance Benefits

1. **Smaller Bundle**: Only customized tokens are included
2. **Better Caching**: Token-based system enables better CSS caching
3. **Efficient Updates**: Granular updates without full re-renders
4. **Algorithm Efficiency**: Built-in algorithms generate cohesive themes

## Testing

```bash
npm test -- --testPathPatterns=theme
```

Comprehensive test coverage includes:
- Token generation and updates
- Dark mode behavior
- CSS custom property updates
- Ant Design theme integration
- Component customization
- System preference detection

## Example Components

### Token Example Component

```typescript
import { TokenExample } from '@/ui/shared';

// Demonstrates token usage
<TokenExample />
```

This component shows:
- Custom theme tokens in use
- Ant Design generated tokens
- CSS custom properties
- Interactive theme updates
- Real-time theme changes

## Best Practices

1. **Use Design Tokens**: Always use predefined tokens instead of hardcoded values
2. **Component Tokens**: Leverage component-specific token customization
3. **CSS Variables**: Use CSS custom properties for non-Ant components
4. **Semantic Colors**: Use CNC-specific color constants for machine states
5. **Algorithm Benefits**: Leverage built-in algorithms for cohesive theming
6. **Type Safety**: Use TypeScript interfaces for theme configuration
7. **Performance**: Update tokens in batches for better performance

## Advanced Examples

### Custom Algorithm

```typescript
import type { MappingAlgorithm } from 'antd';

const cncAlgorithm: MappingAlgorithm = (seedToken, mapToken) => ({
  ...mapToken,
  // Custom CNC-specific token generation
  colorAxisX: seedToken.colorSuccess,
  colorAxisY: seedToken.colorError,
  colorAxisZ: seedToken.colorPrimary,
});

const customTheme = {
  algorithm: [theme.defaultAlgorithm, cncAlgorithm],
  token: { colorPrimary: '#1890ff' }
};
```

### Dynamic Theme Switching

```typescript
const ThemeSwitcher = () => {
  const { updateTheme } = useTheme();
  
  const themes = {
    blue: { primaryColor: '#1890ff' },
    green: { primaryColor: '#52c41a' },
    red: { primaryColor: '#ff4d4f' }
  };
  
  return (
    <Space>
      {Object.entries(themes).map(([name, theme]) => (
        <Button 
          key={name}
          onClick={() => updateTheme(theme)}
        >
          {name}
        </Button>
      ))}
    </Space>
  );
};
```

This modern theme system provides a robust foundation for consistent, accessible, and maintainable UI theming with full Ant Design v5 integration.