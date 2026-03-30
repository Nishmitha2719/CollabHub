@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  CollabHub - Quick Setup
echo ========================================
echo.

REM Create directory structure
echo [1/4] Creating directory structure...
if not exist "app" mkdir app
if not exist "components\layout" mkdir components\layout
if not exist "components\ui" mkdir components\ui
if not exist "lib" mkdir lib
if not exist "hooks" mkdir hooks
if not exist "types" mkdir types
if not exist "public" mkdir public
echo ✓ Directories created
echo.

REM Copy source files
echo [2/4] Setting up source files...
echo.
echo Please copy the code from ALL_SOURCE_FILES.txt into their respective files.
echo See SETUP_GUIDE.md for detailed instructions.
echo.

REM Install dependencies
echo [3/4] Installing dependencies...
echo Running: npm install
npm install
if errorlevel 1 (
    echo ✗ Failed to install dependencies
    echo Please ensure Node.js is installed and try again
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

REM Environment setup
echo [4/4] Environment configuration...
if not exist ".env.local" (
    echo Creating .env.local from template...
    copy .env.example .env.local
    echo.
    echo ⚠️  IMPORTANT: Edit .env.local and add your Supabase credentials
    echo    Get them from: https://supabase.com
    echo.
) else (
    echo ✓ .env.local already exists
)

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo  1. Copy all code from ALL_SOURCE_FILES.txt to their respective files
echo  2. Edit .env.local with your Supabase credentials
echo  3. Run: npm run dev
echo  4. Open: http://localhost:3000
echo.
echo See SETUP_GUIDE.md for detailed instructions
echo.
pause
