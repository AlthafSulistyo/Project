import pymysql
import firebase_admin
from firebase_admin import credentials, firestore

print("Menghubungkan ke Firebase...")
try:
    cred = credentials.Certificate("schoolguard-648f4-firebase-adminsdk-fbsvc-e2ad46af2e.json")
    # Cek apakah firebase_admin sudah inisialisasi (jika digabung dengan script lain)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"Gagal Firebase: {e}")
    exit(1)

print("Menghubungkan ke MySQL...")
try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='',
        database='cctv_db',
        cursorclass=pymysql.cursors.DictCursor
    )
except Exception as e:
    print(f"Gagal MySQL: {e}")
    exit(1)

print("Memulai Migrasi Data Kamera...")
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM cameras")
        cameras = cursor.fetchall()
        
        for cam in cameras:
            # Gunakan ID kamera lama sebagai Document ID di Firestore
            doc_id = str(cam['id'])
            
            payload = {
                "name": cam.get('name', f"Kamera {doc_id}"),
                "location": cam.get('location', 'Belum Diatur'),
                "status": cam.get('status', 'active'),
                "rtsp_url": cam.get('rtsp_url', '')
            }
            
            db.collection('cameras').document(doc_id).set(payload)
            print(f"  [OK] Kamera '{payload['name']}' berhasil dipindahkan!")

    print("\n✅ MIGRASI KAMERA SELESAI!")
finally:
    connection.close()
