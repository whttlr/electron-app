# CNC Jog Controls

Welcome to **CNC Jog Controls** - a professional CNC machine control application with an extensible plugin architecture.

## What is CNC Jog Controls?

CNC Jog Controls is a React/TypeScript-based desktop application designed for precision CNC machine control. It combines:

- **Professional CNC Control Interface** - Manual jog controls, real-time position tracking, and safety features
- **3D Visualization** - Interactive working area preview with Three.js integration
- **Extensible Plugin System** - Dynamic plugin loading with multiple placement options
- **Modern Architecture** - Built with React, TypeScript, and Electron for cross-platform desktop deployment

## Key Features

### 🎛️ CNC Control Interface
- Manual machine positioning (X/Y/Z axes)
- Real-time coordinate tracking
- Safety features and connection monitoring
- Emergency controls

### 🌐 3D Visualization
- Interactive working area preview
- Tool tracking and position display
- 2D top-down view with coordinate grid
- Sync with machine state

### 🔧 Plugin System
- **Dashboard Cards** - Integrated into main dashboard
- **Standalone Screens** - Full-screen applications
- **Modal Dialogs** - Popup interfaces
- **Sidebar Panels** - Compact side-mounted tools

For plugin development, visit our [Plugin Registry](https://whttlr.github.io/plugin-registry/).

## Getting Started

Get started by [installing the application](./getting-started/installation) or jump straight to the [basic controls guide](./getting-started/basic-controls).

## Architecture

The application follows a strict **self-contained module architecture** with clear separation of concerns:

- **Core** - Machine control functionality and business logic
- **Services** - Cross-module services and state management  
- **UI** - User interface components organized by feature
- **Views** - Application screens and routing
- **Utils** - Pure utility functions

Learn more about the [project architecture](./architecture/overview).