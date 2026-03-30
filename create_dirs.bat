@echo off
echo Creating directories for authentication...
mkdir app\auth\login 2>nul
mkdir app\auth\signup 2>nul
mkdir app\auth\forgot-password 2>nul
mkdir app\auth\callback 2>nul
mkdir app\projects 2>nul
mkdir app\post-project 2>nul
mkdir app\dashboard 2>nul
mkdir components\home 2>nul
mkdir middleware 2>nul
echo Done!
echo.
echo Now run: node create_auth_dirs.js
pause
