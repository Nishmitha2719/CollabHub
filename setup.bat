@echo off
echo Creating CollabHub directory structure...

mkdir app 2>nul
mkdir app\api 2>nul
mkdir components 2>nul
mkdir components\ui 2>nul
mkdir lib 2>nul
mkdir hooks 2>nul
mkdir types 2>nul
mkdir styles 2>nul
mkdir public 2>nul

echo Directory structure created successfully!
echo.
echo Now run: npm install
echo Then run: npm run dev
