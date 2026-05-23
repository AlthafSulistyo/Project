import cv2
import numpy as np
import time
import os
import argparse
import logging
import json
import requests
import base64
from datetime import datetime, time as dt_time
from ultralytics import YOLO

# Konfigurasi Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("cctv_server.log"),
        logging.StreamHandler()
    ]
)

def parse_args():
    parser = argparse.ArgumentParser(description="School Guard CCTV - Server Mode")
    parser.add_argument("--source", type=str, required=True, help="Sumber kamera (URL RTSP, index webcam, atau file video)")
    parser.add_argument("--model", type=str, default="yolov8n_ncnn_model", help="Path ke model YOLO")
    parser.add_argument("--webhook", type=str, default=None, help="URL Endpoint untuk mengirim alert via HTTP POST")
    parser.add_argument("--camera-name", type=str, default="CAM_D1_Lab_Kom", help="Nama kamera untuk dicocokkan di database")
    parser.add_argument("--output", type=str, default=None, help="Path untuk menyimpan hasil video (opsional)")
    parser.add_argument("--show", action="store_true", help="Tampilkan GUI (matikan mode headless)")
    parser.add_argument("--cooldown", type=int, default=5, help="Cooldown pengiriman alert (detik)")
    return parser.parse_args()

def send_webhook_alert(webhook_url, camera_name, category, severity, message, active_count, frame_b64=None):
    if not webhook_url:
        return
        
    payload = {
        "camera_name": camera_name,
        "timestamp": datetime.now().isoformat(),
        "category": category,
        "severity": severity,
        "message": message,
        "active_persons": active_count
    }
    
    if frame_b64:
        payload["snapshot_base64"] = frame_b64
    
    try:
        # Mengirim alert secara asinkron atau menggunakan timeout rendah agar tidak memblokir frame
        requests.post(webhook_url, json=payload, timeout=2)
        logging.info(f"Webhook terkirim: {severity} - {message}")
    except Exception as e:
        logging.error(f"Gagal mengirim webhook: {e}")

def main():
    args = parse_args()
    
    logging.info("Memulai Sistem CCTV (Server Mode)...")
    logging.info(f"Sumber   : {args.source}")
    logging.info(f"Kamera   : {args.camera_name}")
    logging.info(f"Model    : {args.model}")
    logging.info(f"Headless : {'TIDAK' if args.show else 'YA'}")
    
    # Menentukan sumber (integer jika index webcam)
    source = int(args.source) if args.source.isdigit() else args.source
    
    # Inisialisasi Kamera
    cap = cv2.VideoCapture(source)
    if isinstance(source, int):
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    if not cap.isOpened():
        logging.error("Gagal membuka stream video/kamera. Periksa URL atau koneksi.")
        return

    logging.info("Memuat Model AI YOLO...")
    try:
        model = YOLO(args.model)
    except Exception as e:
        logging.error(f"Gagal memuat model YOLO: {e}")
        return

    fgbg = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=150, detectShadows=False)

    # Variabel status
    last_trigger_time = 0
    trigger_duration = args.cooldown
    
    frame_count = 0
    yolo_skip_rate = 15  # OPTIMASI: Jalankan AI YOLO setiap 15 frame (1 detik sekali) untuk menghemat CPU Server
    last_yolo_boxes = []

    # Video Writer (Opsional)
    video_writer = None
    if args.output:
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        if fps == 0: fps = 15
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        video_writer = cv2.VideoWriter(args.output, fourcc, fps, (width, height))
        logging.info(f"Merekam output ke {args.output}")

    if args.show:
        cv2.namedWindow('School Guard Server', cv2.WINDOW_NORMAL)

    logging.info("Sistem berjalan. Memproses frame...")

    while True:
        ret, frame = cap.read()
        if not ret:
            logging.warning(f"[{args.camera_name}] Koneksi Stream terputus. Mencoba menghubungkan ulang dalam 5 detik...")
            cap.release()
            time.sleep(5)
            cap = cv2.VideoCapture(source)
            if isinstance(source, int):
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            continue

        frame_count += 1
        height, width = frame.shape[:2]
        frame_area = width * height

        # 1. MOTION DETECTION
        if width > 800:
            scale_percent = 800 / width
            new_width = 800
            new_height = int(height * scale_percent)
            small_frame = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_AREA)
        else:
            small_frame = frame.copy()

        blurred = cv2.GaussianBlur(small_frame, (11, 11), 0)
        fgmask_small = fgbg.apply(blurred)
        
        kernel = np.ones((7,7), np.uint8)
        fgmask_small = cv2.erode(fgmask_small, kernel, iterations=1)
        fgmask_small = cv2.dilate(fgmask_small, kernel, iterations=2)
        fgmask = cv2.resize(fgmask_small, (width, height), interpolation=cv2.INTER_NEAREST)

        # 2. AI OBJECT DETECTION
        if frame_count % yolo_skip_rate == 0 or frame_count == 1:
            results = model.predict(frame, classes=[0], conf=0.45, verbose=False)
            last_yolo_boxes = results[0].boxes
        
        active_person_class = 0
        largest_person_area_percentage = 0.0
        
        # Proses Bounding Boxes
        for box in last_yolo_boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            box_area = (x2 - x1) * (y2 - y1)
            box_width = x2 - x1
            box_height = y2 - y1
            
            area_percentage = (box_area / frame_area) * 100
            
            box_mask = fgmask[y1:y2, x1:x2]
            motion_pixels = cv2.countNonZero(box_mask)
            motion_percentage = (motion_pixels / box_area) * 100 if box_area > 0 else 0
            
            # Dianggap aktif jika: 1. Ada gerakan (5%+), 2. Terlalu dekat (40%+), ATAU 3. AI sangat yakin itu manusia (confidence > 0.6) meskipun dia sedang diam/duduk
            is_active = (motion_percentage > 5.0) or (area_percentage > 40.0) or (conf > 0.6)

            if is_active:
                if area_percentage > largest_person_area_percentage:
                    largest_person_area_percentage = area_percentage
                active_person_class += 1
                color = (0, 255, 255)
                label = "Bergerak"
            else:
                color = (100, 100, 100)
                label = "Diam"

            # Gambar visual (Hanya berguna jika --show atau --output aktif)
            if args.show or video_writer:
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, label, (x1, max(20, y1 - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

        # 3. LOGIKA TINGKAT BAHAYA
        now = datetime.now().time()
        break_times = [
            (dt_time(6, 0), dt_time(7, 20)),
            (dt_time(9, 50), dt_time(10, 20)),
            (dt_time(11, 45), dt_time(13, 0)),
            (dt_time(13, 58), dt_time(14, 15))
        ]
        
        is_break_time = any(start_t <= now <= end_t for start_t, end_t in break_times)
        activity_severity_level = 0
        
        if is_break_time:
            if active_person_class >= 15 or largest_person_area_percentage > 50.0: activity_severity_level = 3 
            elif active_person_class >= 11: activity_severity_level = 2 
            elif active_person_class >= 6: activity_severity_level = 1 
        else:
            if active_person_class >= 5 or largest_person_area_percentage > 50.0: activity_severity_level = 3 
            elif active_person_class >= 3: activity_severity_level = 2 
            elif active_person_class >= 1: activity_severity_level = 1 

        frame_category = "Aktifitas"
        frame_severity = "Normal"
        frame_message = "Kelas Aman"

        if len(last_yolo_boxes) == 0:
            frame_severity = "Kosong"
            frame_message = "Kelas Kosong / Tidak Ada Objek"
        elif activity_severity_level == 3:
            frame_severity = "High"
            frame_message = f"BAHAYA: Ada {active_person_class} orang aktif!"
        elif activity_severity_level == 2:
            frame_severity = "Medium"
            frame_message = f"ALARM: {active_person_class} orang aktif"
        elif activity_severity_level == 1:
            frame_severity = "Low"
            frame_message = f"ALARM: {active_person_class} orang aktif"

        # Kirim Alert (Hanya jika severity != Normal/Kosong dan sudah melewati cooldown)
        if frame_severity in ["High", "Medium", "Low"]:
            current_time = time.time()
            if current_time - last_trigger_time > trigger_duration:
                logging.warning(f"[{frame_severity}] {frame_message}")
                
                # Mengubah frame menjadi Base64 untuk snapshot
                frame_b64 = None
                try:
                    _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60]) # Kompresi 60% agar enteng
                    frame_b64 = base64.b64encode(buffer).decode('utf-8')
                except Exception as e:
                    logging.error(f"Gagal memproses snapshot: {e}")

                send_webhook_alert(args.webhook, args.camera_name, frame_category, frame_severity, frame_message, active_person_class, frame_b64)
                last_trigger_time = current_time

        # Simpan/Tampilkan Frame
        if video_writer:
            # Tambahkan status ke pojok atas video
            cv2.putText(frame, f"Status: {frame_severity} | Aktif: {active_person_class}", (20, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255) if frame_severity != "Normal" else (0, 255, 0), 2)
            video_writer.write(frame)

        if args.show:
            cv2.putText(frame, f"Status: {frame_severity} | Aktif: {active_person_class}", (20, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255) if frame_severity != "Normal" else (0, 255, 0), 2)
            cv2.imshow('School Guard Server', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    cap.release()
    if video_writer:
        video_writer.release()
    cv2.destroyAllWindows()
    logging.info("Sistem CCTV dihentikan.")

if __name__ == "__main__":
    main()
