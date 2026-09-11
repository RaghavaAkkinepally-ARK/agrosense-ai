@echo off
title AgroSense AI Microservices Launcher
cd /d "%~dp0"

echo ======================================================================
echo             AGROSENSE AI - PRODUCTION SUITE LAUNCHER
echo ======================================================================
echo.

:: 1. Clear any zombie listeners on target ports
echo [1/4] Checking ports 5001, 3001, and 5173...
powershell -NoProfile -ExecutionPolicy Bypass -Command "foreach($p in 5001,3001,5173){ $c = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue; if($c){ Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } }"

timeout /t 1 /nobreak >nul

:: 2. Start Python ML Microservice (port 5001)
echo [2/4] Launching PyTorch MobileNetV3 Microservice (Port 5001)...
start "AgroSense-ML-5001" /min powershell -NoProfile -Command "Set-Location '%~dp0ml\inference'; python service.py"

:: 3. Start Node.js Express API & App Gateway (port 3001)
echo [3/4] Launching Express Backend and Production Web Gateway (Port 3001)...
start "AgroSense-API-3001" /min powershell -NoProfile -Command "Set-Location '%~dp0'; node server/server.js"

:: 4. Start Vite Frontend Server (port 5173)
echo [4/4] Launching Vite Development Server (Port 5173)...
start "AgroSense-Vite-5173" /min powershell -NoProfile -Command "Set-Location '%~dp0'; npx vite --host 0.0.0.0 --port 5173"

echo.
echo Initializing services, please wait 4 seconds...
timeout /t 4 /nobreak >nul

echo ======================================================================
echo   AGROSENSE AI SERVICES ARE NOW ONLINE!
echo ======================================================================
echo   * Production Web Application:  http://localhost:3001
echo   * Local Network (LAN Access):  http://172.16.1.78:3001
echo   * Vite Dev Web Application:    http://localhost:5173
echo   * Express Backend API:         http://localhost:3001/api/status
echo   * PyTorch ML Microservice:     http://127.0.0.1:5001/health
echo   * Android Release APK:         android\app\build\outputs\apk\release\app-release.apk
echo ======================================================================
echo.
echo You can keep this window open or minimize it.
pause
