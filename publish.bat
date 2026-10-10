@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required. Install it from https://nodejs.org and run this file again.
  exit /b 1
)
if not exist "node_modules\sharp" call npm install
if errorlevel 1 exit /b 1
node scripts\build.js
if errorlevel 1 exit /b 1
git add -A
git diff --cached --quiet
if not errorlevel 1 (
  echo Nothing new to publish.
  exit /b 0
)
git commit -m "Update archive"
if errorlevel 1 exit /b 1
git push origin main
if errorlevel 1 exit /b 1
echo Published to https://natphx.com/
