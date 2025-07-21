@echo off
echo GitHub Pages Complete Reset Script
echo.

echo Step 1: Clean build
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Clean deploy (remove old files)
call npm run deploy:clean
if errorlevel 1 (
    echo Clean deploy failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Regular deploy
call npm run deploy
if errorlevel 1 (
    echo Deploy failed!
    pause
    exit /b 1
)

echo.
echo Deploy completed successfully!
echo Please wait 1-2 minutes for GitHub Pages to update.
echo Then visit: https://00726mame.github.io/household_accounting/
echo.
pause
