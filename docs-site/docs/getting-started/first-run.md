# First Run Guide

Welcome to CNC Jog Controls! This guide will walk you through your first startup and initial configuration.

## Initial Startup

When you first launch CNC Jog Controls, you'll see the main dashboard with several configuration options.

### 1. Dashboard Overview

The main dashboard provides:
- **Quick access cards** for common functions
- **Machine status** display
- **Plugin integration** area
- **Navigation menu** for different sections

### 2. Essential Configuration

Before connecting to your CNC machine, configure these essential settings:

#### Machine Settings
1. Go to **Settings → Machine**
2. Set your **working area dimensions**
3. Configure **axis directions** (if needed)
4. Set **units** (inches/millimeters)

#### Communication Settings
1. Select your **serial port** from the dropdown
2. Set the correct **baud rate** (typically 115200)
3. Choose your **protocol** (GRBL is default)
4. Test the connection

### 3. First Connection

#### Connect to Your Machine
1. Ensure your CNC controller is powered on
2. Connect the USB cable to your computer
3. In CNC Jog Controls, go to **Controls**
4. Click **Connect** in the machine status area
5. You should see "Connected" status

#### Test Basic Movement
1. **Home your machine** (if equipped with limit switches)
2. Try small **jog movements** (0.001" or 0.01mm)
3. Verify movement directions are correct
4. Test the **emergency stop** function

## Understanding the Interface

### Navigation Areas

**Dashboard** (`/`)
- Main overview and quick access
- Plugin cards and shortcuts
- System status at a glance

**Controls** (`/controls`)
- Manual machine control
- 3D visualization
- Position displays and jog controls

**Plugins** (`/plugins`)
- Plugin management and installation
- Marketplace browsing
- Configuration options

**Settings** (`/settings`)
- Machine configuration
- UI preferences
- System settings

### Key Components

#### 3D Visualization
- **Interactive view** of your working area
- **Tool position** tracking
- **Zoom, pan, rotate** with mouse/trackpad
- **Grid display** for reference

#### Position Display
- **Machine coordinates** (absolute position)
- **Work coordinates** (relative to work zero)
- **Real-time updates** as machine moves

#### Jog Controls
- **Directional buttons** for X, Y, Z movement
- **Step size selection** (0.001" to 1.000")
- **Continuous mode** for hold-to-move
- **Speed control** for feed rates

## Common First-Run Tasks

### 1. Set Work Zero
1. Jog your machine to your desired work zero position
2. Click **Zero X**, **Zero Y**, and **Zero Z** as needed
3. Verify the work coordinates show (0, 0, 0)

### 2. Test Safety Features
1. Try the **Emergency Stop** button (red)
2. Test **soft limits** by approaching machine boundaries
3. Verify **connection monitoring** works by unplugging USB

### 3. Explore Plugins
1. Visit the **Plugins** section
2. Browse available plugins in the marketplace
3. Install a simple plugin like "Quick Settings"
4. Configure its placement and try it out

### 4. Customize Your Workspace
1. Go to **Settings → UI**
2. Choose your preferred theme
3. Adjust grid settings in visualization
4. Set your default jog step sizes

## Troubleshooting First Run

### Connection Issues

**Machine not detected**
- Check USB cable connection
- Verify correct serial port selected
- Try different baud rates (9600, 38400, 115200)
- Restart the application

**Wrong movement directions**
- Go to Settings → Machine → Axis Configuration
- Check "Invert Direction" for problem axes
- Test movements again

**No response to jog commands**
- Ensure machine is not in alarm state
- Try homing the machine (if equipped)
- Check if machine requires specific startup sequence

### Interface Issues

**3D view not working**
- Check if WebGL is enabled in your browser/system
- Try zooming out (scroll wheel)
- Reset view with the home button

**Slow performance**
- Close unnecessary applications
- Check system requirements
- Disable high-quality 3D rendering in settings

**Plugins not loading**
- Check internet connection for marketplace
- Try refreshing the plugins page
- Check firewall settings

## Next Steps

Once you have the basic setup working:

1. **[Learn the controls](./basic-controls)** - Master the jog interface
2. **[Explore features](../features/controls)** - Discover advanced capabilities  
3. **[Install plugins](../features/plugins)** - Extend functionality
4. **[Join the community](https://github.com/whttlr/electron-app/discussions)** - Get help and share tips

## Getting Help

If you encounter issues:

- **Documentation**: [Full documentation site](https://whttlr.github.io/electron-app/)
- **GitHub Issues**: [Report bugs or request features](https://github.com/whttlr/electron-app/issues)
- **Discussions**: [Community help and tips](https://github.com/whttlr/electron-app/discussions)
- **Plugin Registry**: [Plugin-specific help](https://whttlr.github.io/plugin-registry/)