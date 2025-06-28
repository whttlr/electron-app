# JogControls Playground

A standalone mini app featuring the JogControls component extracted from the main jogger application.

## Features

- **Machine Position Controls**: 3D sliders for X, Y, Z axis positioning
- **Jog Controls**: Directional buttons for incremental movement
- **Settings Panel**: Configurable jog speed and increment distances
- **Debug Panel**: Real-time position monitoring and machine state
- **Mock Machine Interface**: Simulated machine state for testing

## What's Included

- Extracted JogControls component with all functionality
- Mock contexts replacing the original MachineContext and HighlightContext
- Simplified WorkspaceControls and WorkingAreaPreview components
- All UI components (SectionHeader, etc.) replicated
- Complete styling and color scheme from original

## Getting Started

### Installation

```bash
cd /Users/tylerhenry/Documents/GitHub/jogger/jogger/playground/jog-controls
npm install
```

### Running the App

```bash
npm start
```

The app will open in your browser at `http://localhost:3001`

### Building for Production

```bash
npm run build
```

## Component Structure

```
src/
├── components/
│   ├── JogControls.tsx           # Main component (extracted)
│   ├── SectionHeader.tsx         # UI helper component
│   ├── MockWorkspaceControls.tsx # Simplified workspace controls
│   └── MockWorkingAreaPreview.tsx # 3D preview placeholder
├── hooks/
│   ├── useMockMachine.ts         # Mock machine state management
│   └── useMockHighlight.ts       # Mock highlight context
├── constants.ts                  # Colors and constants
├── App.tsx                       # Main app wrapper
└── main.tsx                      # React entry point
```

## Key Changes from Original

1. **Isolated State**: Replaced context dependencies with local mock hooks
2. **Simplified Dependencies**: Removed complex 3D components, replaced with placeholders
3. **Hardcoded Values**: Machine dimensions and settings are now hardcoded for simplicity
4. **Self-Contained**: No external API calls or WebSocket connections

## Usage

The playground provides a fully functional jog control interface where you can:

- Move the machine position using the sliders
- Use directional buttons for precise movements
- Adjust jog speed and increment sizes
- Toggle debug information to see internal state
- Test all UI interactions without hardware

This makes it perfect for:
- UI development and testing
- Component integration testing
- Design iteration
- Demonstration purposes