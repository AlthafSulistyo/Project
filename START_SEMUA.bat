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
start /B cmd /c "cd Backend && C:\xampp\php\php.exe artisan serve > backend.log 2>&1"

echo [3/4] Menjalankan CCTV Stream Server (MediaMTX)...
start /B cmd /c "cd Backend && mediamtx.exe > mediamtx.log 2>&1"

echo [4/4] Menjalankan Frontend Web (React)...
start /B cmd /c "cd Frontend && npm run dev > frontend.log 2>&1"

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
echo SELESAI! Semua sistem (Backend, MediaMTX, Frontend, 16 AI Headless) sudah berjalan di BACKGROUND.
echo Tidak ada jendela terminal tambahan yang terbuka. Semua log disimpan dalam file .log
echo JANGAN KHAWATIR jika menutup jendela utama ini, karena aplikasi akan tetap berjalan di latar belakang!
echo Untuk mematikan aplikasi, jalankan file "STOP_SEMUA.bat".
pause
