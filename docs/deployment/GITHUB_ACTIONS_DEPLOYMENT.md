# GitHub Actions Deployment Guide

## Overview

This guide covers the complete GitHub Actions CI/CD pipeline for the CNC Jog Controls application. The pipeline handles building, testing, deploying the Electron application, UI Library, API services, and managing plugin signature verification.

## Table of Contents

1. [Pipeline Architecture](#pipeline-architecture)
2. [Workflow Configuration](#workflow-configuration)
3. [Environment Setup](#environment-setup)
4. [Build Workflows](#build-workflows)
5. [Testing Workflows](#testing-workflows)
6. [Deployment Workflows](#deployment-workflows)
7. [Security & Secrets](#security--secrets)
8. [Plugin Signature Workflows](#plugin-signature-workflows)
9. [Monitoring & Notifications](#monitoring--notifications)
10. [Troubleshooting](#troubleshooting)

---

## Pipeline Architecture

### Workflow Overview

```mermaid
graph TD
    A[Push to Branch] --> B{Branch Type}
    B -->|main| C[Production Pipeline]
    B -->|develop| D[Staging Pipeline]
    B -->|feature/*| E[Feature Pipeline]
    
    C --> F[Build & Test]
    F --> G[Security Scan]
    G --> H[Deploy Production]
    
    D --> I[Build & Test]
    I --> J[Deploy Staging]
    
    E --> K[Build & Test]
    K --> L[Preview Deploy]
    
    H --> M[Release Artifacts]
    M --> N[Update Documentation]
    
    style C fill:#ff9999
    style D fill:#ffcc99
    style E fill:#99ccff
```

### Repository Structure for CI/CD

```
.github/
├── workflows/
│   ├── ci.yml                    # Main CI pipeline
│   ├── deploy-production.yml     # Production deployment
│   ├── deploy-staging.yml        # Staging deployment
│   ├── ui-library.yml           # UI Library CI/CD
│   ├── plugin-verification.yml   # Plugin signature verification
│   ├── security-scan.yml        # Security scanning
│   └── release.yml              # Release automation
├── actions/                     # Custom actions
│   ├── setup-node/
│   ├── build-electron/
│   ├── sign-plugins/
│   └── deploy-api/
└── CODEOWNERS                   # Code ownership rules
```

---

## Workflow Configuration

### Main CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:

env:
  NODE_VERSION: '18'
  CACHE_VERSION: v1

jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      cache-key: ${{ steps.cache-key.outputs.key }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate cache key
        id: cache-key
        run: |
          echo "key=${{ runner.os }}-${{ env.CACHE_VERSION }}-${{ hashFiles('**/package-lock.json') }}" >> $GITHUB_OUTPUT

  install-dependencies:
    runs-on: ubuntu-latest
    needs: setup
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Cache node modules
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ needs.setup.outputs.cache-key }}
          restore-keys: |
            ${{ runner.os }}-${{ env.CACHE_VERSION }}-
            
      - name: Install dependencies
        run: npm ci

  lint:
    runs-on: ubuntu-latest
    needs: [setup, install-dependencies]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Restore node modules
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ needs.setup.outputs.cache-key }}
          
      - name: Run ESLint
        run: npm run lint
        
      - name: Run TypeScript check
        run: npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    needs: [setup, install-dependencies]
    strategy:
      matrix:
        test-group: [core, ui, services, utils]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Restore node modules
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ needs.setup.outputs.cache-key }}
          
      - name: Run unit tests
        run: npm run test:${{ matrix.test-group }}
        env:
          CI: true
          
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: coverage/lcov.info
          flags: ${{ matrix.test-group }}

  integration-tests:
    runs-on: ubuntu-latest
    needs: [setup, install-dependencies]
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: cnc_controls_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Restore node modules
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ needs.setup.outputs.cache-key }}
          
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cnc_controls_test
          API_BASE_URL: http://localhost:3000

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [setup, install-dependencies]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Restore node modules
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ needs.setup.outputs.cache-key }}
          
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Build application
        run: npm run build
        
      - name: Start application
        run: npm run electron:serve &
        
      - name: Wait for application
        run: npx wait-on http://localhost:5173
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: e2e-test-results
          path: test-results/

  build:
    runs-on: ${{ matrix.os }}
    needs: [lint, unit-tests, integration-tests]
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Build Electron app
        run: npm run electron:build
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: electron-app-${{ matrix.os }}
          path: dist/
```

---

## Environment Setup

### Repository Secrets Configuration

```yaml
# Required secrets in GitHub repository settings
secrets:
  # Code signing
  CSC_LINK: # Certificate for Windows/macOS code signing
  CSC_KEY_PASSWORD: # Certificate password
  APPLE_ID: # Apple ID for notarization
  APPLE_ID_PASSWORD: # Apple ID password
  
  # API keys
  CNC_CORE_API_KEY: # CNC-Core API access
  DATABASE_API_KEY: # Database API access
  PLUGINS_API_KEY: # Plugin store API access
  
  # Deployment
  AWS_ACCESS_KEY_ID: # AWS deployment credentials
  AWS_SECRET_ACCESS_KEY: # AWS secret
  DOCKER_USERNAME: # Docker Hub username
  DOCKER_PASSWORD: # Docker Hub password
  
  # Monitoring
  SENTRY_AUTH_TOKEN: # Error tracking
  SLACK_WEBHOOK_URL: # Notifications
  
  # Plugin signing
  PLUGIN_SIGNING_KEY: # Private key for plugin signatures
  PLUGIN_SIGNING_CERT: # Public certificate
```

### Environment Variables

```yaml
# .github/workflows/env-setup.yml
name: Environment Setup

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
    secrets:
      inherit

jobs:
  setup-environment:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - name: Configure environment variables
        run: |
          case "${{ inputs.environment }}" in
            "production")
              echo "API_BASE_URL=https://api.cnc-controls.com" >> $GITHUB_ENV
              echo "DATABASE_URL=${{ secrets.PROD_DATABASE_URL }}" >> $GITHUB_ENV
              echo "SENTRY_DSN=${{ secrets.PROD_SENTRY_DSN }}" >> $GITHUB_ENV
              ;;
            "staging")
              echo "API_BASE_URL=https://staging-api.cnc-controls.com" >> $GITHUB_ENV
              echo "DATABASE_URL=${{ secrets.STAGING_DATABASE_URL }}" >> $GITHUB_ENV
              echo "SENTRY_DSN=${{ secrets.STAGING_SENTRY_DSN }}" >> $GITHUB_ENV
              ;;
            "development")
              echo "API_BASE_URL=http://localhost:3000" >> $GITHUB_ENV
              echo "DATABASE_URL=${{ secrets.DEV_DATABASE_URL }}" >> $GITHUB_ENV
              ;;
          esac
          
      - name: Validate environment
        run: |
          if [ -z "$API_BASE_URL" ]; then
            echo "Error: API_BASE_URL not set"
            exit 1
          fi
          
          if [ -z "$DATABASE_URL" ]; then
            echo "Error: DATABASE_URL not set"
            exit 1
          fi
```

---

## Build Workflows

### UI Library Build & Publish

```yaml
# .github/workflows/ui-library.yml
name: UI Library CI/CD

on:
  push:
    paths:
      - 'packages/ui-library/**'
      - '.github/workflows/ui-library.yml'
  pull_request:
    paths:
      - 'packages/ui-library/**'

jobs:
  test-ui-library:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: packages/ui-library
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Run accessibility tests
        run: npm run test:a11y
        
      - name: Build Storybook
        run: npm run build-storybook
        
      - name: Visual regression tests
        run: npm run test:visual
        
      - name: Build library
        run: npm run build
        
      - name: Check bundle size
        run: npm run analyze-bundle

  publish-ui-library:
    runs-on: ubuntu-latest
    needs: test-ui-library
    if: github.ref == 'refs/heads/main'
    defaults:
      run:
        working-directory: packages/ui-library
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build library
        run: npm run build
        
      - name: Check version
        id: check-version
        run: |
          CURRENT_VERSION=$(npm version --json | jq -r '.["ui-library"]')
          PUBLISHED_VERSION=$(npm view ui-library version 2>/dev/null || echo "0.0.0")
          
          if [ "$CURRENT_VERSION" != "$PUBLISHED_VERSION" ]; then
            echo "should-publish=true" >> $GITHUB_OUTPUT
            echo "version=$CURRENT_VERSION" >> $GITHUB_OUTPUT
          else
            echo "should-publish=false" >> $GITHUB_OUTPUT
          fi
          
      - name: Publish to npm
        if: steps.check-version.outputs.should-publish == 'true'
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          
      - name: Deploy Storybook
        if: steps.check-version.outputs.should-publish == 'true'
        run: |
          npm run build-storybook
          npx storybook-to-ghpages --ci --existing-output-dir=storybook-static
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Create GitHub release
        if: steps.check-version.outputs.should-publish == 'true'
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ui-library-v${{ steps.check-version.outputs.version }}
          release_name: UI Library v${{ steps.check-version.outputs.version }}
          draft: false
          prerelease: false
```

### Electron Application Build

```yaml
# .github/workflows/electron-build.yml
name: Build Electron Application

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string

jobs:
  build-electron:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            platform: linux
            arch: x64
          - os: windows-latest
            platform: win32
            arch: x64
          - os: macos-latest
            platform: darwin
            arch: x64
          - os: macos-latest
            platform: darwin
            arch: arm64
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Setup environment
        run: |
          echo "Building for ${{ inputs.environment }}"
          cp config/${{ inputs.environment }}.json config/app.json
          
      - name: Build React application
        run: npm run build
        env:
          NODE_ENV: ${{ inputs.environment }}
          
      - name: Prepare code signing (Windows)
        if: matrix.platform == 'win32'
        run: |
          echo "${{ secrets.CSC_LINK }}" | base64 -d > certificate.p12
        env:
          CSC_LINK: ${{ secrets.CSC_LINK }}
          
      - name: Prepare code signing (macOS)
        if: matrix.platform == 'darwin'
        run: |
          echo "${{ secrets.CSC_LINK }}" | base64 -d > certificate.p12
          security create-keychain -p "" build.keychain
          security import certificate.p12 -k build.keychain -P "${{ secrets.CSC_KEY_PASSWORD }}" -T /usr/bin/codesign
          security set-key-partition-list -S apple-tool:,apple: -s -k "" build.keychain
        env:
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
          
      - name: Build Electron application
        run: npm run electron:build -- --${{ matrix.platform }} --${{ matrix.arch }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: electron-${{ matrix.platform }}-${{ matrix.arch }}
          path: |
            dist/*.exe
            dist/*.dmg
            dist/*.AppImage
            dist/*.deb
            dist/*.rpm
```

---

## Testing Workflows

### Comprehensive Testing Pipeline

```yaml
# .github/workflows/testing.yml
name: Comprehensive Testing

on:
  workflow_call:
    inputs:
      test-type:
        required: true
        type: string # unit, integration, e2e, security

jobs:
  unit-tests:
    if: inputs.test-type == 'unit' || inputs.test-type == 'all'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-suite:
          - core/machine
          - core/positioning
          - core/workspace
          - services/api
          - services/database
          - ui/components
          - utils
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test -- --testPathPattern=${{ matrix.test-suite }}
        env:
          CI: true
          
      - name: Generate coverage report
        run: npm run test:coverage -- --testPathPattern=${{ matrix.test-suite }}
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: coverage/lcov.info
          flags: ${{ matrix.test-suite }}
          fail_ci_if_error: true

  integration-tests:
    if: inputs.test-type == 'integration' || inputs.test-type == 'all'
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: cnc_controls_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Setup test database
        run: |
          npm run db:migrate:test
          npm run db:seed:test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cnc_controls_test
          
      - name: Start API server
        run: npm run api:start:test &
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cnc_controls_test
          REDIS_URL: redis://localhost:6379
          
      - name: Wait for API server
        run: npx wait-on http://localhost:3000/health
        
      - name: Run integration tests
        run: npm run test:integration
        env:
          API_BASE_URL: http://localhost:3000
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cnc_controls_test

  e2e-tests:
    if: inputs.test-type == 'e2e' || inputs.test-type == 'all'
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}
        
      - name: Build application
        run: npm run build
        
      - name: Start Electron app for testing
        run: npm run electron:serve:test &
        
      - name: Wait for application
        run: npx wait-on tcp:5173
        
      - name: Run E2E tests
        run: npm run test:e2e -- --browser=${{ matrix.browser }}
        env:
          PWTEST_VIDEO_ENABLED: true
          
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: e2e-results-${{ matrix.os }}-${{ matrix.browser }}
          path: |
            test-results/
            playwright-report/

  security-tests:
    if: inputs.test-type == 'security' || inputs.test-type == 'all'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run security audit
        run: npm audit --audit-level=moderate
        
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=medium
          
      - name: Run SAST scan
        uses: github/codeql-action/init@v2
        with:
          languages: javascript
          
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
        
      - name: Run dependency check
        run: |
          npm install -g @cyclonedx/cyclonedx-npm
          cyclonedx-npm --output-file sbom.json
          
      - name: Upload SBOM
        uses: actions/upload-artifact@v3
        with:
          name: software-bill-of-materials
          path: sbom.json
```

---

## Deployment Workflows

### Production Deployment

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  verify-release:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.get-version.outputs.version }}
      is-prerelease: ${{ steps.check-prerelease.outputs.prerelease }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Get version from tag
        id: get-version
        run: echo "version=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT
        
      - name: Check if prerelease
        id: check-prerelease
        run: |
          if [[ "${{ steps.get-version.outputs.version }}" =~ (alpha|beta|rc) ]]; then
            echo "prerelease=true" >> $GITHUB_OUTPUT
          else
            echo "prerelease=false" >> $GITHUB_OUTPUT
          fi

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security scans
        uses: ./.github/workflows/testing.yml
        with:
          test-type: security

  build-and-test:
    runs-on: ubuntu-latest
    needs: security-scan
    steps:
      - uses: actions/checkout@v4
      
      - name: Run comprehensive tests
        uses: ./.github/workflows/testing.yml
        with:
          test-type: all

  build-electron:
    needs: [verify-release, build-and-test]
    uses: ./.github/workflows/electron-build.yml
    with:
      environment: production
    secrets: inherit

  deploy-api:
    runs-on: ubuntu-latest
    needs: [verify-release, build-and-test]
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Build Docker image
        run: |
          docker build -t cnc-controls-api:${{ needs.verify-release.outputs.version }} .
          docker tag cnc-controls-api:${{ needs.verify-release.outputs.version }} cnc-controls-api:latest
          
      - name: Push to ECR
        run: |
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
          docker tag cnc-controls-api:${{ needs.verify-release.outputs.version }} ${{ secrets.ECR_REGISTRY }}/cnc-controls-api:${{ needs.verify-release.outputs.version }}
          docker tag cnc-controls-api:latest ${{ secrets.ECR_REGISTRY }}/cnc-controls-api:latest
          docker push ${{ secrets.ECR_REGISTRY }}/cnc-controls-api:${{ needs.verify-release.outputs.version }}
          docker push ${{ secrets.ECR_REGISTRY }}/cnc-controls-api:latest
          
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster cnc-controls-prod --service cnc-controls-api --force-new-deployment

  create-release:
    runs-on: ubuntu-latest
    needs: [verify-release, build-electron, deploy-api]
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          path: release-artifacts/
          
      - name: Generate release notes
        id: release-notes
        run: |
          # Generate release notes from commits
          PREVIOUS_TAG=$(git describe --tags --abbrev=0 HEAD^)
          RELEASE_NOTES=$(git log --pretty=format:"- %s" $PREVIOUS_TAG..HEAD)
          
          echo "notes<<EOF" >> $GITHUB_OUTPUT
          echo "$RELEASE_NOTES" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT
          
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ needs.verify-release.outputs.version }}
          release_name: CNC Controls v${{ needs.verify-release.outputs.version }}
          body: |
            ## What's Changed
            ${{ steps.release-notes.outputs.notes }}
            
            ## Installation
            Download the appropriate installer for your platform:
            - Windows: `CNC-Controls-Setup-${{ needs.verify-release.outputs.version }}.exe`
            - macOS: `CNC-Controls-${{ needs.verify-release.outputs.version }}.dmg`
            - Linux: `CNC-Controls-${{ needs.verify-release.outputs.version }}.AppImage`
            
          draft: false
          prerelease: ${{ needs.verify-release.outputs.is-prerelease == 'true' }}
          
      - name: Upload release assets
        run: |
          for file in release-artifacts/**/*; do
            if [[ -f "$file" ]]; then
              gh release upload v${{ needs.verify-release.outputs.version }} "$file"
            fi
          done
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  notify-deployment:
    runs-on: ubuntu-latest
    needs: [create-release]
    if: always()
    steps:
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          fields: repo,message,commit,author,action,eventName,ref,workflow
```

---

## Security & Secrets

### Secret Management Strategy

```yaml
# .github/workflows/security-setup.yml
name: Security Setup

on:
  workflow_call:

jobs:
  rotate-secrets:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule'
    steps:
      - name: Rotate API keys
        run: |
          # Script to rotate API keys periodically
          echo "Rotating API keys..."
          # Implementation would call APIs to rotate keys
          
      - name: Update secrets
        run: |
          # Update GitHub secrets with new keys
          # This would use GitHub API or CLI
          echo "Updating GitHub secrets..."

  validate-secrets:
    runs-on: ubuntu-latest
    steps:
      - name: Validate required secrets
        run: |
          REQUIRED_SECRETS=(
            "CSC_LINK"
            "CSC_KEY_PASSWORD"
            "AWS_ACCESS_KEY_ID"
            "AWS_SECRET_ACCESS_KEY"
            "NPM_TOKEN"
            "PLUGIN_SIGNING_KEY"
          )
          
          for secret in "${REQUIRED_SECRETS[@]}"; do
            if [ -z "${!secret}" ]; then
              echo "Error: Missing required secret: $secret"
              exit 1
            fi
          done
        env:
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          PLUGIN_SIGNING_KEY: ${{ secrets.PLUGIN_SIGNING_KEY }}
```

### Code Signing Workflow

```yaml
# .github/workflows/code-signing.yml
name: Code Signing

on:
  workflow_call:
    inputs:
      artifact-path:
        required: true
        type: string
      platform:
        required: true
        type: string

jobs:
  sign-code:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        include:
          - platform: windows
            os: windows-latest
          - platform: macos
            os: macos-latest
          - platform: linux
            os: ubuntu-latest
    steps:
      - name: Download unsigned artifacts
        uses: actions/download-artifact@v3
        with:
          name: ${{ inputs.artifact-path }}
          path: unsigned/
          
      - name: Setup code signing (Windows)
        if: matrix.platform == 'windows'
        run: |
          echo "${{ secrets.CSC_LINK }}" | base64 -d > certificate.p12
          
      - name: Sign Windows executable
        if: matrix.platform == 'windows'
        run: |
          signtool sign /f certificate.p12 /p "${{ secrets.CSC_KEY_PASSWORD }}" /t http://timestamp.sectigo.com unsigned/*.exe
        
      - name: Setup code signing (macOS)
        if: matrix.platform == 'macos'
        run: |
          echo "${{ secrets.CSC_LINK }}" | base64 -d > certificate.p12
          security create-keychain -p "" build.keychain
          security import certificate.p12 -k build.keychain -P "${{ secrets.CSC_KEY_PASSWORD }}" -T /usr/bin/codesign
          security set-key-partition-list -S apple-tool:,apple: -s -k "" build.keychain
          
      - name: Sign and notarize macOS app
        if: matrix.platform == 'macos'
        run: |
          codesign --deep --force --verify --verbose --sign "Developer ID Application" unsigned/*.app
          xcrun notarytool submit unsigned/*.dmg --apple-id "${{ secrets.APPLE_ID }}" --password "${{ secrets.APPLE_ID_PASSWORD }}" --team-id "${{ secrets.APPLE_TEAM_ID }}" --wait
          
      - name: Upload signed artifacts
        uses: actions/upload-artifact@v3
        with:
          name: signed-${{ matrix.platform }}
          path: unsigned/
```

---

## Plugin Signature Workflows

### Plugin Verification Pipeline

```yaml
# .github/workflows/plugin-verification.yml
name: Plugin Signature Verification

on:
  workflow_dispatch:
    inputs:
      plugin-url:
        description: 'URL of plugin to verify'
        required: true
        type: string
  repository_dispatch:
    types: [verify-plugin]

jobs:
  download-plugin:
    runs-on: ubuntu-latest
    outputs:
      plugin-hash: ${{ steps.hash.outputs.hash }}
    steps:
      - name: Download plugin
        run: |
          wget -O plugin.zip "${{ github.event.inputs.plugin-url || github.event.client_payload.plugin-url }}"
          
      - name: Calculate hash
        id: hash
        run: |
          HASH=$(sha256sum plugin.zip | cut -d' ' -f1)
          echo "hash=$HASH" >> $GITHUB_OUTPUT
          
      - name: Upload plugin
        uses: actions/upload-artifact@v3
        with:
          name: plugin-${{ steps.hash.outputs.hash }}
          path: plugin.zip

  verify-signature:
    runs-on: ubuntu-latest
    needs: download-plugin
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Download plugin
        uses: actions/download-artifact@v3
        with:
          name: plugin-${{ needs.download-plugin.outputs.plugin-hash }}
          
      - name: Install verification tools
        run: npm install -g plugin-signature-verifier
        
      - name: Verify plugin signature
        id: verify
        run: |
          RESULT=$(plugin-signature-verifier verify plugin.zip --public-key "${{ secrets.PLUGIN_PUBLIC_KEY }}")
          echo "result=$RESULT" >> $GITHUB_OUTPUT
          
          if [[ "$RESULT" == "VALID" ]]; then
            echo "valid=true" >> $GITHUB_OUTPUT
          else
            echo "valid=false" >> $GITHUB_OUTPUT
          fi
          
      - name: Extract plugin metadata
        if: steps.verify.outputs.valid == 'true'
        run: |
          unzip -q plugin.zip
          cat package.json | jq '{name, version, author, description}'
          
      - name: Security scan
        if: steps.verify.outputs.valid == 'true'
        run: |
          # Scan plugin for security issues
          npm audit --audit-level=moderate
          
      - name: Update plugin database
        if: steps.verify.outputs.valid == 'true'
        run: |
          # Update plugin registry with verification status
          curl -X POST "${{ secrets.PLUGIN_REGISTRY_URL }}/verify" \
            -H "Authorization: Bearer ${{ secrets.PLUGIN_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d "{
              \"hash\": \"${{ needs.download-plugin.outputs.plugin-hash }}\",
              \"verified\": true,
              \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
            }"

  sign-plugin:
    runs-on: ubuntu-latest
    if: github.event_name == 'workflow_dispatch'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Build plugin
        run: |
          # Build plugin from source
          npm ci
          npm run build
          npm pack
          
      - name: Sign plugin
        run: |
          # Sign the plugin package
          PLUGIN_FILE=$(ls *.tgz)
          
          # Create signature
          openssl dgst -sha256 -sign <(echo "${{ secrets.PLUGIN_SIGNING_KEY }}") -out signature.sig "$PLUGIN_FILE"
          
          # Create signed package
          tar -czf "${PLUGIN_FILE%.tgz}-signed.tgz" "$PLUGIN_FILE" signature.sig
          
      - name: Upload signed plugin
        uses: actions/upload-artifact@v3
        with:
          name: signed-plugin
          path: "*-signed.tgz"
```

### Plugin Registry Management

```yaml
# .github/workflows/plugin-registry.yml
name: Plugin Registry Management

on:
  push:
    paths:
      - 'plugins/**'
  workflow_dispatch:
    inputs:
      action:
        description: 'Registry action'
        required: true
        type: choice
        options:
          - publish
          - unpublish
          - update-metadata

jobs:
  validate-plugin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate plugin structure
        run: |
          # Check required files
          REQUIRED_FILES=(
            "package.json"
            "src/index.ts"
            "README.md"
          )
          
          for plugin_dir in plugins/*/; do
            echo "Validating $plugin_dir"
            
            for file in "${REQUIRED_FILES[@]}"; do
              if [ ! -f "$plugin_dir$file" ]; then
                echo "Error: Missing $file in $plugin_dir"
                exit 1
              fi
            done
          done
          
      - name: Validate package.json
        run: |
          for plugin_dir in plugins/*/; do
            cd "$plugin_dir"
            
            # Check required fields
            if ! jq -e '.name' package.json > /dev/null; then
              echo "Error: Missing name in $plugin_dir/package.json"
              exit 1
            fi
            
            if ! jq -e '.version' package.json > /dev/null; then
              echo "Error: Missing version in $plugin_dir/package.json"
              exit 1
            fi
            
            if ! jq -e '.cncControls' package.json > /dev/null; then
              echo "Error: Missing cncControls config in $plugin_dir/package.json"
              exit 1
            fi
            
            cd - > /dev/null
          done

  build-plugins:
    runs-on: ubuntu-latest
    needs: validate-plugin
    strategy:
      matrix:
        plugin: ${{ fromJson(needs.list-plugins.outputs.plugins) }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Build plugin
        run: |
          cd plugins/${{ matrix.plugin }}
          npm ci
          npm run build
          npm run test
          
      - name: Package plugin
        run: |
          cd plugins/${{ matrix.plugin }}
          npm pack
          
      - name: Upload plugin package
        uses: actions/upload-artifact@v3
        with:
          name: plugin-${{ matrix.plugin }}
          path: plugins/${{ matrix.plugin }}/*.tgz

  publish-to-registry:
    runs-on: ubuntu-latest
    needs: [validate-plugin, build-plugins]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download all plugin packages
        uses: actions/download-artifact@v3
        with:
          path: packages/
          
      - name: Publish to plugin registry
        run: |
          for package in packages/plugin-*/*.tgz; do
            echo "Publishing $package"
            
            # Upload to registry
            curl -X POST "${{ secrets.PLUGIN_REGISTRY_URL }}/upload" \
              -H "Authorization: Bearer ${{ secrets.PLUGIN_API_TOKEN }}" \
              -F "package=@$package"
          done

  list-plugins:
    runs-on: ubuntu-latest
    outputs:
      plugins: ${{ steps.list.outputs.plugins }}
    steps:
      - uses: actions/checkout@v4
      
      - name: List plugins
        id: list
        run: |
          PLUGINS=$(find plugins -maxdepth 1 -type d ! -path plugins | sed 's|plugins/||' | jq -R -s -c 'split("\n")[:-1]')
          echo "plugins=$PLUGINS" >> $GITHUB_OUTPUT
```

---

## Monitoring & Notifications

### Deployment Monitoring

```yaml
# .github/workflows/monitoring.yml
name: Deployment Monitoring

on:
  workflow_run:
    workflows: ["Deploy to Production", "Deploy to Staging"]
    types:
      - completed

jobs:
  monitor-deployment:
    runs-on: ubuntu-latest
    steps:
      - name: Check deployment status
        id: check-status
        run: |
          if [ "${{ github.event.workflow_run.conclusion }}" == "success" ]; then
            echo "status=success" >> $GITHUB_OUTPUT
            echo "message=Deployment completed successfully" >> $GITHUB_OUTPUT
          else
            echo "status=failure" >> $GITHUB_OUTPUT
            echo "message=Deployment failed" >> $GITHUB_OUTPUT
          fi
          
      - name: Run health checks
        if: steps.check-status.outputs.status == 'success'
        run: |
          # Wait for deployment to stabilize
          sleep 60
          
          # Check API health
          API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.cnc-controls.com/health)
          if [ "$API_STATUS" != "200" ]; then
            echo "API health check failed: $API_STATUS"
            exit 1
          fi
          
          # Check application health
          APP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://app.cnc-controls.com)
          if [ "$APP_STATUS" != "200" ]; then
            echo "Application health check failed: $APP_STATUS"
            exit 1
          fi
          
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ steps.check-status.outputs.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
          fields: repo,message,commit,author,took
          custom_payload: |
            {
              attachments: [{
                color: '${{ steps.check-status.outputs.status }}' === 'success' ? 'good' : 'danger',
                blocks: [{
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `${{ steps.check-status.outputs.message }}\n*Workflow:* ${{ github.event.workflow_run.name }}\n*Branch:* ${{ github.event.workflow_run.head_branch }}\n*Commit:* <${{ github.event.workflow_run.html_url }}|${{ github.event.workflow_run.head_sha }}>`
                  }
                }]
              }]
            }
            
      - name: Create incident (on failure)
        if: steps.check-status.outputs.status == 'failure'
        run: |
          # Create incident in monitoring system
          curl -X POST "${{ secrets.INCIDENT_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d "{
              \"title\": \"Deployment Failure\",
              \"description\": \"${{ github.event.workflow_run.name }} failed\",
              \"severity\": \"high\",
              \"tags\": [\"deployment\", \"ci-cd\"]
            }"
```

---

## Troubleshooting

### Common CI/CD Issues and Solutions

#### 1. **Build Failures**

```yaml
# .github/workflows/debug.yml
name: Debug Build Issues

on:
  workflow_dispatch:
    inputs:
      debug-level:
        description: 'Debug level'
        required: true
        type: choice
        options:
          - basic
          - detailed
          - verbose

jobs:
  debug-environment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: System information
        run: |
          echo "OS: $(uname -a)"
          echo "Node version: $(node --version)"
          echo "NPM version: $(npm --version)"
          echo "Available memory: $(free -h)"
          echo "Available disk: $(df -h)"
          
      - name: Environment variables
        if: inputs.debug-level == 'verbose'
        run: |
          echo "Environment variables:"
          env | sort
          
      - name: Network connectivity
        run: |
          echo "Testing network connectivity..."
          curl -I https://registry.npmjs.org
          curl -I https://api.github.com
          
      - name: Cache status
        run: |
          echo "NPM cache info:"
          npm cache ls --depth=0
          
      - name: Dependency tree
        if: inputs.debug-level != 'basic'
        run: |
          npm ci
          npm ls --depth=1

  debug-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Clear caches
        run: |
          npm cache clean --force
          rm -rf node_modules package-lock.json
          
      - name: Install dependencies with verbose logging
        run: npm install --verbose
        
      - name: Build with verbose output
        run: npm run build -- --verbose
        env:
          DEBUG: '*'
```

#### 2. **Test Failures**

```yaml
# Debug test failures
debug-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests with debug output
      run: npm test -- --verbose --runInBand --detectOpenHandles
      env:
        DEBUG: 'jest:*'
        NODE_ENV: test
        
    - name: Generate test report
      if: failure()
      run: |
        npm test -- --reporters=jest-junit --outputFile=test-results.xml
        
    - name: Upload test results
      if: failure()
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: test-results.xml
```

#### 3. **Deployment Failures**

```bash
# Debug deployment script
#!/bin/bash

echo "=== Deployment Debug Information ==="
echo "Timestamp: $(date)"
echo "Git commit: $GITHUB_SHA"
echo "Git ref: $GITHUB_REF"
echo "Environment: $ENVIRONMENT"

echo "=== Checking prerequisites ==="
# Check AWS credentials
aws sts get-caller-identity || {
  echo "AWS credentials not configured"
  exit 1
}

# Check Docker
docker --version || {
  echo "Docker not available"
  exit 1
}

echo "=== Build information ==="
echo "Build artifacts:"
ls -la dist/

echo "=== Container information ==="
docker images | grep cnc-controls

echo "=== Service status ==="
aws ecs describe-services --cluster cnc-controls-prod --services cnc-controls-api
```

### Monitoring and Alerting

```yaml
# .github/workflows/monitoring-setup.yml
name: Setup Monitoring

on:
  workflow_dispatch:

jobs:
  setup-monitoring:
    runs-on: ubuntu-latest
    steps:
      - name: Configure monitoring
        run: |
          # Setup monitoring dashboards
          echo "Configuring monitoring..."
          
          # Create Grafana dashboards
          curl -X POST "${{ secrets.GRAFANA_URL }}/api/dashboards/db" \
            -H "Authorization: Bearer ${{ secrets.GRAFANA_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d @monitoring/grafana-dashboard.json
            
          # Setup alerting rules
          curl -X POST "${{ secrets.ALERTMANAGER_URL }}/api/v1/alerts" \
            -H "Content-Type: application/json" \
            -d @monitoring/alert-rules.json
```

This comprehensive GitHub Actions deployment guide provides a complete CI/CD pipeline for the CNC Jog Controls application, including build automation, testing, security scanning, deployment orchestration, and monitoring capabilities.