@echo off
echo ========================================
echo COLLABHUB SUPABASE INTEGRATION SETUP
echo ========================================
echo.

REM Create admin directory
if not exist "app\admin" mkdir "app\admin"
echo ✓ Created app\admin directory

echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Go to your Supabase project dashboard
echo.
echo 2. Run the SQL schema (supabase_collabhub_schema.sql)
echo    - Open SQL Editor in Supabase
echo    - Copy and paste the entire schema file
echo    - Click "Run"
echo.
echo 3. After signup, make yourself admin:
echo    UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
echo.
echo 4. Your environment variables are already set in .env.local
echo.
echo 5. Install dependencies if needed:
echo    npm install
echo.
echo 6. Run the development server:
echo    npm run dev
echo.
echo 7. Test the following:
echo    - Sign up a new user
echo    - Post a project (will be pending)
echo    - Go to /admin to approve projects
echo    - Browse approved projects at /browse
echo.
echo ========================================
pause
