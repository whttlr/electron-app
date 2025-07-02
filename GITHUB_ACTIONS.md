# GitHub Actions Workflows Guide

This guide provides comprehensive GitHub Actions workflows for the CNC Jog Controls application, covering testing, security, notifications, and release automation.

## 📊 Current Implementation Status

### ✅ **Already Implemented:**

1. **Build and Release** (`.github/workflows/build-and-release.yml`)
   - ✅ Multi-platform Electron builds (macOS, Windows, Linux)
   - ⚠️ **Limited testing** - runs linting but skips actual tests with `echo "Skipping tests for deployment"`
   - ✅ **Release automation** with prerelease/stable options
   - ✅ Artifact uploads to GitHub releases
   - ✅ Auto-generated release notes

2. **Documentation Deployment** (`.github/workflows/deploy-docs.yml`)
   - ✅ Deploys Docusaurus site to GitHub Pages
   - ✅ Auto-updates on docs changes

### ❌ **Missing Workflows (Need Implementation):**

3. **Unit Tests** - No dedicated test workflow
4. **Security Scanning** - No npm audit or Snyk integration  
5. **ESLint** - Basic linting in build workflow only (could be separated)
6. **Playwright E2E Tests** - No E2E test automation
7. **Email Notifications** - No failure/release notifications
8. **Slack Integration** - No team notifications

### 🔧 **Recommended Improvements:**

**Enable Tests in Build Workflow:**
Your current build workflow skips tests. Update line 61 in `build-and-release.yml`:
```yaml
# Current (line 61):
- name: Run tests
  run: echo "Skipping tests for deployment"

# Recommended:
- name: Run tests
  run: npm run test:ci
```

## 🔄 Available Workflows

### 1. Unit Tests
**File:** `.github/workflows/test.yml`
```yaml
name: Unit Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ci
```

### 2. Security Scanning
**File:** `.github/workflows/security.yml`
```yaml
name: Security Scan
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Weekly on Monday
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm audit --audit-level=moderate
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

### 3. ESLint Code Analysis
**File:** `.github/workflows/lint.yml`
```yaml
name: Code Quality
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - name: Upload ESLint Report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: eslint-report
          path: eslint-report.json
```

### 4. Playwright E2E Tests
**File:** `.github/workflows/e2e.yml`
```yaml
name: E2E Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### 5. Email Notifications
**File:** `.github/workflows/notify.yml`
```yaml
name: Notifications
on:
  workflow_run:
    workflows: ["Build and Release"]
    types: [completed]
  release:
    types: [published]
jobs:
  email:
    runs-on: ubuntu-latest
    steps:
      - name: Send Email on Failure
        if: github.event.workflow_run.conclusion == 'failure'
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 587
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: "Build Failed: ${{ github.repository }}"
          body: |
            The build failed for repository ${{ github.repository }}.
            
            Commit: ${{ github.sha }}
            Branch: ${{ github.ref }}
            Workflow: ${{ github.event.workflow_run.name }}
            
            View details: ${{ github.event.workflow_run.html_url }}
          to: ${{ secrets.NOTIFICATION_EMAIL }}
          from: ${{ secrets.EMAIL_USERNAME }}
      
      - name: Send Release Email
        if: github.event_name == 'release'
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 587
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: "New Release: ${{ github.event.release.tag_name }}"
          body: |
            A new release has been published!
            
            Release: ${{ github.event.release.name }}
            Tag: ${{ github.event.release.tag_name }}
            
            ${{ github.event.release.body }}
            
            Download: ${{ github.event.release.html_url }}
          to: ${{ secrets.NOTIFICATION_EMAIL }}
          from: ${{ secrets.EMAIL_USERNAME }}
```

### 6. Slack Integration
**File:** `.github/workflows/slack.yml`
```yaml
name: Slack Notifications
on:
  push:
    branches: [main]
  release:
    types: [published]
  workflow_run:
    workflows: ["Build and Release", "Unit Tests", "E2E Tests"]
    types: [completed]
jobs:
  slack:
    runs-on: ubuntu-latest
    steps:
      - name: Slack Notification - Build Status
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#cnc-builds'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          fields: repo,message,commit,author,action,eventName,ref,workflow
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
          MATRIX_CONTEXT: ${{ toJson(matrix) }}
      
      - name: Slack Notification - Release
        if: github.event_name == 'release'
        uses: 8398a7/action-slack@v3
        with:
          status: 'success'
          channel: '#cnc-releases'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          custom_payload: |
            {
              text: "🚀 New Release Published!",
              attachments: [{
                color: 'good',
                fields: [{
                  title: 'Release',
                  value: '${{ github.event.release.tag_name }}',
                  short: true
                }, {
                  title: 'Repository',
                  value: '${{ github.repository }}',
                  short: true
                }],
                actions: [{
                  type: 'button',
                  text: 'Download Release',
                  url: '${{ github.event.release.html_url }}'
                }]
              }]
            }
```

### 7. Release Automation
**File:** `.github/workflows/release.yml`
```yaml
name: Publish Release
on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Release version (e.g., v1.0.0)'
        required: true
        type: string
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run test:ci
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.event.inputs.version || github.ref_name }}
          release_name: Release ${{ github.event.inputs.version || github.ref_name }}
          body: |
            ## What's Changed
            - Automated release from GitHub Actions
            
            ## Downloads
            - [Windows Installer](../../releases/latest/download/CNC-Jog-Controls-Setup.exe)
            - [macOS DMG](../../releases/latest/download/CNC-Jog-Controls.dmg)
            - [Linux AppImage](../../releases/latest/download/CNC-Jog-Controls.AppImage)
          draft: false
          prerelease: false
```

## 🔐 Required Secrets

Set up these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Email Configuration
```bash
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Use App Password, not regular password
NOTIFICATION_EMAIL=team@yourcompany.com
```

### Slack Integration
```bash
SLACK_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

### Security Scanning
```bash
SNYK_TOKEN=your-snyk-api-token
```

### GitHub Token
```bash
GITHUB_TOKEN=automatic  # Automatically provided by GitHub
```

## 📋 Setup Instructions

### 1. Create Workflow Files
Create the `.github/workflows/` directory in your repository and add the workflow files above.

```bash
mkdir -p .github/workflows
# Copy each workflow YAML into separate files
```

### 2. Configure Secrets
1. Go to your repository on GitHub
2. Navigate to `Settings > Secrets and variables > Actions`
3. Click `New repository secret`
4. Add each secret listed above

### 3. Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
3. Use the generated password as `EMAIL_PASSWORD`

### 4. Slack Setup
1. Create a Slack app in your workspace
2. Enable Incoming Webhooks
3. Create a webhook URL
4. Add the webhook URL as `SLACK_WEBHOOK` secret

### 5. Snyk Setup
1. Sign up for Snyk account (free tier available)
2. Generate API token from account settings
3. Add token as `SNYK_TOKEN` secret

## 🚀 Usage Examples

### Running Tests Locally
```bash
# Before pushing - run the same checks as CI
npm run lint                    # ESLint analysis
npm run test:ci                 # Unit tests with coverage
npm run build                   # Build verification
npm run test:e2e                # E2E tests
```

### Triggering Workflows
```bash
# Push to main - triggers all workflows
git push origin main

# Create release - triggers release workflow
git tag v1.0.0
git push origin v1.0.0

# Manual release via GitHub UI
# Go to Actions > Publish Release > Run workflow
```

### Security Scanning
```bash
# Local security audit
npm audit --audit-level=moderate

# Check for vulnerabilities
npm audit fix

# Run Snyk locally (requires token)
npx snyk test
```

## 🔧 Customization Options

### Modify Test Coverage Requirements
Edit the test workflow to include coverage thresholds:
```yaml
- run: npm run test:ci -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
```

### Change Notification Channels
Update Slack workflow to use different channels:
```yaml
channel: '#your-custom-channel'
```

### Add Code Quality Gates
Include additional quality checks:
```yaml
- name: Check Bundle Size
  run: npm run build:analyze
- name: TypeScript Check
  run: npx tsc --noEmit
```

### Matrix Testing
Test against multiple Node.js versions:
```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

## 📊 Monitoring & Debugging

### View Workflow Status
- **Repository Actions Tab**: See all workflow runs and their status
- **Build Badges**: Add status badges to your README
- **Email/Slack**: Get notified of failures immediately

### Debug Failed Workflows
1. Check the Actions tab for detailed logs
2. Look for red X indicators on failed steps
3. Review uploaded artifacts for test reports
4. Use `act` tool for local workflow testing

### Common Issues
- **Secrets not accessible**: Check secret names match exactly
- **npm ci fails**: Verify package-lock.json is committed
- **Playwright fails**: Ensure dependencies are installed
- **Email not sending**: Verify App Password and 2FA setup

## 🔄 Workflow Dependencies

The workflows are designed to work together:
1. **Tests run first** - Unit tests, linting, E2E tests
2. **Security scanning** - Parallel to tests for faster feedback
3. **Build & Release** - Only after tests pass
4. **Notifications** - Triggered by workflow completion
5. **Documentation** - Updates automatically on release

This creates a robust CI/CD pipeline that ensures code quality, security, and reliable releases.