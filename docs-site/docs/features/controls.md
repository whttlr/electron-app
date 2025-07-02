# CNC Controls

The CNC Controls interface provides precise machine positioning and real-time monitoring capabilities.

## Jog Controls

### Manual Positioning

**X/Y/Z Axis Control**
- Incremental movement buttons
- Continuous jog mode
- Customizable step sizes (0.001" to 1.000")
- Home and zero functions

**Movement Options**
- **Step Mode**: Precise incremental movements
- **Continuous Mode**: Hold-to-move functionality  
- **Speed Control**: Variable feed rates
- **Emergency Stop**: Immediate motion halt

### Position Display

**Real-time Coordinates**
- Machine coordinates (absolute)
- Work coordinates (relative to work zero)
- Distance-to-go display
- Units switching (inches/mm)

## Safety Features

### Connection Monitoring
- Real-time connection status
- Automatic reconnection
- Communication error alerts
- Timeout protection

### Motion Safety
- Soft limits enforcement
- Emergency stop functionality
- Axis disable options
- Move validation

### Status Indicators
- Machine state display
- Active G-codes
- Spindle status
- Coolant status

## Working Area Visualization

### 3D Preview
- Interactive 3D working area
- Tool position visualization
- Path preview capabilities
- Camera controls (zoom, pan, rotate)

### 2D Top-down View
- Precise coordinate grid
- Tool position marker
- Work envelope display
- Measurement tools

## Configuration

Access controls configuration via **Settings → Machine**:

### Machine Setup
- Work area dimensions
- Axis limits and directions
- Homing sequences
- Units preference

### Communication
- Serial port selection
- Baud rate configuration
- Protocol settings
- Connection timeout

### Interface Options
- Button layouts
- Step size presets
- Display preferences
- Keyboard shortcuts

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| X+ | → Arrow |
| X- | ← Arrow |
| Y+ | ↑ Arrow |
| Y- | ↓ Arrow |
| Z+ | Page Up |
| Z- | Page Down |
| Emergency Stop | Space |
| Home All | H |

## Troubleshooting

**Common Issues:**

**No machine response**
- Check serial connection
- Verify baud rate settings
- Confirm cable integrity

**Incorrect movement direction**
- Review axis direction settings
- Check machine configuration
- Verify coordinate system

**Position drift**
- Calibrate machine
- Check mechanical connections
- Verify step/pulse settings