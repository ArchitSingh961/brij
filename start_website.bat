@echo off
echo ==========================================
echo   Brij Namkeen - Website Launcher
echo ==========================================

echo 1. Building Frontend (for updates)...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Exiting...
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo 2. Starting Backend Server...
start "Backend Server" /D "server" npm run dev

echo.
echo 3. Starting Frontend Server...
start "Frontend Website" /D "client" npm run preview

echo.
echo 4. Starting Ngrok Tunnel...
timeout /t 5 >nul
start "Ngrok Public Link" .\node_modules\.bin\ngrok http 4173 --host-header="localhost:4173"

echo.
echo ==========================================
echo   ALL SYSTEMS GO!
echo   Look for the Ngrok window for your link.
echo ==========================================
pause
