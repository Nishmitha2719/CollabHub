@echo off
echo.
echo ========================================
echo   CollabHub - Quick Setup
echo ========================================
echo.
echo Running Node.js setup script...
echo.

node setup.js

if errorlevel 1 (
    echo.
    echo Error: Node.js setup failed
    echo Make sure Node.js is installed
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Installing npm packages...
echo ========================================
echo.

call npm install

if errorlevel 1 (
    echo.
    echo Error: npm install failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Creating environment file...
echo ========================================
echo.

if not exist ".env.local" (
    copy .env.example .env.local
    echo ✓ Created .env.local
    echo.
    echo IMPORTANT: Edit .env.local and add your Supabase credentials
) else (
    echo ○ .env.local already exists
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Edit .env.local with your Supabase credentials
echo   2. Run: npm run dev
echo   3. Open: http://localhost:3000
echo.
pause
