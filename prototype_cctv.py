import cv2
import numpy as np
import time
import os
from datetime import datetime, time as dt_time
from ultralytics import YOLO

def main():
    print("========================================")
    print("PROTOTYPE SCHOOL GUARD - YOLO AI + MOTION")
    print("========================================")
    print("KONTROL KEYBOARD:")
    print(" [0] Reset ke Normal")
    print(" [q] Keluar dari program")
    print("========================================")

    # Meminta input dari pengguna untuk memilih mode
    mode = input("Pilih sumber kamera (1: Webcam Lokal, 2: Video File, 3: DroidCam via WiFi): ")
    
    if mode == '2':
        video_dir = 'video prototype'
        if os.path.exists(video_dir):
            videos = [f for f in os.listdir(video_dir) if f.endswith('.mp4') or f.endswith('.avi')]
            if videos:
                print("\nVideo yang tersedia:")
                for i, v in enumerate(videos):
                    print(f"[{i+1}] {v}")
                
                vid_choice = input(f"Pilih nomor video (1-{len(videos)}): ")
                try:
                    idx = int(vid_choice) - 1
                    video_path = os.path.join(video_dir, videos[idx])
                    cap = cv2.VideoCapture(video_path)
                except:
                    print("Pilihan tidak valid, menggunakan input manual.")
                    video_path = input("Masukkan nama/path file video: ")
                    cap = cv2.VideoCapture(video_path)
            else:
                video_path = input("Tidak ada video di folder 'video prototype'. Masukkan path manual: ")
                cap = cv2.VideoCapture(video_path)
        else:
            video_path = input("Masukkan nama/path file video: ")
            cap = cv2.VideoCapture(video_path)
    elif mode == '3':
        droidcam_ip = input("Masukkan IP DroidCam (contoh: 192.168.1.10): ")
        droidcam_port = input("Masukkan Port DroidCam (default: 4747, tekan Enter untuk default): ")
        if not droidcam_port:
            droidcam_port = "4747"
        
        # Format standar DroidCam URL
        video_url = f"http://{droidcam_ip}:{droidcam_port}/video"
        print(f"Menyambungkan ke {video_url} ...")
        cap = cv2.VideoCapture(video_url)
        
        if not cap.isOpened():
            video_url_alt = f"http://{droidcam_ip}:{droidcam_port}/mjpegfeed"
            print(f"Gagal. Mencoba alternatif: {video_url_alt} ...")
            cap = cv2.VideoCapture(video_url_alt)
            
    else:
        cam_idx_input = input("Masukkan index kamera (0 untuk default, 1/2 untuk eksternal): ")
        try:
            cam_idx = int(cam_idx_input)
        except ValueError:
            cam_idx = 0
        
        # Tambahkan cv2.CAP_DSHOW untuk mencegah error MSMF di Windows (camera tidak terbuka)
        cap = cv2.VideoCapture(cam_idx, cv2.CAP_DSHOW)
        
        
        # Trik untuk mengurangi lag dari Virtual Webcam (seperti PhoneLink atau DroidCam)
        # Memaksa OpenCV untuk tidak menyimpan antrian frame lama
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
    if not cap.isOpened():
        print("Error: Tidak dapat mengakses kamera.")
        return

    print("\n[INFO] Memuat Model AI YOLOv8n (NCNN Optimized for Snapdragon X) ...")
    model = YOLO("yolov8n_ncnn_model") 

    # Inisialisasi Sensor Gerak (MOG2) untuk mendampingi YOLO
    # varThreshold dinaikkan drastis ke 300 agar SUPER kebal terhadap gerakan kecil (ngetik/napas/bayangan)
    # detectShadows=False agar bayangan bergerak tidak dianggap ancaman
    fgbg = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=300, detectShadows=False)

    current_category = "Normal"
    current_severity = "Normal"
    trigger_message = "Tidak ada peringatan. Kondisi aman."
    alert_color = (0, 255, 0)
    
    last_trigger_time = time.time()
    # Cooldown diturunkan jadi 1 detik agar UI terasa lebih responsif/cepat kembali ke Normal saat tidak ada gerakan
    trigger_duration = 1

    cv2.namedWindow('School Guard - YOLO', cv2.WINDOW_NORMAL)

    print("\n[INFO] Membuka jendela video... Jika tidak muncul, periksa Taskbar bawah Anda!")
    frame_count = 0
    yolo_skip_rate = 1 # AI berjalan di SETIAP frame karena NCNN Snapdragon sudah super ringan!
    last_yolo_boxes = []

    while True:
        ret, frame = cap.read()
        if not ret:
            print("\n[INFO] Video telah selesai diputar.")
            break

        frame_count += 1

        if mode != '2':
            frame = cv2.flip(frame, 1)

        height, width = frame.shape[:2]
        frame_area = width * height

        # ---------------------------------------------------------
        # 1. MOTION DETECTION (MOG2) PADA FRAME KECIL UNTUK PERFORMA
        # ---------------------------------------------------------
        if width > 800:
            scale_percent = 800 / width
            new_width = 800
            new_height = int(height * scale_percent)
            small_frame = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_AREA)
        else:
            small_frame = frame.copy()

        blurred = cv2.GaussianBlur(small_frame, (11, 11), 0)
        fgmask_small = fgbg.apply(blurred)
        
        # Hapus noise/gerakan super kecil menggunakan teknik morfologi (Erosion & Dilation)
        kernel = np.ones((7,7), np.uint8) # Diperbesar jadi 7x7 agar noise makin bersih terhapus
        fgmask_small = cv2.erode(fgmask_small, kernel, iterations=1)
        fgmask_small = cv2.dilate(fgmask_small, kernel, iterations=2)
        
        # Kembalikan mask ke ukuran asli agar koordinatnya cocok dengan bounding box YOLO
        fgmask = cv2.resize(fgmask_small, (width, height), interpolation=cv2.INTER_NEAREST)

        # ---------------------------------------------------------
        # 2. AI OBJECT DETECTION (YOLOv8) - NCNN Native
        # ---------------------------------------------------------
        if frame_count % yolo_skip_rate == 0 or frame_count == 1:
            results = model.predict(frame, classes=[0], verbose=False)
            last_yolo_boxes = results[0].boxes
        
        split_x = int(width * 0.8)
        
        active_person_right = 0
        active_person_left = 0
        largest_person_area_percentage = 0.0
        
        frame_category = "Normal"
        frame_severity = "Normal"
        frame_message = ""
        frame_color = (0, 255, 0)

        # Garis pembagi kiri dan kanan (80% Aktivitas, 20% Keluar Masuk)
        cv2.line(frame, (split_x, 0), (split_x, height), (255, 0, 0), 2)
        cv2.putText(frame, "AKTIVITAS (80%)", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)
        cv2.putText(frame, "KELUAR MASUK (20%)", (split_x + 10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)
        
        for box in last_yolo_boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            
            box_area = (x2 - x1) * (y2 - y1)
            area_percentage = (box_area / frame_area) * 100
            
            # Hitung seberapa banyak "gerakan" di dalam kotak orang ini
            box_mask = fgmask[y1:y2, x1:x2]
            motion_pixels = cv2.countNonZero(box_mask)
            motion_percentage = (motion_pixels / box_area) * 100 if box_area > 0 else 0
            
            # Orang dianggap AKTIF jika ada >25% gerakan di dalam kotaknya, ATAU dia sangat dekat (>40% layar)
            is_active = (motion_percentage > 25.0) or (area_percentage > 40.0)

            if is_active:
                if area_percentage > largest_person_area_percentage:
                    largest_person_area_percentage = area_percentage
                    
                center_x = (x1 + x2) / 2
                
                if center_x >= split_x:
                    active_person_right += 1
                else:
                    active_person_left += 1
                
                color = (0, 255, 255) # Kuning Terang (Aktif)
                label = f"Aktif"
                thick = 3
            else:
                # Orang diam (duduk santai) -> diabaikan dari perhitungan alarm
                color = (100, 100, 100) # Abu-abu gelap (Pasif)
                label = f"Duduk/Diam"
                thick = 1

            cv2.rectangle(frame, (x1, y1), (x2, y2), color, thick)
            cv2.putText(frame, label, (x1, max(20, y1 - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, max(1, thick-1), cv2.LINE_AA)

        # ---------------------------------------------------------
        # LOGIKA TINGKAT BAHAYA DENGAN JADWAL WAKTU DINAMIS
        # ---------------------------------------------------------
        now = datetime.now().time()
        
        # Jadwal Masuk / Istirahat / Pulang (Tidak Sensitif)
        break_times = [
            (dt_time(6, 0), dt_time(7, 20)),
            (dt_time(9, 50), dt_time(10, 20)),
            (dt_time(11, 45), dt_time(13, 0)),
            (dt_time(13, 58), dt_time(14, 15))
        ]
        
        is_break_time = False
        for start_t, end_t in break_times:
            if start_t <= now <= end_t:
                is_break_time = True
                break
                
        total_active = active_person_left + active_person_right
        is_activity_category = active_person_right <= active_person_left
        
        if len(last_yolo_boxes) == 0:
            frame_category = "Kosong"
            frame_severity = "Normal"
            frame_message = "Kelas Kosong / Tidak Ada Orang"
            frame_color = (0, 255, 0)
        elif total_active == 0:
            frame_category = "Aktivitas"
            frame_severity = "Normal"
            frame_message = "Kelas Aman / Semua Duduk Tenang (Pergerakan <25%)"
            frame_color = (0, 255, 0)
        else:
            if is_break_time:
                # --- MODE TOLERANSI (ISTIRAHAT / PULANG) ---
                if is_activity_category:
                    frame_category = "Aktivitas"
                    if total_active >= 15 or largest_person_area_percentage > 50.0:
                        frame_severity, frame_color = "High", (0, 0, 255)
                        frame_message = f"BAHAYA: Kerumunan Besar / Tampering ({total_active} org)"
                    elif total_active >= 11:
                        frame_severity, frame_color = "Medium", (0, 165, 255)
                        frame_message = f"ALARM: Banyak Siswa Bergerak ({total_active} org)"
                    elif total_active >= 6:
                        frame_severity, frame_color = "Low", (0, 255, 255)
                        frame_message = f"ALARM: Ada Siswa Tidak Duduk ({total_active} org)"
                    else: # 0-5
                        frame_severity, frame_color = "Normal", (0, 255, 0)
                        frame_message = f"Aman: Pergerakan Wajar ({total_active} org)"
                else:
                    frame_category = "Keluar Masuk"
                    if total_active >= 7:
                        frame_severity, frame_color = "High", (0, 0, 255)
                        frame_message = f"BAHAYA: Rombongan Keluar Masuk ({total_active} org)"
                    elif total_active >= 6:
                        frame_severity, frame_color = "Medium", (0, 165, 255)
                        frame_message = f"ALARM: Ramai Keluar Masuk ({total_active} org)"
                    elif total_active >= 5:
                        frame_severity, frame_color = "Low", (0, 255, 255)
                        frame_message = f"ALARM: Ada pergerakan Keluar Masuk ({total_active} org)"
                    else: # 0-4
                        frame_severity, frame_color = "Normal", (0, 255, 0)
                        frame_message = f"Aman: Keluar Masuk Wajar ({total_active} org)"
            else:
                # --- MODE DEFAULT (JAM BELAJAR) ---
                if is_activity_category:
                    frame_category = "Aktivitas"
                    if total_active >= 5 or largest_person_area_percentage > 50.0:
                        frame_severity, frame_color = "High", (0, 0, 255)
                        if largest_person_area_percentage > 50.0:
                            frame_message = "BAHAYA: Tampering / Wajah Terlalu Dekat!"
                        else:
                            frame_message = f"BAHAYA: Keributan di Kelas ({total_active} org aktif)"
                    elif total_active >= 3:
                        frame_severity, frame_color = "Medium", (0, 165, 255)
                        frame_message = f"ALARM: Banyak Siswa Berdiri ({total_active} org aktif)"
                    elif total_active >= 1:
                        frame_severity, frame_color = "Low", (0, 255, 255)
                        frame_message = f"ALARM: Ada Siswa Tidak Duduk ({total_active} org aktif)"
                else:
                    frame_category = "Keluar Masuk"
                    if total_active >= 3:
                        frame_severity, frame_color = "High", (0, 0, 255)
                        frame_message = f"BAHAYA: Rombongan Masuk Pintu ({total_active} org)"
                    elif total_active >= 2:
                        frame_severity, frame_color = "Medium", (0, 165, 255)
                        frame_message = f"ALARM: Ramai di Pintu ({total_active} org)"
                    elif total_active >= 1:
                        frame_severity, frame_color = "Low", (0, 255, 255)
                        frame_message = f"ALARM: Ada orang mondar-mandir di Pintu ({total_active} org)"

        if frame_severity != "Normal":
            current_category = frame_category
            current_severity = frame_severity
            trigger_message = frame_message
            alert_color = frame_color
            last_trigger_time = time.time()
        elif time.time() - last_trigger_time > trigger_duration:
            current_category = frame_category
            current_severity = frame_severity
            trigger_message = frame_message
            alert_color = frame_color

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('0'):
            last_trigger_time = 0 

        ui_scale = max(1.0, width / 1280.0) 
        box_w = int(550 * ui_scale)
        box_h = int(140 * ui_scale)
        
        overlay = frame.copy()
        cv2.rectangle(overlay, (10, 10), (10 + box_w, 10 + box_h), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.5, frame, 0.5, 0, frame)

        border_thick = int(8 * ui_scale) if current_severity == "High" else int(3 * ui_scale)
        cv2.rectangle(frame, (0, 0), (width, height), alert_color, border_thick)

        f1 = 0.8 * ui_scale
        f2 = 0.7 * ui_scale 
        t1 = max(1, int(2 * ui_scale))
        t2 = max(1, int(1.5 * ui_scale)) 

        cv2.putText(frame, f"Kategori : {current_category}", (20, int(45 * ui_scale)), cv2.FONT_HERSHEY_SIMPLEX, f1, (255,255,255), t1, cv2.LINE_AA)
        cv2.putText(frame, f"Tingkat  : {current_severity}", (20, int(85 * ui_scale)), cv2.FONT_HERSHEY_SIMPLEX, f1, alert_color, t1, cv2.LINE_AA)
        cv2.putText(frame, trigger_message, (20, int(130 * ui_scale)), cv2.FONT_HERSHEY_SIMPLEX, f2, (255,255,255), t2, cv2.LINE_AA)
        
        # Tampilkan Mode Aktif di pojok kanan atas
        mode_text = "Mode: MASUK/ISTIRAHAT (Toleransi Tinggi)" if is_break_time else "Mode: DEFAULT (Sensitif)"
        mode_color = (0, 255, 255) if is_break_time else (0, 165, 255)
        cv2.putText(frame, mode_text, (width - int(400 * ui_scale), int(35 * ui_scale)), cv2.FONT_HERSHEY_SIMPLEX, 0.6 * ui_scale, mode_color, max(1, int(1.5 * ui_scale)), cv2.LINE_AA)
        
        cv2.putText(frame, "YOLO+MOG2 Active. Tekan Q untuk keluar.", (10, height - 15), cv2.FONT_HERSHEY_SIMPLEX, 0.5 * ui_scale, (255,255,255), max(1, int(1 * ui_scale)), cv2.LINE_AA)

        cv2.imshow('School Guard - YOLO', frame)

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
