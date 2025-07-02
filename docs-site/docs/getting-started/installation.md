# Installation

Get CNC Jog Controls running on your system in minutes.

## System Requirements

- **Node.js** 16.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** for development

## Download Options

### Pre-built Releases (Recommended)

Download the latest release for your platform:

- **macOS**: `.dmg` installer (Intel and Apple Silicon)
- **Windows**: `.exe` installer  
- **Linux**: `.AppImage` portable executable

**[📥 Download Latest Release →](/download)**

*All downloads are automatically built and tested with every release.*

### Development Installation

For development or customization:

```bash
# Clone the repository
git clone https://github.com/whttlr/electron-app.git
cd electron-app

# Install dependencies
npm install

# Start development server
npm start

# Or run in Electron
npm run electron:dev
```

## First Run

After installation:

1. **Launch the application**
2. **Configure machine settings** in Settings → Machine
3. **Set working area dimensions** 
4. **Test connection** to your CNC controller
5. **Calibrate coordinates** if needed

## Troubleshooting

### Common Issues

**Application won't start**
- Check Node.js version: `node --version`
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Connection issues**
- Verify serial port permissions
- Check cable connections
- Confirm baud rate settings

**Permission errors on macOS**
- Right-click app → Open (for unsigned builds)
- System Preferences → Security & Privacy → Allow app

### Getting Help

- [GitHub Issues](https://github.com/whttlr/electron-app/issues)
- [Documentation](../intro)
- [Plugin Registry](https://whttlr.github.io/plugin-registry/)

## Next Steps

- [First Run Guide](./first-run)
- [Basic Controls](./basic-controls)
- [Configuration](../architecture/configuration)