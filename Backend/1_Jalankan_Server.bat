@echo off
echo ========================================================
echo SERVER BACKEND SCHOOLGUARD
echo ========================================================

IF EXIST "C:\xampp\php\php.exe" (
    echo [OK] PHP Ditemukan di XAMPP! Menjalankan Server...
    C:\xampp\php\php.exe artisan serve
) ELSE (
    echo [Mencoba menggunakan PATH bawaan...]
    php artisan serve
)

pause
