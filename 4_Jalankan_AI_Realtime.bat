@echo off
echo ========================================================
echo JALANKAN AI CCTV SECARA REALTIME (SERVER MODE)
echo ========================================================
echo Peringatan: Menjalankan AI untuk 16 CCTV sekaligus akan membuat laptop hang.
echo Untuk keperluan demo sidang, script ini hanya akan menjalankan AI untuk 2 CCTV Utama.
echo.
echo [1/2] Menjalankan AI untuk CAM_D1 (Lab Kom) ...
start "AI - CAM_D1 Lab Kom" cmd /k "python server_cctv_aktifitas.py --source rtsp://admin:Hikv2024@192.168.18.76:554/Streaming/Channels/101 --camera-name CAM_D1_Lab_Kom --webhook http://localhost:8000/api/webhooks/cctv-ai --show"

echo [2/2] Menjalankan AI untuk CAM_D2 (Lab IPA) ...
start "AI - CAM_D2 Lab IPA" cmd /k "python server_cctv_aktifitas.py --source rtsp://admin:Hikv2024@192.168.18.5:554/Streaming/Channels/101 --camera-name CAM_D2_Lab_IPA --webhook http://localhost:8000/api/webhooks/cctv-ai --show"

echo.
echo AI sedang berjalan di background dan otomatis mengirim data ke Dashboard!
echo Jika ingin mematikan, tutup jendela CMD (hitam) yang baru terbuka.
pause
