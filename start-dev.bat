@echo off
echo Starting Development Server for localhost:3000
echo.

echo Killing any existing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul

echo.
echo Starting Vite development server...
echo This will open http://localhost:3000 automatically
echo.

npm run dev

pause
