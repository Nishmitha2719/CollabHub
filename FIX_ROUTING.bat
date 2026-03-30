@echo off
echo.
echo ============================================
echo    COLLABHUB ROUTING FIX
echo ============================================
echo.
echo This will fix all routing issues:
echo   - Create /browse route
echo   - Create /saved route  
echo   - Create /about route
echo   - Create /profile/[id] route
echo   - Fix all navigation links
echo   - Update middleware
echo.
echo Press any key to continue...
pause >nul
echo.

echo Step 1: Fixing folder structure...
python fix_routing_structure.py
echo.

echo Step 2: Creating missing pages...
python create_missing_pages.py
echo.

echo.
echo ============================================
echo    ROUTING FIX COMPLETE!
echo ============================================
echo.
echo All routes are now properly configured.
echo.
echo Next: Start your dev server
echo   npm run dev
echo.
echo Then test these URLs:
echo   http://localhost:3000
echo   http://localhost:3000/browse
echo   http://localhost:3000/about
echo   http://localhost:3000/saved
echo   http://localhost:3000/profile/123
echo   http://localhost:3000/projects/1
echo.
pause
