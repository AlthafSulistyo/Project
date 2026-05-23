@echo off
cd Backend
C:\xampp\php\php.exe artisan db:seed --class=CameraSeeder > ..\seed_output.txt 2>&1
