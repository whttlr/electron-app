# CNC Control User Guide

Welcome to the CNC Control application - a modern, touch-optimized interface for industrial CNC machine control. This guide will help you get started and make the most of the application's features.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Mobile & Touch Usage](#mobile--touch-usage)
4. [CNC Controls](#cnc-controls)
5. [Job Management](#job-management)
6. [Settings & Configuration](#settings--configuration)
7. [Offline Mode](#offline-mode)
8. [Accessibility Features](#accessibility-features)
9. [Troubleshooting](#troubleshooting)
10. [Safety Guidelines](#safety-guidelines)

## Getting Started

### System Requirements

**Minimum Requirements:**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- 4GB RAM
- 1GB free storage space
- Network connection for initial setup

**Recommended for Optimal Performance:**
- Chrome 100+ or Firefox 100+
- 8GB RAM
- Touch-enabled display (for mobile/tablet use)
- Stable network connection

### First Time Setup

1. **Access the Application**
   - Open your web browser
   - Navigate to your CNC Control application URL
   - The application will automatically detect your device type

2. **Device Optimization**
   - On mobile/tablet: Install as PWA for best experience
   - On desktop: Bookmark for easy access
   - Enable notifications for machine alerts

3. **Initial Configuration**
   - Connect to your CNC machine
   - Configure working area dimensions
   - Set up user preferences

### Installation as PWA (Progressive Web App)

For the best mobile experience:

1. **On Mobile Devices:**
   - Open the app in your browser
   - Look for "Install App" or "Add to Home Screen" prompt
   - Follow the installation instructions
   - Launch from your home screen

2. **Benefits of PWA Installation:**
   - Works offline
   - Faster loading
   - Full-screen experience
   - Native app-like feel
   - Background notifications

## Interface Overview

### Dashboard Layout

The CNC Control interface adapts to your device:

**Mobile/Portrait Mode:**
- Bottom navigation bar
- Tabbed interface (Controls, Status, Jobs)
- Swipe gestures for navigation
- Large touch targets

**Tablet/Landscape Mode:**
- Side navigation panel
- Multi-column layout
- Drag-and-drop support
- Context menus

**Desktop Mode:**
- Full sidebar navigation
- Multi-window layout
- Keyboard shortcuts
- Mouse interactions

### Main Navigation

- **Dashboard** 📊 - Overview and status monitoring
- **Controls** 🎛️ - Manual machine control and jogging
- **Jobs** 📋 - Job queue and execution management
- **Settings** ⚙️ - Configuration and preferences
- **Plugins** 🔌 - Additional tools and extensions

### Status Indicators

- **🟢 Green:** Connected and operational
- **🟡 Yellow:** Warning or attention needed
- **🔴 Red:** Error or emergency state
- **⚫ Gray:** Disconnected or offline

## Mobile & Touch Usage

### Touch Gestures

**Basic Interactions:**
- **Tap:** Select or activate
- **Long Press:** Context menu or continuous action
- **Swipe:** Navigate between screens
- **Pinch/Zoom:** Scale visualization (where applicable)

**CNC-Specific Gestures:**
- **Single Tap on Jog:** Single step movement
- **Long Press on Jog:** Continuous movement
- **Emergency Tap:** Quick stop (double-tap emergency button)

### Orientation Support

The app automatically adapts to device orientation:

**Portrait Mode:**
- Optimized for one-handed use
- Bottom navigation
- Stacked layout

**Landscape Mode:**
- Two-column layout
- Side navigation
- Better for detailed work

### Touch Optimization Features

- **Large Touch Targets:** Minimum 44px for accessibility
- **Haptic Feedback:** Vibration confirmation on actions
- **Visual Feedback:** Button press animations
- **Gesture Recognition:** Smart gesture detection
- **Accidental Touch Prevention:** Touch delay for critical actions

## CNC Controls

### Manual Jog Controls

**Basic Jogging:**
1. Select step size (0.1mm, 1mm, 10mm, 100mm)
2. Tap direction buttons for single steps
3. Long press for continuous movement
4. Use emergency stop to halt all movement

**Step Size Selection:**
- Choose appropriate step size for precision
- Smaller steps for fine positioning
- Larger steps for rapid positioning

**Coordinate System:**
- **X-Axis:** Left (-) / Right (+)
- **Y-Axis:** Back (-) / Front (+)  
- **Z-Axis:** Down (-) / Up (+)

### Safety Features

**Boundary Protection:**
- Automatic boundary checking
- Movement prevention beyond working area
- Visual warnings for limit approach

**Emergency Controls:**
- Large, accessible emergency stop button
- Immediate halt of all operations
- System lock until manual reset

**Lock Controls:**
- Prevent accidental movements
- Toggle lock/unlock as needed
- Visual indication of lock status

### Home Operations

**Home All Axes:**
- Returns all axes to home position
- Establishes coordinate reference
- Required after power-on or emergency stop

**Individual Axis Homing:**
- Home single axis as needed
- Useful for setup and calibration
- Available in advanced mode

## Job Management

### Job Queue

**Adding Jobs:**
1. Upload G-code files
2. Set job parameters
3. Add to queue
4. Review and validate

**Job Execution:**
- Start, pause, or stop jobs
- Monitor progress in real-time
- Receive completion notifications

**Job History:**
- View completed jobs
- Access job logs
- Repeat previous jobs

### File Management

**Supported Formats:**
- .gcode
- .nc
- .tap
- .txt (G-code text)

**File Operations:**
- Upload from device
- Download from cloud
- Share between devices
- Organize in folders

## Settings & Configuration

### Machine Configuration

**Working Area:**
- Set X, Y, Z dimensions
- Choose units (mm/inches)
- Define safe zones
- Configure limits

**Connection Settings:**
- Machine IP/USB configuration
- Communication parameters
- Timeout settings
- Retry behavior

### User Preferences

**Interface Settings:**
- Theme selection (light/dark)
- Language preferences
- Layout customization
- Notification settings

**Touch Settings:**
- Haptic feedback on/off
- Touch sensitivity
- Gesture recognition
- Long press duration

### Accessibility Options

**Visual Accessibility:**
- High contrast mode
- Large text option
- Color blind support
- Motion reduction

**Audio Accessibility:**
- Voice announcements
- Sound notifications
- Alert tones
- Volume controls

## Offline Mode

### Automatic Offline Detection

The app automatically detects when you're offline and:
- Switches to offline mode
- Shows offline indicator
- Queues commands for later sync
- Maintains local functionality

### Offline Capabilities

**Available Features:**
- View cached machine status
- Access job history
- Review documentation
- Configure settings
- Queue control commands

**Limited Features:**
- Real-time machine control
- Live status updates
- New job uploads
- Cloud synchronization

### Data Synchronization

**When Coming Back Online:**
- Automatic sync of queued commands
- Status update retrieval
- Conflict resolution
- Background synchronization

## Accessibility Features

### Screen Reader Support

- Full ARIA label support
- Semantic HTML structure
- Keyboard navigation
- Voice announcements

### Keyboard Navigation

- Tab through all controls
- Enter/Space to activate
- Arrow keys for jog control
- Escape for emergency stop

### High Contrast Mode

- Toggle in accessibility settings
- Enhanced visual contrast
- Better visibility in bright environments
- Customizable color schemes

### Voice Announcements

- Machine status updates
- Position announcements
- Alert notifications
- Confirmation messages

## Troubleshooting

### Common Issues

**Connection Problems:**
1. Check network connectivity
2. Verify machine IP address
3. Restart the application
4. Contact system administrator

**Performance Issues:**
1. Close unnecessary browser tabs
2. Clear browser cache
3. Check device storage
4. Restart browser

**Touch Issues:**
1. Clean screen surface
2. Check touch calibration
3. Restart application
4. Update browser

### Error Messages

**"Machine Not Connected"**
- Check physical connections
- Verify network settings
- Restart machine controller

**"Position Limit Exceeded"**
- Check working area settings
- Verify current position
- Perform home operation

**"Emergency Stop Active"**
- Reset emergency stop
- Check safety systems
- Clear any error conditions

### Getting Help

**In-App Support:**
- Help menu in settings
- Interactive tutorials
- Error reporting
- Contact support

**Additional Resources:**
- Online documentation
- Video tutorials
- Community forums
- Technical support

## Safety Guidelines

### Important Safety Rules

⚠️ **ALWAYS follow these safety guidelines:**

1. **Emergency Stop Access**
   - Keep emergency stop accessible
   - Know its location on all devices
   - Test emergency stop regularly

2. **Machine Awareness**
   - Maintain visual contact with machine
   - Be aware of tool and workpiece location
   - Understand current operation

3. **Proper Training**
   - Ensure operator training
   - Understand machine capabilities
   - Know safety procedures

4. **Environmental Conditions**
   - Adequate lighting
   - Clear workspace
   - Proper ventilation
   - Clean work area

### Before Operation Checklist

- [ ] Machine properly connected
- [ ] Working area clear of obstacles
- [ ] Emergency stop tested and accessible
- [ ] Proper safety equipment worn
- [ ] Machine homed and calibrated
- [ ] Job file verified and tested

### During Operation

- **Stay Alert:** Maintain focus on machine operation
- **Monitor Progress:** Watch for unusual behavior
- **Be Ready:** Keep hand near emergency stop
- **Communicate:** Coordinate with other operators

### Emergency Procedures

**If Something Goes Wrong:**
1. **Immediately press Emergency Stop**
2. **Power down the machine if necessary**
3. **Clear the work area**
4. **Report the incident**
5. **Do not restart until issue is resolved**

---

## Support and Contact

**Technical Support:** support@cnc-control.com  
**Documentation:** https://docs.cnc-control.com  
**Community Forum:** https://community.cnc-control.com  
**Emergency Contact:** [Your emergency contact information]

---

*This guide covers the essential features and operations. For advanced topics and detailed technical information, please refer to the complete documentation.*

**Version:** 1.0.0  
**Last Updated:** December 2024  
**© CNC Control Team - All rights reserved**