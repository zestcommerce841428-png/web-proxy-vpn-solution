@echo off
REM Web Proxy Application Startup Script for Windows
REM This script starts both the proxy server and Next.js frontend

echo.
echo ========================================
echo   Web Proxy Application
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version
echo [OK] npm version:
npm --version
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    call npm install
    echo.
)

echo ========================================
echo   Starting Servers
echo ========================================
echo.
echo [1] Proxy Server will run on port 3001
echo [2] Next.js Frontend will run on port 3000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers
echo [STARTING] Launching Proxy Server...
start "Proxy Server - Port 3001" cmd /k "npm run proxy"

timeout /t 3 /nobreak >nul

echo [STARTING] Launching Next.js Frontend...
echo.
npm run dev

pause
