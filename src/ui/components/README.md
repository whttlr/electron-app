# UI Components Module

## Purpose
The UI components module contains reusable, domain-specific components that combine adapters and business logic. These components are tailored for CNC control application needs while maintaining reusability.

## Architecture
Components are organized by feature domain:
- **Animated**: Animation-enhanced components for smooth transitions
- **Charts**: Data visualization components for machine metrics
- **Layout**: Responsive layout components for different screen sizes
- **Mobile Navigation**: Touch-optimized navigation for mobile devices
- **Monitoring Dashboard**: Real-time machine monitoring displays
- **Notifications**: User notification and alert systems
- **Orientation Adapter**: Components that adapt to device orientation
- **Touch Optimized**: Components optimized for touch interactions

## Key Components

### Charts
- **AreaChart**: Time-series data visualization
- **BarChart**: Categorical data comparison
- **LineChart**: Continuous data trends
- **PieChart**: Proportional data display
- **MetricCard**: Key performance indicators
- **MachineDashboard**: Comprehensive machine status display

### Mobile-Optimized
- **TouchButton**: Large, touch-friendly buttons
- **TouchJogControls**: Touch-based machine positioning
- **MobileNavigationBar**: Bottom navigation for mobile screens
- **OrientationAdapter**: Responsive layout based on device orientation

### Monitoring
- **MonitoringDashboard**: Real-time machine status overview
- **NotificationSystem**: User alerts and status messages

## Usage
```typescript
import { TouchJogControls, MachineDashboard } from '@/ui/components';

// Components include business logic and are domain-specific
<TouchJogControls 
  onJog={handleJog} 
  currentPosition={position}
  sensitivity="high"
/>
```

## Configuration
Component behavior and defaults are configured in `config.ts`.

## Testing
- Unit tests for component logic and rendering
- Integration tests for component interactions
- Mobile-specific tests for touch interactions
- Accessibility tests for all components