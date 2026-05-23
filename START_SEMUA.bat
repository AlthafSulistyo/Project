@echo off
echo ===================================================
echo   MEMULAI SEMUA SISTEM SCHOOL GUARD (16 CCTV)
echo ===================================================
echo.

echo [1/4] Update Database Kamera (16 CCTV Sinkron)...
cd Backend
call C:\xampp\php\php.exe artisan db:seed --class=CameraSeeder
cd ..
echo.

echo [2/4] Menjalankan Backend Server (Laravel API)...
start "Backend API" cmd /k "cd Backend && C:\xampp\php\php.exe artisan serve"

echo [3/4] Menjalankan CCTV Stream Server (MediaMTX)...
start "MediaMTX Server" cmd /k "cd Backend && mediamtx.exe"

echo [4/4] Menjalankan Frontend Web (React)...
start "Frontend UI" cmd /k "cd Frontend && npm run dev"

echo.
echo Menunggu Frontend siap...
timeout /t 5 >nul

echo Membuka aplikasi di browser...
start http://localhost:5173

echo.
echo [5/5] MENJALANKAN MESIN AI CCTV (Multicam Round-Robin Mode)...
echo Server berjalan ringan dan menggunakan NPU (Snapdragon X / Adreno)...
start /B python server_cctv_multicam.py >nul 2>&1

echo.
echo SELESAI! Semua sistem (Backend, MediaMTX, Frontend, 16 AI Headless) sudah berjalan.
echo JANGAN TUTUP jendela ini agar ke-16 AI tetap memantau CCTV dari background!
echo Untuk mematikan semua AI, cukup tutup jendela utama ini.
pause
