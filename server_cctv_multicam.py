import cv2
import numpy as np
import time
import threading
import logging
import uuid
import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime, time as dt_time
from ultralytics import YOLO

# Konfigurasi Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("cctv_multicam_server.log"),
        logging.StreamHandler()
    ]
)

logging.info("Memulai inisialisasi Firebase Admin SDK...")
try:
    cred = credentials.Certificate("schoolguard-648f4-firebase-adminsdk-fbsvc-e2ad46af2e.json")
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'schoolguard-648f4.firebasestorage.app'
    })
    db = firestore.client()
    bucket = storage.bucket()
    logging.info("Berhasil terhubung ke Firebase Firestore & Storage!")
except Exception as e:
    logging.error(f"Gagal menghubungkan Firebase: {e}")
    exit(1)

class CameraStream:
    def __init__(self, name, rtsp_url):
        self.name = name
        self.rtsp_url = rtsp_url
        self.cap = None
        self.latest_frame = None
        self.running = True
        self.last_yolo_boxes = []
        self.prev_gray = None
        self.last_trigger_time = 0
        self.cooldown = 5
        self.is_connected = False
        self.lock = threading.Lock()
        
        # Mulai thread penangkap frame
        self.thread = threading.Thread(target=self.update, daemon=True)
        self.thread.start()

    def update(self):
        while self.running:
            if self.cap is None or not self.cap.isOpened():
                logging.warning(f"[{self.name}] Menghubungkan ke RTSP...")
                self.cap = cv2.VideoCapture(self.rtsp_url)
                if self.cap.isOpened():
                    logging.info(f"[{self.name}] BERHASIL terhubung!")
                    self.is_connected = True
                else:
                    self.is_connected = False
                    time.sleep(5) # Retry delay
                    continue
            
            ret, frame = self.cap.read()
            if ret:
                with self.lock:
                    self.latest_frame = frame
            else:
                logging.warning(f"[{self.name}] Frame terputus. Reconnecting...")
                self.is_connected = False
                self.cap.release()
                time.sleep(3)
                
    def get_latest_frame(self):
        with self.lock:
            if self.latest_frame is not None:
                return self.latest_frame.copy()
            return None

    def stop(self):
        self.running = False
        if self.cap:
            self.cap.release()

def send_firebase_alert(camera_name, category, severity, message, active_count, frame):
    event_id = str(uuid.uuid4())
    image_url = None
    
    # 1. Simpan Gambar ke Firebase Storage
    if frame is not None:
        try:
            # Convert frame to jpg in memory (kompresi 60%)
            _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
            
            # Upload ke Firebase Storage
            blob = bucket.blob(f"snapshots/{event_id}.jpg")
            blob.upload_from_string(buffer.tobytes(), content_type='image/jpeg')
            
            # Buat URL public yang langsung bisa diakses Vercel
            blob.make_public()
            image_url = blob.public_url
            
        except Exception as e:
            logging.error(f"Gagal upload frame ke Firebase Storage: {e}")

    # 2. Simpan Data ke Firestore
    payload = {
        "camera_name": camera_name,
        "timestamp": datetime.now(), # Firestore akan mengkonversi ini ke Timestamp type
        "category": category,
        "severity": severity,
        "message": message,
        "active_persons": active_count,
        "snapshot_url": image_url,
        "status": "unreviewed"
    }

    try:
        db.collection('cctv_events').document(event_id).set(payload)
        logging.info(f"Firebase Firestore Alert [{camera_name}]: {severity} - {message}")
        
        # 3. Jalankan Auto-Cleanup (Menghapus log yang lebih dari 500 kejadian)
        cleanup_old_snapshots()
    except Exception as e:
        logging.error(f"Gagal kirim log ke Firestore [{camera_name}]: {e}")

def cleanup_old_snapshots():
    try:
        # Ambil semua data kejadian diurutkan dari yang terbaru
        events_ref = db.collection('cctv_events').order_by('timestamp', direction=firestore.Query.DESCENDING).get()
        MAX_EVENTS = 500
        
        if len(events_ref) > MAX_EVENTS:
            # Ambil sisa data yang melampaui batas 500
            events_to_delete = events_ref[MAX_EVENTS:]
            logging.info(f"Menjalankan auto-cleanup: menghapus {len(events_to_delete)} log lama...")
            
            for doc in events_to_delete:
                data = doc.to_dict()
                
                # Hapus gambar dari Firebase Storage jika ada
                if 'snapshot_url' in data and data['snapshot_url'] and 'storage.googleapis.com' in data['snapshot_url']:
                    try:
                        # Asumsikan nama file sama dengan ID dokumen
                        blob = bucket.blob(f"snapshots/{doc.id}.jpg")
                        blob.delete()
                    except Exception as e:
                        pass # Abaikan jika gambar tidak ditemukan
                
                # Hapus dokumen dari Firestore
                db.collection('cctv_events').document(doc.id).delete()
                
            logging.info("Auto-cleanup selesai!")
    except Exception as e:
        logging.error(f"Error saat menjalankan auto-cleanup: {e}")

def main():
    logging.info("=== SCHOOL GUARD MULTICAM SERVER (FIREBASE) ===")
    
    # 1. Fetch Daftar Kamera dari Firebase Firestore
    logging.info("Mengambil daftar kamera dari Firestore...")
    cameras_data = []
    
    try:
        cam_ref = db.collection('cameras').where('status', '==', 'active').get()
        for doc in cam_ref:
            c = doc.to_dict()
            if 'rtsp_url' in c and 'name' in c:
                cameras_data.append(c)
    except Exception as e:
        logging.error(f"Gagal membaca collection 'cameras' dari Firestore: {e}")

    if not cameras_data:
        logging.warning("Tidak ada kamera ditemukan di Firestore. Menggunakan Dummy RTSP sebagai fallback.")
        # Fallback dummy camera if no cameras found in new Firebase DB
        cameras_data = [{"name": "Kamera Demo 1", "rtsp_url": "rtsp://demo:demo@192.168.1.100:554/stream"}]

    # 2. Inisialisasi Multithreaded Streams
    streams = []
    for cam in cameras_data:
        streams.append(CameraStream(cam['name'], cam['rtsp_url']))
    
    logging.info(f"Berhasil menginisialisasi {len(streams)} kamera.")

    # 3. Load Model YOLO (Optimasikan untuk Snapdragon X / NCNN / OpenVINO)
    logging.info("Memuat AI Model...")
    try:
        # Default menggunakan format NCNN (sangat ringan untuk Snapdragon ARM)
        model = YOLO("yolov8n_ncnn_model")
        logging.info("Model YOLOv8 NCNN dimuat dengan sukses!")
    except Exception as e:
        logging.error(f"Gagal memuat model: {e}")
        return

    logging.info("Mulai melakukan patroli Round-Robin pada semua kamera...")

    # 4. Loop Utama (Round Robin)
    while True:
        for stream in streams:
            if not stream.is_connected:
                continue
                
            frame = stream.get_latest_frame()
            if frame is None:
                continue
                
            height, width = frame.shape[:2]
            frame_area = width * height
            
            # --- OPTIMASI: Frame Differencing (Pengganti MOG2 yang berat) ---
            gray = cv2.cvtColor(cv2.resize(frame, (640, 360)), cv2.COLOR_BGR2GRAY)
            gray = cv2.GaussianBlur(gray, (21, 21), 0)
            
            global_motion = False
            motion_mask = None
            if stream.prev_gray is not None:
                frame_diff = cv2.absdiff(stream.prev_gray, gray)
                _, motion_mask = cv2.threshold(frame_diff, 25, 255, cv2.THRESH_BINARY)
                motion_pixels = cv2.countNonZero(motion_mask)
                motion_percent = (motion_pixels / (640 * 360)) * 100
                
                # Jika ada pergerakan sekecil apapun (>0.5%), baru nyalakan YOLO
                if motion_percent > 0.5:
                    global_motion = True
                    
            stream.prev_gray = gray
            
            # Jika tidak ada orang/benda bergerak sama sekali, skip AI! (Hemat CPU 99%)
            if not global_motion and stream.prev_gray is not None:
                continue

            # --- AI DETEKSI ---
            results = model.predict(frame, classes=[0], conf=0.45, verbose=False)
            boxes = results[0].boxes
            stream.last_yolo_boxes = boxes
            
            active_person_class = 0
            largest_area = 0.0
            
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                
                box_area = (x2 - x1) * (y2 - y1)
                area_percentage = (box_area / frame_area) * 100
                
                # Cek pergerakan LOKAL (di dalam kotak orang tersebut) menggunakan motion_mask
                motion_percentage = 0
                if motion_mask is not None:
                    # Mapping koordinat kotak ke ukuran 640x360
                    mx1, my1 = int(x1 * 640 / width), int(y1 * 360 / height)
                    mx2, my2 = int(x2 * 640 / width), int(y2 * 360 / height)
                    local_mask = motion_mask[my1:my2, mx1:mx2]
                    if local_mask.size > 0:
                        local_motion_pixels = cv2.countNonZero(local_mask)
                        motion_percentage = (local_motion_pixels / local_mask.size) * 100

                # Logika sensitivitas: Aktif jika bergerak (45%+), atau objek dekat, atau AI sangat yakin
                is_active = (motion_percentage > 45.0) or (area_percentage > 40.0) or (conf > 0.6)
                
                if is_active:
                    active_person_class += 1
                    if area_percentage > largest_area:
                        largest_area = area_percentage

            # --- LOGIKA TINGKAT BAHAYA ---
            now = datetime.now().time()
            break_times = [
                (dt_time(6, 0), dt_time(7, 20)),
                (dt_time(9, 50), dt_time(10, 20)),
                (dt_time(11, 45), dt_time(13, 0)),
                (dt_time(13, 58), dt_time(14, 15))
            ]
            
            is_break_time = any(start_t <= now <= end_t for start_t, end_t in break_times)
            severity_level = 0
            
            if is_break_time:
                if active_person_class >= 15 or largest_area > 50.0: severity_level = 3 
                elif active_person_class >= 11: severity_level = 2 
                elif active_person_class >= 6: severity_level = 1 
            else:
                if active_person_class >= 5 or largest_area > 50.0: severity_level = 3 
                elif active_person_class >= 3: severity_level = 2 
                elif active_person_class >= 1: severity_level = 1 
            
            # --- KIRIM ALERT ---
            if severity_level > 0:
                current_time = time.time()
                if current_time - stream.last_trigger_time > stream.cooldown:
                    severity_text = ["Low", "Medium", "High"][severity_level - 1]
                    msg = f"ALARM: {active_person_class} orang aktif" if severity_level < 3 else f"BAHAYA: Ada {active_person_class} orang aktif!"
                    
                    # Beri kotak merah pada gambar yang dikirim
                    for box in boxes:
                        bx1, by1, bx2, by2 = map(int, box.xyxy[0])
                        cv2.rectangle(frame, (bx1, by1), (bx2, by2), (0, 0, 255), 3)
                        
                    send_firebase_alert(stream.name, "Aktifitas", severity_text, msg, active_person_class, frame)
                    stream.last_trigger_time = current_time

        # Sleep kecil agar tidak memakan CPU 100% jika semua kelas kosong
        time.sleep(0.05)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logging.info("Sistem dimatikan secara manual.")
