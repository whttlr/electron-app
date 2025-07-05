# UI Library Repository Setup Checklist
*Initial setup for https://github.com/whttlr/ui-library.git*

## Prerequisites
- [ ] **Repository cloned**: Ensure `/Users/tylerhenry/Desktop/whttlr/ui-library` exists
- [ ] **Node.js installed**: Version 18+ recommended
- [ ] **Git configured**: With proper user credentials

## 1. Repository Initialization

### Basic Setup
- [ ] **Navigate to ui-library directory**:
  ```bash
  cd /Users/tylerhenry/Desktop/whttlr/ui-library
  ```

- [ ] **Initialize package.json** (if not exists):
  ```bash
  npm init -y
  ```

- [ ] **Create .gitignore**:
  ```bash
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
  ```

## 2. Monorepo Configuration

### Turborepo Setup
- [ ] **Install Turborepo**:
  ```bash
  npm install -g turbo
  npm install -D turbo
  ```

- [ ] **Create turbo.json**:
  ```json
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
      }
    }
  }
  ```

- [ ] **Update root package.json**:
  ```json
  {
    "name": "@whttlr/ui-library",
    "version": "0.0.0",
    "private": true,
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
      "storybook": "turbo run storybook"
    },
    "devDependencies": {
      "turbo": "latest",
      "prettier": "latest",
      "@types/node": "latest",
      "typescript": "latest"
    }
  }
  ```

## 3. Package Structure Creation

### Core Directories
- [ ] **Create packages directory**:
  ```bash
  mkdir -p packages/{core,theme,adapters,cnc,testing,icons,cli}
  ```

- [ ] **Create apps directory**:
  ```bash
  mkdir -p apps/{storybook,playground,documentation}
  ```

- [ ] **Create tools directory**:
  ```bash
  mkdir -p tools/{build,eslint,typescript,testing}
  ```

- [ ] **Create docs directory**:
  ```bash
  mkdir -p docs/{guides,api,migration}
  ```

## 4. TypeScript Configuration

### Root TypeScript Config
- [ ] **Create tsconfig.json**:
  ```json
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
  ```

### Package-specific TypeScript Configs
- [ ] **Create packages/tsconfig.json**:
  ```json
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
  ```

## 5. Individual Package Setup

### Core Package (/packages/core/)
- [ ] **Create directory structure**:
  ```bash
  cd packages/core
  mkdir -p src/{primitives,complex,animated,mobile,providers,hooks,utils}
  mkdir -p src/primitives/{Button,Card,Badge,Alert,Input,Grid,Container}
  mkdir -p src/complex/{DataTable,Form,Modal,Navigation}
  mkdir -p src/animated/{AnimatedCard,AnimatedProgress,ScrollReveal,FloatingActionButton}
  mkdir -p src/mobile/{TouchButton,TouchControls,MobileNavigation,OrientationAdapter}
  ```

- [ ] **Create package.json**:
  ```json
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
  ```

### Theme Package (/packages/theme/)
- [ ] **Create directory structure**:
  ```bash
  cd packages/theme
  mkdir -p src/{tokens,themes,components,css}
  mkdir -p src/tokens
  mkdir -p src/themes
  mkdir -p src/components
  mkdir -p src/css
  ```

- [ ] **Create package.json**:
  ```json
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
  ```

### Adapters Package (/packages/adapters/)
- [ ] **Create directory structure**:
  ```bash
  cd packages/adapters
  mkdir -p src/{ant-design,headless-ui,custom,factory,types}
  mkdir -p src/ant-design/components
  mkdir -p src/headless-ui/components
  mkdir -p src/custom/components
  ```

- [ ] **Create package.json**:
  ```json
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
  ```

### CNC Package (/packages/cnc/)
- [ ] **Create directory structure**:
  ```bash
  cd packages/cnc
  mkdir -p src/{controls,visualization,forms,validation}
  mkdir -p src/controls/{JogControls,CoordinateDisplay,EmergencyStop,StatusIndicators,ConnectionStatus,MachineStatusMonitor}
  mkdir -p src/visualization/{MachineDisplay2D,WorkingAreaPreview,ToolPath}
  mkdir -p src/forms/{MachineSetupForm,JobSetupForm,ConnectionForm}
  ```

- [ ] **Create package.json**:
  ```json
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
  ```

### Testing Package (/packages/testing/)
- [ ] **Create directory structure**:
  ```bash
  cd packages/testing
  mkdir -p src/{components,accessibility,visual,mobile,performance,mocks}
  ```

- [ ] **Create package.json**:
  ```json
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
  ```

### Icons Package (/packages/icons/)
- [ ] **Create directory structure**:
  ```bash
  cd packages/icons
  mkdir -p src/{cnc,common,components}
  ```

- [ ] **Create package.json**:
  ```json
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
  ```

### CLI Package (/packages/cli/)
- [ ] **Create directory structure**:
  ```bash
  cd packages/cli
  mkdir -p src/{commands,templates} bin
  ```

- [ ] **Create package.json**:
  ```json
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
  ```

## 6. Build System Setup

### Rollup Configuration
- [ ] **Install build dependencies**:
  ```bash
  npm install -D rollup @rollup/plugin-typescript @rollup/plugin-node-resolve @rollup/plugin-commonjs rollup-plugin-peer-deps-external rollup-plugin-postcss
  ```

- [ ] **Create shared rollup.config.js** in tools/build/:
  ```javascript
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
  ```

## 7. Storybook Setup

### Storybook App (/apps/storybook/)
- [ ] **Create Storybook app**:
  ```bash
  cd apps
  npx storybook@latest init --type react_vite
  mv storybook-static storybook
  cd storybook
  ```

- [ ] **Configure Storybook for monorepo**:
  ```javascript
  // .storybook/main.js
  module.exports = {
    stories: [
      '../../../packages/*/src/**/*.stories.@(js|jsx|ts|tsx)',
    ],
    addons: [
      '@storybook/addon-essentials',
      '@storybook/addon-a11y',
      '@storybook/addon-docs',
    ],
    framework: {
      name: '@storybook/react-vite',
      options: {},
    },
  };
  ```

## 8. Testing Setup

### Jest Configuration
- [ ] **Install testing dependencies**:
  ```bash
  npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
  ```

- [ ] **Create jest.config.js**:
  ```javascript
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
  ```

- [ ] **Create jest.setup.js**:
  ```javascript
  import '@testing-library/jest-dom';
  ```

## 9. Linting and Formatting

### ESLint Configuration
- [ ] **Install ESLint dependencies**:
  ```bash
  npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks
  ```

- [ ] **Create .eslintrc.js**:
  ```javascript
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
  ```

### Prettier Configuration
- [ ] **Create .prettierrc**:
  ```json
  {
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 80,
    "tabWidth": 2
  }
  ```

## 10. Documentation Setup

### README Files
- [ ] **Create root README.md**:
  ```markdown
  # @whttlr/ui-library

  A comprehensive UI component library for CNC applications.

  ## Packages

  - `@whttlr/ui-core` - Core UI components
  - `@whttlr/ui-theme` - Design system and tokens
  - `@whttlr/ui-adapters` - Multi-library adapters
  - `@whttlr/ui-cnc` - CNC-specific components
  - `@whttlr/ui-testing` - Testing utilities
  - `@whttlr/ui-icons` - Icon system
  - `@whttlr/ui-cli` - CLI tools

  ## Development

  ```bash
  npm install
  npm run build
  npm run dev
  ```

  ## Documentation

  Visit our [Storybook](./apps/storybook) for component documentation.
  ```

- [ ] **Create package README files** for each package

## 11. CI/CD Setup

### GitHub Actions
- [ ] **Create .github/workflows/ci.yml**:
  ```yaml
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
  ```

- [ ] **Create .github/workflows/release.yml**:
  ```yaml
  name: Release

  on:
    push:
      branches: [main]

  jobs:
    release:
      runs-on: ubuntu-latest
      if: "!contains(github.event.head_commit.message, 'ci skip')"
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '18'
            cache: 'npm'
        - run: npm ci
        - run: npm run build
        - run: npm run test
        - name: Release
          env:
            GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
            NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          run: npx semantic-release
  ```

## 12. Initial Commit

### Repository Setup Completion
- [ ] **Install all dependencies**:
  ```bash
  npm install
  ```

- [ ] **Verify setup**:
  ```bash
  npm run lint
  npm run build
  ```

- [ ] **Create initial commit**:
  ```bash
  git add .
  git commit -m "feat: initial ui-library monorepo setup

  - Add Turborepo monorepo configuration
  - Create package structure for core, theme, adapters, cnc, testing, icons, cli
  - Set up Storybook for component documentation
  - Configure TypeScript, ESLint, Prettier, Jest
  - Add GitHub Actions for CI/CD
  - Create build system with Rollup"
  ```

- [ ] **Push to remote**:
  ```bash
  git push origin main
  ```

## Verification Checklist

### Structure Verification
- [ ] **All package directories exist** with proper structure
- [ ] **All package.json files** are properly configured
- [ ] **TypeScript compilation** works without errors
- [ ] **Turborepo commands** execute successfully
- [ ] **Storybook starts** without errors
- [ ] **Tests run** successfully (even if no tests exist yet)
- [ ] **Linting passes** without errors
- [ ] **Build process** completes successfully

### Ready for Migration
- [ ] **Repository is ready** for component migration
- [ ] **All tools are working** (build, test, lint, docs)
- [ ] **Package structure** matches migration plan
- [ ] **Dependencies are resolved** and up to date
- [ ] **Documentation is in place** for contributors

---

**Next Steps**: Once this setup is complete, you can begin the actual component migration using the `UI_LIBRARY_MIGRATION_CHECKLIST.md`.