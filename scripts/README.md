# CNC Jog Controls Development Tools Setup

This directory contains scripts to set up the plugin development tools for local development.

## Quick Setup

### macOS/Linux
```bash
./scripts/setup-dev-tools.sh
```

### Windows
```cmd
scripts\setup-dev-tools.bat
```

## What Gets Installed

The setup script will install and link three CLI tools globally:

1. **`cnc-plugin`** - Plugin development CLI
2. **`cnc-marketplace`** - Marketplace client for publishing/installing
3. **`cnc-api-docs`** - API documentation generator

## Requirements

- Node.js 18 or later
- npm 8 or later

## Manual Setup

If you prefer to set up manually:

```bash
# Plugin CLI
cd tools/plugin-cli
npm install
npm run build
npm link

# Marketplace Client
cd ../marketplace-client
npm install
npm run build
npm link

# API Docs Generator
cd ../api-docs-generator
npm install
npm run build
npm link
```

## Usage After Setup

### Create a New Plugin
```bash
cnc-plugin create my-awesome-plugin
cd my-awesome-plugin
cnc-plugin dev  # Start development server
```

### Search Marketplace
```bash
cnc-marketplace search visualization
cnc-marketplace install awesome-plugin
```

### Generate API Documentation
```bash
cnc-api-docs generate src --output docs/api
cnc-api-docs serve docs/api
```

## Troubleshooting

### Command Not Found
If you get "command not found" errors:

1. Ensure Node.js is installed: `node --version`
2. Check if npm global bin is in PATH: `npm config get prefix`
3. Re-run the setup script
4. Try using npx: `npx cnc-plugin --help`

### Permission Errors
On macOS/Linux, you might need to fix npm permissions:

```bash
# Option 1: Use a Node version manager (recommended)
# Install nvm and use it to manage Node.js versions

# Option 2: Change npm's default directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Windows PowerShell Execution Policy
If you get execution policy errors on Windows:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Uninstalling

To remove the globally linked tools:

```bash
npm unlink -g @cnc-jog-controls/plugin-cli
npm unlink -g @cnc-jog-controls/marketplace-client
npm unlink -g @cnc-jog-controls/api-docs-generator
```

## Development

The tools are set up as symlinks, so any changes you make to the source code will be reflected in the global commands after rebuilding:

```bash
cd tools/plugin-cli
npm run build  # Rebuild after making changes
```