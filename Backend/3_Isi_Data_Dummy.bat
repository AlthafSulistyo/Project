@echo off
echo ========================================================
echo MENGISI DATABASE DENGAN DATA DUMMY (KAMERA & LAPORAN)
echo ========================================================
echo Pastikan MySQL (XAMPP) sudah dalam status START sebelum lanjut!
pause

IF EXIST "C:\xampp\php\php.exe" (
    echo [OK] PHP Ditemukan di XAMPP! Memulai proses...
    C:\xampp\php\php.exe artisan migrate:fresh --seed
) ELSE (
    echo [Mencoba menggunakan PATH bawaan...]
    php artisan migrate:fresh --seed
)

echo.
echo Selesai! Silakan refresh browser Anda.
pause
