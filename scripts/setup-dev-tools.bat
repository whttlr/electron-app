@echo off
setlocal enabledelayedexpansion

:: CNC Jog Controls Plugin Development Tools Setup Script (Windows)
:: This script sets up the plugin development tools for local development

echo 🚀 Setting up CNC Jog Controls Plugin Development Tools...
echo.

:: Get script directory and project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\"

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or later.
    pause
    exit /b 1
)

:: Get Node.js version
for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
set NODE_VERSION=%NODE_VERSION:v=%

echo ✅ Node.js version %NODE_VERSION% found

:: Setup Plugin CLI
echo ℹ️  Setting up Plugin CLI...
cd /d "%PROJECT_ROOT%tools\plugin-cli"

echo ℹ️  Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install Plugin CLI dependencies
    pause
    exit /b 1
)

echo ℹ️  Building CLI...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build Plugin CLI
    pause
    exit /b 1
)

echo ℹ️  Linking CLI globally...
call npm link
if %errorlevel% neq 0 (
    echo ❌ Failed to link Plugin CLI globally
    pause
    exit /b 1
)

echo ✅ Plugin CLI installed globally as 'cnc-plugin'

:: Setup Marketplace Client
echo ℹ️  Setting up Marketplace Client...
cd /d "%PROJECT_ROOT%tools\marketplace-client"

echo ℹ️  Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install Marketplace Client dependencies
    pause
    exit /b 1
)

echo ℹ️  Building Marketplace Client...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build Marketplace Client
    pause
    exit /b 1
)

echo ℹ️  Linking Marketplace Client globally...
call npm link
if %errorlevel% neq 0 (
    echo ❌ Failed to link Marketplace Client globally
    pause
    exit /b 1
)

echo ✅ Marketplace Client installed globally as 'cnc-marketplace'

:: Setup API Docs Generator
echo ℹ️  Setting up API Documentation Generator...
cd /d "%PROJECT_ROOT%tools\api-docs-generator"

echo ℹ️  Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install API Docs Generator dependencies
    pause
    exit /b 1
)

echo ℹ️  Building API Docs Generator...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build API Docs Generator
    pause
    exit /b 1
)

echo ℹ️  Linking API Docs Generator globally...
call npm link
if %errorlevel% neq 0 (
    echo ❌ Failed to link API Docs Generator globally
    pause
    exit /b 1
)

echo ✅ API Docs Generator installed globally as 'cnc-api-docs'

:: Test installations
echo.
echo ℹ️  Testing installations...

cnc-plugin --version >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('cnc-plugin --version') do echo ✅ Plugin CLI working: %%i
) else (
    echo ❌ Plugin CLI test failed
)

cnc-marketplace --version >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('cnc-marketplace --version') do echo ✅ Marketplace Client working: %%i
) else (
    echo ❌ Marketplace Client test failed
)

cnc-api-docs --version >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('cnc-api-docs --version') do echo ✅ API Docs Generator working: %%i
) else (
    echo ❌ API Docs Generator test failed
)

echo.
echo ✅ 🎉 Plugin Development Tools setup complete!
echo.
echo Available commands:
echo   cnc-plugin      - Create and manage plugins
echo   cnc-marketplace - Install and publish plugins
echo   cnc-api-docs    - Generate API documentation
echo.
echo Quick start:
echo   cnc-plugin create my-first-plugin
echo   cnc-marketplace search machine-control
echo   cnc-api-docs generate src --output docs/api
echo.
echo For more information:
echo   cnc-plugin --help
echo   cnc-marketplace --help
echo   cnc-api-docs --help
echo.
echo ✅ Happy plugin development! 🛠️

pause