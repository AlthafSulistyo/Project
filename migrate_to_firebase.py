import os
import pymysql
import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime
import uuid

# Inisialisasi Firebase
print("Menghubungkan ke Firebase...")
try:
    cred = credentials.Certificate("schoolguard-648f4-firebase-adminsdk-fbsvc-e2ad46af2e.json")
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'schoolguard-648f4.firebasestorage.app'
    })
    db = firestore.client()
    bucket = storage.bucket()
    print("Berhasil terhubung ke Firebase.")
except Exception as e:
    print(f"Gagal inisialisasi Firebase: {e}")
    exit(1)

# Koneksi ke MySQL
print("Menghubungkan ke database MySQL lokal (Laravel)...")
try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='',
        database='cctv_db',
        cursorclass=pymysql.cursors.DictCursor
    )
    print("Berhasil terhubung ke MySQL.")
except Exception as e:
    print(f"Gagal koneksi ke MySQL: {e}")
    exit(1)

print("\n--- Memulai Proses Migrasi ---")
try:
    with connection.cursor() as cursor:
        # HANYA AMBIL 50 DATA TERBARU
        cursor.execute("SELECT * FROM cctv_events ORDER BY id DESC LIMIT 50")
        events = cursor.fetchall()
        
        print(f"Ditemukan {len(events)} data kejadian terbaru di MySQL (dibatasi maksimal 50 agar cepat).")

        for event in events:
            print(f"\nMigrasi data ID #{event['id']} ({event.get('event_type')})")
            
            event_id = str(uuid.uuid4())
            image_url = None
            
            # Copy gambar ke folder React jika ada
            if event.get('snapshot_path'):
                filename = os.path.basename(event['snapshot_path'])
                
                # Cek 2 kemungkinan lokasi penyimpanan Laravel
                base_dir = r"C:\Users\Althaf\Documents\KULIAH\Tugas Akhir\Project\Backend\storage\app\public"
                possible_paths = [
                    os.path.join(base_dir, "snapshots", filename),
                    os.path.join(base_dir, "cctv_snapshots", filename),
                    os.path.join(base_dir, filename)
                ]
                
                local_path = None
                for path in possible_paths:
                    if os.path.exists(path):
                        local_path = path
                        break

                if local_path:
                    try:
                        import shutil
                        save_dir = r"C:\Users\Althaf\Documents\KULIAH\Tugas Akhir\Project\Frontend\public\snapshots"
                        os.makedirs(save_dir, exist_ok=True)
                        
                        # Format ulang nama sesuai uuid di firestore
                        new_filename = f"{event_id}.jpg"
                        dest_path = os.path.join(save_dir, new_filename)
                        
                        shutil.copy2(local_path, dest_path)
                        image_url = f"/snapshots/{new_filename}"
                        print(f"  [OK] Foto '{filename}' berhasil dicopy ke penyimpanan lokal Frontend!")
                    except Exception as e:
                        print(f"  [GAGAL] Gagal copy foto '{filename}': {e}")
                else:
                    print(f"  [SKIP] File foto fisik '{filename}' tidak ditemukan di komputer.")
            
            # Simpan ke Firestore
            try:
                payload = {
                    "camera_name": event.get('camera_name', 'Unknown Camera'),
                    "timestamp": event.get('created_at', datetime.now()),
                    "category": event.get('event_type', 'Aktivitas'),
                    "severity": event.get('severity', 'low').lower(),
                    "is_reviewed": bool(event.get('is_reviewed', False)),
                    "status": "reviewed" if event.get('is_reviewed') else "unreviewed",
                    "snapshot_url": image_url
                }
                
                db.collection('cctv_events').document(event_id).set(payload)
                print(f"  [OK] Data tersimpan di Firestore!")
            except Exception as e:
                print(f"  [GAGAL] Gagal menyimpan ke Firestore: {e}")

    print("\n✅ MIGRASI SELESAI SELURUHNYA!")

finally:
    connection.close()
