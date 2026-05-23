@echo off
echo ========================================================
echo LISTENER CCTV HIKVISION SCHOOLGUARD
echo ========================================================

IF EXIST "C:\xampp\php\php.exe" (
    echo [OK] PHP Ditemukan di XAMPP! Menghubungkan ke CCTV...
    C:\xampp\php\php.exe artisan isapi:listen-alerts
) ELSE (
    echo [Mencoba menggunakan PATH bawaan...]
    php artisan isapi:listen-alerts
)

pause
