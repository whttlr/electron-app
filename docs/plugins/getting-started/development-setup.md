# Development Setup

This guide will help you set up a complete development environment for creating CNC Jog Controls plugins. We'll configure all the necessary tools, IDEs, and development workflows.

## Prerequisites

### System Requirements
- **Operating System:** Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Node.js:** Version 18.0 or higher ([Download](https://nodejs.org/))
- **npm:** Version 8.0 or higher (comes with Node.js)
- **Git:** Latest version ([Download](https://git-scm.com/))
- **Code Editor:** VS Code recommended ([Download](https://code.visualstudio.com/))

### Hardware Requirements
- **RAM:** 8GB minimum, 16GB recommended
- **Storage:** 10GB free space for development tools and projects
- **USB Port:** For CNC machine testing (optional)

## Step 1: Install Core Development Tools

### Install Node.js and npm
```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Verify installation
node --version  # Should show v18.0.0 or higher
npm --version   # Should show v8.0.0 or higher
```

### Install Plugin CLI Tool
```bash
# Install the CNC Jog Controls Plugin CLI globally
npm install -g @cnc-jog-controls/plugin-cli

# Verify installation
cnc-plugin --version
cnc-plugin --help
```

### Install Additional Development Tools
```bash
# Install TypeScript globally (optional but recommended)
npm install -g typescript

# Install development utilities
npm install -g npm-check-updates
npm install -g concurrently
npm install -g cross-env
```

## Step 2: IDE Configuration

### VS Code Setup
Download and install [Visual Studio Code](https://code.visualstudio.com/). Then install these recommended extensions:

#### Essential Extensions
```bash
# Install via command line (or use the Extensions panel)
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
```

#### Plugin Development Extensions
```bash
# React and TypeScript support
code --install-extension ms-vscode.vscode-react-refactor
code --install-extension jpoissonnier.vscode-styled-components
code --install-extension ms-vscode.vscode-json

# Testing and debugging
code --install-extension ms-vscode.vscode-jest
code --install-extension ms-vscode.vscode-test-explorer

# Git integration
code --install-extension eamodio.gitlens
code --install-extension github.vscode-pull-request-github
```

#### VS Code Settings
Create or update your VS Code settings (File > Preferences > Settings > Open Settings JSON):

```json
{
  "typescript.preferences.quoteStyle": "single",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.json": "jsonc"
  },
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "editor.rulers": [80, 120],
  "editor.wordWrap": "wordWrapColumn",
  "editor.wordWrapColumn": 120,
  "files.autoSave": "onFocusChange"
}
```

### Alternative IDEs

#### WebStorm Setup
If you prefer WebStorm:
1. Install [WebStorm](https://www.jetbrains.com/webstorm/)
2. Configure TypeScript integration
3. Install React and Node.js plugins
4. Set up ESLint and Prettier integration

#### Vim/Neovim Setup
For Vim users, install these plugins:
```vim
" Add to your .vimrc or init.vim
Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'leafgarland/typescript-vim'
Plug 'peitalin/vim-jsx-typescript'
Plug 'styled-components/vim-styled-components'
```

## Step 3: Project Workspace Setup

### Create Development Directory
```bash
# Create a dedicated workspace for plugin development
mkdir ~/cnc-plugin-development
cd ~/cnc-plugin-development

# Create directory structure
mkdir projects        # Individual plugin projects
mkdir templates       # Plugin templates
mkdir tools          # Development tools and utilities
mkdir docs           # Documentation and notes
```

### Clone Plugin Templates
```bash
# Clone official plugin templates
cd ~/cnc-plugin-development/templates
git clone https://github.com/cnc-jog-controls/plugin-template-basic.git
git clone https://github.com/cnc-jog-controls/plugin-template-ui.git
git clone https://github.com/cnc-jog-controls/plugin-template-machine.git
git clone https://github.com/cnc-jog-controls/plugin-template-typescript.git
```

### Set Up Plugin Development Workspace
Create a VS Code workspace file:

```json
// ~/cnc-plugin-development/cnc-plugins.code-workspace
{
  "folders": [
    {
      "path": "./projects"
    },
    {
      "path": "./templates"
    },
    {
      "path": "./tools"
    }
  ],
  "settings": {
    "typescript.preferences.includePackageJsonAutoImports": "auto",
    "search.exclude": {
      "**/node_modules": true,
      "**/dist": true,
      "**/build": true
    },
    "files.watcherExclude": {
      "**/node_modules/**": true,
      "**/dist/**": true,
      "**/build/**": true
    }
  },
  "extensions": {
    "recommendations": [
      "ms-vscode.vscode-typescript-next",
      "esbenp.prettier-vscode",
      "ms-vscode.vscode-eslint",
      "bradlc.vscode-tailwindcss",
      "ms-vscode.vscode-jest"
    ]
  }
}
```

## Step 4: Development Environment Configuration

### Environment Variables
Create a global environment configuration:

```bash
# ~/.bashrc or ~/.zshrc (on macOS/Linux)
export CNC_PLUGIN_DEV_HOME="$HOME/cnc-plugin-development"
export CNC_PLUGIN_CLI_LOG_LEVEL="debug"
export NODE_ENV="development"

# Windows (PowerShell profile)
$env:CNC_PLUGIN_DEV_HOME = "$env:USERPROFILE\cnc-plugin-development"
$env:CNC_PLUGIN_CLI_LOG_LEVEL = "debug"
$env:NODE_ENV = "development"
```

### Git Configuration for Plugin Development
```bash
# Configure Git for plugin development
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set up Git aliases for plugin development
git config --global alias.plugin-init '!f() { git init && git add . && git commit -m "Initial plugin setup"; }; f'
git config --global alias.plugin-release '!f() { npm version patch && git push && git push --tags; }; f'
```

### NPM Configuration
```bash
# Configure npm for faster installs
npm config set save-exact true
npm config set progress false
npm config set loglevel warn

# Set up npm registry (if using private registry)
# npm config set registry https://npm.your-company.com/
```

## Step 5: Development Tools Setup

### Install Plugin Development Server
```bash
# Install the development server globally
npm install -g @cnc-jog-controls/plugin-dev-server

# Verify installation
plugin-dev-server --version
```

### Set Up Testing Framework
```bash
# Install global testing tools
npm install -g jest
npm install -g @testing-library/jest-dom

# Create global Jest configuration
mkdir -p ~/.config/jest
```

Create `~/.config/jest/jest.config.js`:
```javascript
module.exports = {
  preset: '@cnc-jog-controls/jest-preset',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage'
}
```

### Browser Development Tools

#### Chrome DevTools Setup
1. Install [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
2. Install [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
3. Enable "Pause on exceptions" for debugging

#### Firefox Developer Tools
1. Install [React DevTools for Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
2. Enable developer tools in preferences

## Step 6: CNC Machine Integration Setup

### Virtual Machine Setup (for testing without hardware)
```bash
# Install virtual CNC machine simulator
npm install -g @cnc-jog-controls/cnc-simulator

# Start virtual machine
cnc-simulator --port /dev/ttyVirtual --baud 115200
```

### Real Machine Setup (optional)
If you have access to a real CNC machine:

1. **Install USB drivers** for your specific CNC controller
2. **Configure serial ports** 
   - Windows: Check Device Manager for COM ports
   - macOS: Look for `/dev/tty.usbserial-*` or `/dev/tty.usbmodem-*`
   - Linux: Usually `/dev/ttyUSB*` or `/dev/ttyACM*`
3. **Set appropriate permissions** (Linux/macOS):
   ```bash
   sudo usermod -a -G dialout $USER  # Linux
   # Logout and login again
   ```

## Step 7: Plugin CLI Configuration

### Initialize CLI Configuration
```bash
# Create CLI configuration directory
mkdir -p ~/.cnc-plugin-cli

# Initialize configuration
cnc-plugin config init
```

### Configure Default Settings
```bash
# Set default template
cnc-plugin config set defaultTemplate typescript

# Set default author info
cnc-plugin config set author.name "Your Name"
cnc-plugin config set author.email "your.email@example.com"
cnc-plugin config set author.url "https://github.com/yourusername"

# Set development preferences
cnc-plugin config set dev.autoReload true
cnc-plugin config set dev.openBrowser true
cnc-plugin config set dev.port 3001

# Set build preferences
cnc-plugin config set build.minify true
cnc-plugin config set build.sourceMaps true
cnc-plugin config set build.target es2020
```

View your configuration:
```bash
cnc-plugin config list
```

## Step 8: Create Your First Development Project

### Create a Test Plugin
```bash
cd ~/cnc-plugin-development/projects

# Create a new plugin project
cnc-plugin create test-plugin --template typescript

# Navigate to project
cd test-plugin

# Install dependencies
npm install

# Start development server
npm run dev
```

### Verify Development Setup
```bash
# Run tests
npm test

# Run linting
npm run lint

# Build plugin
npm run build

# Package plugin
npm run package
```

## Step 9: Development Workflow Scripts

### Create Useful Scripts
Create `~/cnc-plugin-development/scripts/dev-helpers.sh`:

```bash
#!/bin/bash

# Quick plugin creation
create-plugin() {
    if [ -z "$1" ]; then
        echo "Usage: create-plugin <plugin-name> [template]"
        return 1
    fi
    
    local name=$1
    local template=${2:-typescript}
    
    cd ~/cnc-plugin-development/projects
    cnc-plugin create "$name" --template "$template"
    cd "$name"
    code .
}

# Start development environment
start-dev() {
    if [ -z "$1" ]; then
        echo "Usage: start-dev <plugin-directory>"
        return 1
    fi
    
    cd ~/cnc-plugin-development/projects/$1
    npm run dev &
    cnc-plugin dev-server --watch &
    code .
}

# Clean all node_modules in workspace
clean-workspace() {
    find ~/cnc-plugin-development/projects -name "node_modules" -type d -exec rm -rf {} +
    echo "Cleaned all node_modules directories"
}

# Update all plugin dependencies
update-all() {
    for dir in ~/cnc-plugin-development/projects/*/; do
        if [ -f "$dir/package.json" ]; then
            echo "Updating $dir"
            cd "$dir"
            npm update
        fi
    done
}
```

Make the script executable:
```bash
chmod +x ~/cnc-plugin-development/scripts/dev-helpers.sh

# Add to your shell profile
echo "source ~/cnc-plugin-development/scripts/dev-helpers.sh" >> ~/.bashrc
```

## Step 10: Debugging Configuration

### VS Code Launch Configuration
Create `.vscode/launch.json` in your workspace:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Plugin",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/cnc-plugin",
      "args": ["dev", "--debug"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug Plugin in Browser",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3001",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ]
}
```

### Browser Debugging Setup
1. **Open Chrome DevTools** when debugging
2. **Enable source maps** in DevTools settings
3. **Set breakpoints** in your TypeScript source files
4. **Use console.log** strategically for debugging

## Troubleshooting Common Issues

### Node.js Issues
```bash
# Clear npm cache
npm cache clean --force

# Rebuild native modules
npm rebuild

# Check Node.js version
node --version
```

### Permission Issues (Linux/macOS)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Fix serial port permissions
sudo usermod -a -G dialout $USER
```

### VS Code Issues
```bash
# Reset VS Code extensions
code --disable-extensions
code --list-extensions --show-versions

# Clear VS Code cache
rm -rf ~/.vscode/extensions
```

### Plugin CLI Issues
```bash
# Reinstall CLI tool
npm uninstall -g @cnc-jog-controls/plugin-cli
npm install -g @cnc-jog-controls/plugin-cli

# Check CLI configuration
cnc-plugin config list
cnc-plugin doctor
```

## Performance Optimization

### Development Performance
- **Use SSD storage** for faster file operations
- **Increase Node.js memory limit** if needed:
  ```bash
  export NODE_OPTIONS="--max-old-space-size=8192"
  ```
- **Enable file watching exclusions** in VS Code settings
- **Use npm ci** instead of npm install for faster builds

### Build Performance
- **Use webpack caching** in development
- **Enable parallel processing** for TypeScript compilation
- **Minimize bundle analysis** tools usage in development

## Next Steps

Now that your development environment is set up:

1. **[Create Your First Plugin](./first-plugin.md)** - Follow the tutorial
2. **[Explore Plugin Types](../guides/plugin-types.md)** - Learn about different plugin categories
3. **[Read API Documentation](../api-reference/)** - Understand available APIs
4. **[Join the Community](https://discord.gg/cnc-jog-controls)** - Connect with other developers

## Getting Help

### Resources
- **[GitHub Issues](https://github.com/cnc-jog-controls/plugin-cli/issues)** - Report CLI issues
- **[Documentation](../README.md)** - Plugin development guides
- **[Discord Server](https://discord.gg/cnc-jog-controls)** - Real-time help
- **[Stack Overflow](https://stackoverflow.com/questions/tagged/cnc-jog-controls)** - Q&A community

### Common Commands Quick Reference
```bash
# Create new plugin
cnc-plugin create <name> --template <template>

# Start development
cnc-plugin dev

# Run tests
npm test

# Build plugin
npm run build

# Package for distribution
cnc-plugin package

# Install in main app
cnc-plugin install <plugin.zip>
```

Happy plugin development! 🚀