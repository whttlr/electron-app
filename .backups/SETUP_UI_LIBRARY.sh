#!/bin/bash

# UI Library Repository Setup Script
# This script sets up the initial structure for the @whttlr/ui-library monorepo

set -e

UI_LIBRARY_PATH="/Users/tylerhenry/Desktop/whttlr/ui-library"

echo "🚀 Setting up @whttlr/ui-library repository structure..."

# Navigate to ui-library directory
cd "$UI_LIBRARY_PATH"

# Initialize package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo "📦 Creating root package.json..."
    cat > package.json << 'EOF'
{
  "name": "@whttlr/ui-library",
  "version": "0.0.0",
  "private": true,
  "description": "A comprehensive UI component library for CNC applications",
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "storybook": "turbo run storybook",
    "setup": "npm install && npm run build"
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "latest",
    "@types/node": "latest",
    "typescript": "latest",
    "rimraf": "latest",
    "eslint": "latest",
    "@typescript-eslint/parser": "latest",
    "@typescript-eslint/eslint-plugin": "latest",
    "eslint-plugin-react": "latest",
    "eslint-plugin-react-hooks": "latest"
  },
  "keywords": [
    "ui",
    "components",
    "cnc",
    "react",
    "typescript",
    "design-system"
  ],
  "author": "Whttlr Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/whttlr/ui-library.git"
  }
}
EOF
fi

# Create .gitignore
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Build outputs
dist/
build/
.turbo/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Coverage
coverage/
.nyc_output/

# Storybook
storybook-static/

# Test results
test-results/
playwright-report/
EOF

# Create turbo.json
echo "⚡ Creating turbo.json..."
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "storybook-static/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "storybook": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
EOF

# Create TypeScript configuration
echo "🔧 Creating TypeScript configuration..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "jsx": "react-jsx"
  },
  "include": [
    "packages/**/*",
    "apps/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ]
}
EOF

# Create package-specific TypeScript config
mkdir -p packages
cat > packages/tsconfig.json << 'EOF'
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.*", "**/*.spec.*"]
}
EOF

# Create ESLint configuration
echo "🔍 Creating ESLint configuration..."
cat > .eslintrc.js << 'EOF'
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
EOF

# Create Prettier configuration
echo "✨ Creating Prettier configuration..."
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
EOF

# Create Jest configuration
echo "🧪 Creating Jest configuration..."
cat > jest.config.js << 'EOF'
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@whttlr/ui-(.*)$': '<rootDir>/packages/$1/src',
  },
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx}',
    '!packages/*/src/**/*.stories.{ts,tsx}',
    '!packages/*/src/**/*.test.{ts,tsx}',
  ],
};
EOF

cat > jest.setup.js << 'EOF'
import '@testing-library/jest-dom';
EOF

# Create directory structure
echo "📁 Creating directory structure..."

# Core directories
mkdir -p packages/{core,theme,adapters,cnc,testing,icons,cli}
mkdir -p apps/{storybook,playground,documentation}
mkdir -p tools/{build,eslint,typescript,testing}
mkdir -p docs/{guides,api,migration}

# Core package structure
echo "📦 Setting up core package..."
mkdir -p packages/core/src/{primitives,complex,animated,mobile,providers,hooks,utils}
mkdir -p packages/core/src/primitives/{Button,Card,Badge,Alert,Input,Grid,Container}
mkdir -p packages/core/src/complex/{DataTable,Form,Modal,Navigation}
mkdir -p packages/core/src/animated/{AnimatedCard,AnimatedProgress,ScrollReveal,FloatingActionButton}
mkdir -p packages/core/src/mobile/{TouchButton,TouchControls,MobileNavigation,OrientationAdapter}

cat > packages/core/package.json << 'EOF'
{
  "name": "@whttlr/ui-core",
  "version": "0.0.0",
  "description": "Core UI components for Whttlr applications",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "jest",
    "lint": "eslint src/**/*.{ts,tsx}",
    "clean": "rimraf dist"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0"
  },
  "dependencies": {
    "@whttlr/ui-theme": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "latest",
    "@types/react-dom": "latest"
  }
}
EOF

cat > packages/core/src/index.ts << 'EOF'
// Primitives
export * from './primitives';

// Complex components
export * from './complex';

// Animated components
export * from './animated';

// Mobile components
export * from './mobile';

// Providers
export * from './providers';

// Hooks
export * from './hooks';

// Utils
export * from './utils';
EOF

# Theme package structure
echo "🎨 Setting up theme package..."
mkdir -p packages/theme/src/{tokens,themes,components,css}

cat > packages/theme/package.json << 'EOF'
{
  "name": "@whttlr/ui-theme",
  "version": "0.0.0",
  "description": "Design system and theme tokens for Whttlr applications",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "jest",
    "lint": "eslint src/**/*.{ts,tsx}",
    "clean": "rimraf dist"
  }
}
EOF

cat > packages/theme/src/index.ts << 'EOF'
// Design tokens
export * from './tokens';

// Themes
export * from './themes';

// Component styles
export * from './components';

// CSS utilities
export * from './css';
EOF

# Adapters package structure
echo "🔌 Setting up adapters package..."
mkdir -p packages/adapters/src/{ant-design,headless-ui,custom,factory,types}
mkdir -p packages/adapters/src/ant-design/components
mkdir -p packages/adapters/src/headless-ui/components
mkdir -p packages/adapters/src/custom/components

cat > packages/adapters/package.json << 'EOF'
{
  "name": "@whttlr/ui-adapters",
  "version": "0.0.0",
  "description": "Multi-library adapter system for Whttlr UI components",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "jest",
    "lint": "eslint src/**/*.{ts,tsx}",
    "clean": "rimraf dist"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0",
    "antd": ">=4.0.0",
    "@headlessui/react": ">=1.0.0"
  },
  "dependencies": {
    "@whttlr/ui-core": "workspace:*",
    "@whttlr/ui-theme": "workspace:*"
  }
}
EOF

# CNC package structure
echo "🏭 Setting up CNC package..."
mkdir -p packages/cnc/src/{controls,visualization,forms,validation}
mkdir -p packages/cnc/src/controls/{JogControls,CoordinateDisplay,EmergencyStop,StatusIndicators,ConnectionStatus,MachineStatusMonitor}
mkdir -p packages/cnc/src/visualization/{MachineDisplay2D,WorkingAreaPreview,ToolPath}
mkdir -p packages/cnc/src/forms/{MachineSetupForm,JobSetupForm,ConnectionForm}

cat > packages/cnc/package.json << 'EOF'
{
  "name": "@whttlr/ui-cnc",
  "version": "0.0.0",
  "description": "CNC-specific UI components for Whttlr applications",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "jest",
    "lint": "eslint src/**/*.{ts,tsx}",
    "clean": "rimraf dist"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0",
    "@react-three/fiber": ">=8.0.0",
    "three": ">=0.140.0"
  },
  "dependencies": {
    "@whttlr/ui-core": "workspace:*",
    "@whttlr/ui-theme": "workspace:*"
  }
}
EOF

# Testing package structure
echo "🧪 Setting up testing package..."
mkdir -p packages/testing/src/{components,accessibility,visual,mobile,performance,mocks}

cat > packages/testing/package.json << 'EOF'
{
  "name": "@whttlr/ui-testing",
  "version": "0.0.0",
  "description": "Testing utilities for Whttlr UI components",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "jest",
    "lint": "eslint src/**/*.{ts,tsx}",
    "clean": "rimraf dist"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0",
    "@testing-library/react": ">=12.0.0",
    "jest": ">=27.0.0"
  },
  "dependencies": {
    "@whttlr/ui-core": "workspace:*",
    "@whttlr/ui-theme": "workspace:*"
  }
}
EOF

# Icons package structure
echo "🎯 Setting up icons package..."
mkdir -p packages/icons/src/{cnc,common,components}

cat > packages/icons/package.json << 'EOF'
{
  "name": "@whttlr/ui-icons",
  "version": "0.0.0",
  "description": "Icon system for Whttlr applications",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "jest",
    "lint": "eslint src/**/*.{ts,tsx}",
    "clean": "rimraf dist"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0"
  }
}
EOF

# CLI package structure
echo "⚡ Setting up CLI package..."
mkdir -p packages/cli/src/{commands,templates} packages/cli/bin

cat > packages/cli/package.json << 'EOF'
{
  "name": "@whttlr/ui-cli",
  "version": "0.0.0",
  "description": "CLI tools for Whttlr UI components",
  "main": "dist/index.js",
  "bin": {
    "whttlr-ui": "./bin/whttlr-ui"
  },
  "files": ["dist", "bin"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "jest",
    "lint": "eslint src/**/*.{ts,tsx}",
    "clean": "rimraf dist"
  }
}
EOF

# Create shared Rollup configuration
echo "🔧 Creating shared build configuration..."
mkdir -p tools/build

cat > tools/build/rollup.config.js << 'EOF'
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    postcss({
      extract: true,
      minimize: true,
    }),
  ],
};
EOF

# Create README
echo "📖 Creating README..."
cat > README.md << 'EOF'
# @whttlr/ui-library

A comprehensive UI component library for CNC applications.

## Packages

- `@whttlr/ui-core` - Core UI components and primitives
- `@whttlr/ui-theme` - Design system and theme tokens
- `@whttlr/ui-adapters` - Multi-library adapter system
- `@whttlr/ui-cnc` - CNC-specific components
- `@whttlr/ui-testing` - Testing utilities
- `@whttlr/ui-icons` - Icon system
- `@whttlr/ui-cli` - CLI tools

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Start development mode
npm run dev

# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format
```

## Architecture

This is a monorepo managed with Turborepo, containing multiple npm packages that work together to provide a complete UI component system for CNC applications.

### Package Dependencies

```
ui-core ← ui-adapters ← ui-cnc
   ↑         ↑           ↑
ui-theme ←────┴───────────┘
   ↑
ui-testing
```

## Documentation

Visit our [Storybook](./apps/storybook) for component documentation and examples.

## Contributing

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build all packages
4. Make your changes
5. Run tests with `npm run test`
6. Submit a pull request

## License

MIT
EOF

# Create GitHub workflows
echo "🔄 Creating GitHub Actions..."
mkdir -p .github/workflows

cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
EOF

echo "✅ UI Library repository structure created successfully!"
echo ""
echo "Next steps:"
echo "1. cd $UI_LIBRARY_PATH"
echo "2. npm install"
echo "3. npm run build"
echo "4. Start migrating components from the electron-app"
echo ""
echo "Repository is ready for component migration! 🚀"