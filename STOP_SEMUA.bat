@echo off
echo ===================================================
echo   MEMATIKAN SEMUA SISTEM SCHOOL GUARD
echo ===================================================
echo.

echo Mematikan Frontend Web (Node.js / React)...
taskkill /F /IM node.exe /T >nul 2>&1

echo Mematikan Backend Server (PHP / Laravel)...
taskkill /F /IM php.exe /T >nul 2>&1

echo Mematikan CCTV Stream Server (MediaMTX)...
taskkill /F /IM mediamtx.exe /T >nul 2>&1

echo Mematikan Mesin AI CCTV (Python)...
taskkill /F /IM python.exe /T >nul 2>&1

echo.
echo SEMUA SISTEM SCHOOL GUARD TELAH BERHASIL DIMATIKAN!
pause
