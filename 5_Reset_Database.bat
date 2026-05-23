@echo off
echo ========================================================
echo MEMPERBAIKI / MENGISI ULANG DATABASE KAMERA
echo ========================================================
echo Script ini akan memastikan 16 data CCTV masuk ke dalam database.
echo.

IF EXIST "C:\xampp\php\php.exe" (
    echo [OK] Menggunakan PHP bawaan XAMPP...
    cd Backend
    C:\xampp\php\php.exe artisan migrate
    C:\xampp\php\php.exe artisan db:seed --class=CameraSeeder
    cd ..
) ELSE (
    echo [ERROR] XAMPP PHP tidak ditemukan! Pastikan XAMPP terinstall di C:\xampp
    pause
    exit
)

echo.
echo Selesai! Silakan refresh (F5) halaman Dashboard di browser Anda.
pause
