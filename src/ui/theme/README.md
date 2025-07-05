# UI Theme Module

## Purpose
The UI theme module provides comprehensive theming capabilities for the CNC control application. It manages design tokens, component styles, responsive breakpoints, and theme switching functionality.

## Architecture
Theme system is organized by concerns:
- **Design Tokens**: Core design values (colors, typography, spacing)
- **Component Styles**: Component-specific styling configurations
- **Responsive Breakpoints**: Screen size and device-specific adaptations
- **Theme Variants**: Light, dark, and high-contrast theme variations

## Key Components

### Design Tokens (tokens.ts)
- **Color System**: Primary, secondary, semantic colors
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale for layouts
- **Shadows**: Elevation and depth styling
- **Border Radius**: Consistent corner styling
- **Z-Index**: Layer stacking order

### Component Styles (component-styles.ts)
- **Button Styles**: Variants, sizes, states
- **Form Styles**: Input fields, validation states
- **Card Styles**: Content container styling
- **Navigation Styles**: Menu and navigation elements
- **Data Display**: Tables, lists, grids
- **Feedback**: Alerts, notifications, loading states

### Responsive System (responsive.ts)
- **Breakpoints**: Mobile, tablet, desktop breakpoints
- **Grid System**: Flexible grid layouts
- **Container Sizes**: Maximum widths and padding
- **Typography Scale**: Responsive font sizing
- **Spacing Scale**: Responsive spacing adjustments

## Usage
```typescript
import { useTheme, tokens, breakpoints } from '@/ui/theme';

// Using theme tokens
const Button = styled.button`
  background: ${tokens.colors.primary};
  padding: ${tokens.spacing.md};
  border-radius: ${tokens.borderRadius.md};
  font-size: ${tokens.typography.fontSize.md};
`;

// Using responsive breakpoints
const ResponsiveContainer = styled.div`
  width: 100%;
  
  @media (min-width: ${breakpoints.md}) {
    width: 80%;
  }
`;

// Using theme hook
const MyComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div style={{ color: theme.colors.text }}>
      <button onClick={toggleTheme}>
        Switch to {theme.mode === 'light' ? 'dark' : 'light'} mode
      </button>
    </div>
  );
};
```

## Theme Structure
```typescript
interface Theme {
  mode: 'light' | 'dark' | 'high-contrast';
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    surface: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: { xs: string; sm: string; md: string; lg: string; xl: string };
    fontWeight: { light: number; normal: number; bold: number };
    lineHeight: { tight: number; normal: number; loose: number };
  };
  spacing: {
    xs: string; sm: string; md: string; lg: string; xl: string;
  };
  shadows: {
    sm: string; md: string; lg: string;
  };
  borderRadius: {
    sm: string; md: string; lg: string;
  };
}
```

## Theme Variants

### Light Theme
- Clean, professional appearance
- High contrast for readability
- Optimized for daylight use

### Dark Theme
- Reduced eye strain in low light
- Professional appearance
- OLED-friendly dark backgrounds

### High Contrast Theme
- Accessibility-focused
- Enhanced contrast ratios
- Improved readability for vision impairments

## Configuration
Theme behavior and customization options are configured in `config.ts`.

## Testing
- Unit tests for theme token consistency
- Visual regression tests for theme switching
- Accessibility tests for color contrast
- Cross-browser compatibility tests