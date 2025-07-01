# Plugin Development Tools - Troubleshooting Guide

## Common Issues and Solutions

### ❌ TypeScript Compilation Errors

**Problem**: Getting TypeScript errors like "Type parameter declaration expected" or i18next-related errors.

**Solution**: This is due to version conflicts. Try these approaches:

#### Option 1: Use the Fixed Setup Script
```bash
./scripts/setup-dev-tools-fixed.sh
```

#### Option 2: Use Manual Setup (Bypasses npm linking)
```bash
./scripts/setup-manual.sh
```

#### Option 3: Clean and Reinstall
```bash
cd tools/plugin-cli
rm -rf node_modules package-lock.json
npm install --no-package-lock
```

### ❌ "Command not found" after installation

**Problem**: `cnc-plugin: command not found`

**Solutions**:

#### Check npm global path
```bash
npm config get prefix
echo $PATH
```

#### Add npm global bin to PATH
```bash
export PATH="$(npm config get prefix)/bin:$PATH"
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### Use npx instead
```bash
cd tools/plugin-cli
npx ts-node src/cli.ts create my-plugin
```

#### Use the manual setup
```bash
./scripts/setup-manual.sh
export PATH="$(pwd)/bin:$PATH"
```

### ❌ Permission Errors on macOS/Linux

**Problem**: EACCES permission errors when installing globally.

**Solutions**:

#### Fix npm permissions
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### Use Node Version Manager (Recommended)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install and use latest Node.js
nvm install node
nvm use node
```

### ❌ Windows PowerShell Execution Policy

**Problem**: Cannot run scripts on Windows.

**Solution**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ❌ Module Resolution Errors

**Problem**: Cannot find module errors during build.

**Solutions**:

#### Clear all caches
```bash
cd tools/plugin-cli
rm -rf node_modules package-lock.json dist
npm cache clean --force
npm install
```

#### Use the manual setup
```bash
./scripts/setup-manual.sh
```

## Alternative Usage Methods

### Method 1: Direct npx usage (Always works)
```bash
# From tool directories
cd tools/plugin-cli
npx ts-node src/cli.ts create my-plugin

cd ../marketplace-client  
npx ts-node src/cli.ts search visualization

cd ../api-docs-generator
npx ts-node src/cli.ts generate src
```

### Method 2: Shell aliases
```bash
# Add to ~/.bashrc or ~/.zshrc
alias cnc-plugin='cd /path/to/electron-app/tools/plugin-cli && npx ts-node src/cli.ts'
alias cnc-marketplace='cd /path/to/electron-app/tools/marketplace-client && npx ts-node src/cli.ts'
alias cnc-api-docs='cd /path/to/electron-app/tools/api-docs-generator && npx ts-node src/cli.ts'
```

### Method 3: Package scripts
Add to your project's package.json:
```json
{
  "scripts": {
    "plugin:create": "cd tools/plugin-cli && npx ts-node src/cli.ts create",
    "plugin:dev": "cd tools/plugin-cli && npx ts-node src/cli.ts dev",
    "marketplace:search": "cd tools/marketplace-client && npx ts-node src/cli.ts search"
  }
}
```

Then use:
```bash
npm run plugin:create my-plugin
npm run marketplace:search visualization
```

## Verify Installation

### Test each tool individually
```bash
# Test Plugin CLI
cd tools/plugin-cli
npx ts-node src/cli.ts --help

# Test Marketplace Client
cd ../marketplace-client
npx ts-node src/cli.ts --help

# Test API Docs Generator
cd ../api-docs-generator  
npx ts-node src/cli.ts --help
```

### Check dependencies
```bash
node --version  # Should be 18+
npm --version   # Should be 8+
npx --version   # Should be available
```

## Getting Help

If you're still having issues:

1. **Check the logs** - Look for specific error messages
2. **Try the manual setup** - `./scripts/setup-manual.sh`
3. **Use direct npx** - Bypass global installation entirely
4. **Check Node.js version** - Ensure you have Node.js 18+
5. **Clear all caches** - `npm cache clean --force`

## Emergency Fallback

If nothing works, you can still create plugins manually:

1. Copy an example plugin directory
2. Modify the files directly
3. Use your preferred development tools
4. Reference the documentation in `docs/plugins/`

The plugin system works with any development setup - the CLI tools are just for convenience!