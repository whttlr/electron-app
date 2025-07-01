# Machine Status Monitor Plugin

A comprehensive real-time machine status monitoring plugin for CNC Jog Controls. This plugin provides live updates of machine state, position, alarms, and performance metrics with a beautiful, responsive interface.

![Machine Status Monitor Screenshot](./assets/screenshot.png)

## Features

- **Real-time Status Updates** - Live machine state, mode, feed rate, and spindle speed
- **Position Tracking** - Work and machine coordinates with offset display
- **Alarm Management** - Active alarm display with acknowledgment and clearing
- **Performance Metrics** - Real-time charts for feed rate, spindle load, and axis loads
- **Connection Monitoring** - Visual connection status with quality indicators
- **Configurable Settings** - Update intervals, notifications, and debug options

## Installation

```bash
# Install from marketplace
cnc-marketplace install machine-status-monitor

# Or install locally
cd examples/plugins/machine-status-monitor
npm install
npm run build
```

## Usage

Once installed, the Machine Status Monitor will appear in your CNC Jog Controls plugin panel. The plugin automatically starts monitoring when activated.

### Main Features

#### Status Cards
The top section displays key machine parameters:
- **State** - Current machine state (Idle, Run, Hold, Alarm, etc.)
- **Mode** - Operating mode (Manual, Auto, MDI)
- **Feed Rate** - Current feed rate override percentage
- **Spindle** - Spindle speed in RPM or OFF status

#### Position Display
Track machine position in real-time:
- Switch between Work and Machine coordinate systems
- View current position for all axes (X, Y, Z, A, B, C)
- See active work offset (G54-G59)

#### Alarm Panel
Manage machine alarms effectively:
- Color-coded by severity (Error, Warning, Info)
- Acknowledge alarms to mark as seen
- Clear individual alarms or all at once
- Desktop notifications for new alarms (configurable)

#### Performance Charts
Monitor machine performance with interactive charts:
- **Overview** - All metrics on one chart
- **Feed Rate** - Feed rate percentage over time
- **Spindle Load** - Spindle load percentage
- **Axis Load** - Individual axis load percentages

### Settings

Access settings via the toggle panel in the bottom-right:

- **Update Interval** - How often to poll for updates (50-1000ms)
- **Show Debug Info** - Display raw data for troubleshooting
- **Alarm Notifications** - Enable/disable desktop notifications

## Development

### Project Structure

```
machine-status-monitor/
├── src/
│   ├── components/        # React components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── styles/           # CSS styles
│   ├── types/            # TypeScript types
│   └── index.tsx         # Plugin entry point
├── tests/                # Test files
├── assets/              # Static assets
└── package.json         # Plugin manifest
```

### Building

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build

# Run tests
npm test

# Type checking
npm run type-check
```

### Key Components

#### MachineStatusMonitor
The main component that orchestrates the entire UI.

#### StatusCard
Reusable component for displaying status values with icons.

#### PositionDisplay
Shows current machine position with coordinate system switching.

#### AlarmPanel
Manages and displays active alarms with actions.

#### PerformanceChart
Renders performance data using Recharts library.

#### ConnectionIndicator
Shows connection status with quality metrics.

### Hooks

#### useMachineStatus
Main hook for accessing machine data and methods:
```typescript
const {
  status,
  position,
  alarms,
  performance,
  isConnected,
  acknowledgeAlarm,
  clearAlarm,
  clearAllAlarms
} = useMachineStatus()
```

#### useSettings
Hook for managing plugin settings:
```typescript
const {
  settings,
  updateSetting,
  resetSettings,
  loading
} = useSettings()
```

## API Integration

The plugin uses the CNC Jog Controls Plugin API for:

### Events
- `machine.status.update` - Machine status changes
- `machine.position.update` - Position updates
- `machine.alarm.update` - Alarm events
- `machine.performance.update` - Performance data
- `machine.connection.change` - Connection status

### Commands
- `machine-status-monitor.reset` - Reset all monitor data
- `machine-status-monitor.export` - Export status history

### Settings
- Persistent storage of user preferences
- Real-time settings synchronization

## Testing

The plugin includes comprehensive tests:

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Performance Considerations

- Data points are limited to last 100 samples
- Charts use React.memo for optimization
- Position updates are throttled based on settings
- WebSocket connection for real-time updates

## Customization

### Styling
Modify `src/styles/index.css` to customize appearance. The plugin uses CSS variables for easy theming.

### Data Sources
Extend `useMachineStatus` hook to add custom data sources or modify update logic.

### Charts
Customize chart appearance and behavior in `PerformanceChart` component.

## Troubleshooting

### No Data Displayed
1. Check connection status indicator
2. Verify machine is connected
3. Enable debug mode to see raw data
4. Check browser console for errors

### Performance Issues
1. Increase update interval in settings
2. Reduce number of data points in charts
3. Disable unused features

### Alarm Notifications Not Working
1. Check browser notification permissions
2. Verify setting is enabled
3. Test with manual alarm trigger

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/update tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: https://docs.cnc-jog-controls.com/plugins/machine-status-monitor
- Issues: https://github.com/cnc-jog-controls/plugins/issues
- Community: https://community.cnc-jog-controls.com