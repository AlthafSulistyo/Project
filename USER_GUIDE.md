# 📖 Panduan Penggunaan SchoolGuard - Sistem Pemantauan CCTV Berbasis AI

## 🎯 Ringkasan Produk

**SchoolGuard** adalah aplikasi dashboard pemantauan CCTV berbasis web yang dirancang khusus untuk sekolah. Sistem ini menggunakan teknologi AI untuk mendeteksi aktivitas mencurigakan atau berbahaya secara otomatis, memberikan notifikasi real-time, dan menyediakan laporan komprehensif untuk evaluasi keamanan sekolah.

---

## 🔐 Cara Login ke Sistem

### Langkah-langkah Login:

1. **Buka aplikasi** di browser: `http://localhost:5173`
2. **Masukkan ID User** dan **Password**
3. **Klik tombol "Masuk"**

### Demo Credentials (3 Role):

| Role | ID User | Password | Akses |
|------|---------|----------|-------|
| **Admin** | 1 | password | Full access (semua fitur + pengaturan) |
| **Management** | 2 | password | Monitoring + Laporan |
| **Staff** | 3 | password | Monitoring dasar |

> ✅ **Default:** ID = 1 (Admin) sudah terisi otomatis untuk kemudahan testing

---

## 📊 Fitur 1: Dashboard Monitoring

### Deskripsi:
Halaman utama yang menampilkan ringkasan statistik keamanan sekolah secara real-time.

### Komponen Dashboard:

#### 1️⃣ **Stat Cards (Kartu Statistik)**
Menampilkan 3 metrik utama:

- **Total Kejadian Hari Ini** (Kartu Biru)
  - Jumlah seluruh kejadian yang terdeteksi hari ini
  - Icon: Activity (📈)
  
- **Kamera Terhubung** (Kartu Hijau)
  - Status kamera aktif vs total kamera
  - Format: 1/10 (1 aktif dari 10 kamera)
  - Icon: Video (📹)
  
- **Bahaya Terdeteksi** (Kartu Merah)
  - Jumlah kejadian dengan tingkat bahaya "high"
  - Berkedip jika ada anomali aktif
  - Icon: Alert Triangle (⚠️)

#### 2️⃣ **Live Video Feed**
- Menampilkan feed CCTV dari kamera aktif
- Badge "LIVE" berwarna merah di pojok atas
- Timestamp real-time

#### 3️⃣ **Grafik Tren Aktivitas (24 Jam)**
- Menampilkan pola aktivitas dalam 24 jam terakhir
- Sumbu X: Waktu (jam)
- Sumbu Y: Jumlah kejadian
- Warna: Biru dengan area fill

#### 4️⃣ **Riwayat Deteksi Terkini**
Tabel kejadian terbaru dengan kolom:
- **Waktu:** Timestamp kejadian
- **Tipe:** Jenis kejadian (Normal Activity, Suspicious, etc.)
- **Tingkat Bahaya:** Badge berwarna (Low/Medium/High)
- **Lokasi:** Nama kamera
- **Status:** Reviewed/Pending
- **Aksi:** Tombol "Lihat Detail" dan "Tandai Direview"

### Cara Menggunakan:

1. **Monitoring Real-time:**
   - Perhatikan stat cards untuk overview cepat
   - Cek video feed untuk visual langsung
   
2. **Analisis Tren:**
   - Lihat grafik untuk pola aktivitas
   - Identifikasi jam-jam dengan aktivitas tinggi
   
3. **Review Kejadian:**
   - Klik "Lihat Semua" untuk filter lebih detail
   - Klik "Tandai Direview" untuk mengubah status

---

## 📹 Fitur 2: Live Monitoring

### Deskripsi:
Halaman khusus untuk memantau feed CCTV secara penuh layar dengan kontrol PTZ (Pan-Tilt-Zoom).

### Komponen:

#### 1️⃣ **Main Video Area**
- Video CCTV ukuran besar
- Overlay informasi:
  - Nama kamera (CAM_01_Kelas_9.1)
  - Lokasi (Main Gate)
  - Resolusi (4K Ultra HD)
  - Timestamp real-time
- Support fullscreen mode

#### 2️⃣ **Status Panel**
Menampilkan:
- **Connection Status:** Stable/Unstable
- **IP Address:** IP kamera
- **Uptime:** Durasi kamera online
- **Last Command:** Perintah PTZ terakhir

#### 3️⃣ **PTZ Controls (Pan-Tilt-Zoom)**
Kontrol pergerakan kamera:
- **D-Pad (4 arah):**
  - ⬆️ TILT UP (Miring ke atas)
  - ⬇️ TILT DOWN (Miring ke bawah)
  - ⬅️ PAN LEFT (Geser ke kiri)
  - ➡️ PAN RIGHT (Geser ke kanan)
  
- **Zoom Controls:**
  - 🔍 ZOOM IN (Perbesar)
  - 🔍 ZOOM OUT (Perkecil)

#### 4️⃣ **Recording Toggle**
- Button "Recording ON" (merah) untuk simulasi recording
- Animasi spinning saat aktif

### Cara Menggunakan:

1. **Lihat Feed CCTV:**
   - Video akan auto-play saat halaman dibuka
   - Monitor nama kamera dan lokasi di overlay atas

2. **Kontrol Kamera:**
   - Klik tombol panah untuk menggerakkan kamera
   - Klik ZOOM IN/OUT untuk zoom
   - Notifikasi toast muncul saat perintah dikirim

3. **Fullscreen Mode:**
   - Klik tombol "Fullscreen" di header
   - Tekan ESC untuk keluar dari fullscreen

4. **Recording:**
   - Klik "Recording ON" untuk toggle
   - Icon disc akan berputar saat recording aktif

---

## 📑 Fitur 3: Laporan (Reports)

### Deskripsi:
Sistem pelaporan lengkap dengan filter, statistik, dan export ke PDF/Excel.

### Komponen:

#### 1️⃣ **Filter Panel**
- **Tanggal Mulai & Tanggal Akhir:** DatePicker untuk range
- **Tipe Kejadian:** Dropdown (Semua, Normal, Suspicious, etc.)
- **Tingkat Bahaya:** Dropdown (Semua, Low, Medium, High)
- **Tombol "Terapkan Filter"** dan **"Reset Filter"**

#### 2️⃣ **Statistik Summary**
4 kartu metrik:
- **Total Kejadian:** Jumlah dalam periode filter
- **Belum Direview:** Kejadian pending
- **Tingkat Bahaya Tinggi:** Kejadian kritis
- **Status Review:** Persentase reviewed

#### 3️⃣ **Tabel Data Kejadian**
Kolom lengkap:
- Timestamp
- Tipe Kejadian
- Tingkat Bahaya (badge berwarna)
- Lokasi Kamera
- Status Review
- Anomali (Ya/Tidak)
- Aksi (Detail button)

#### 4️⃣ **Export Buttons**
- **Export PDF:** Download laporan format PDF
- **Export Excel:** Download laporan format .xlsx

### Cara Menggunakan:

1. **Filter Data:**
   ```
   - Pilih tanggal mulai: 01/01/2026
   - Pilih tanggal akhir: 31/01/2026
   - Pilih tipe: "Suspicious Activity"
   - Pilih bahaya: "High"
   - Klik "Terapkan Filter"
   ```

2. **Analisis Summary:**
   - Lihat 4 kartu statistik untuk overview
   - Fokus pada "Belum Direview" untuk prioritas

3. **Export Laporan:**
   - **PDF:** Klik "Export PDF" → File terdownload otomatis
     - Format: `laporan_cctv_2026-01-01_to_2026-01-31.pdf`
     - Berisi: Header, tabel data, footer
   
   - **Excel:** Klik "Export Excel" → File .xlsx terdownload
     - Format: `laporan_cctv_2026-01-01_to_2026-01-31.xlsx`
     - Sheet: Data kejadian + styling

4. **Reset Filter:**
   - Klik "Reset Filter" untuk kembali ke tampilan semua data

---

## ⚙️ Fitur 4: Pengaturan (Settings)

### Deskripsi:
Halaman konfigurasi sistem dan manajemen kamera (khusus Admin).

### Komponen:

#### 1️⃣ **Manajemen Kamera (Admin Only)**

**List Kamera:**
- Tabel dengan kolom:
  - ID Kamera
  - Nama Kamera
  - Lokasi
  - IP Address
  - Status (Online/Offline)
  - Aksi (Edit/Delete)

**Form Tambah/Edit Kamera:**
```
- Nama Kamera: [Input Text]
- Lokasi: [Input Text]
- IP Address: [Input Text]
- Status: [Dropdown: Online/Offline]
- Tombol: "Simpan" / "Batal"
```

**Cara Menambah Kamera:**
1. Klik tombol **"+ Tambah Kamera"**
2. Isi form:
   - Nama: CAM_02_Koridor
   - Lokasi: Koridor Lt. 1
   - IP: 192.168.1.102
   - Status: Online
3. Klik **"Simpan"**
4. Kamera muncul di list

**Cara Edit Kamera:**
1. Klik icon **Edit (✏️)** di baris kamera
2. Form muncul dengan data terisi
3. Ubah data yang diperlukan
4. Klik **"Simpan"**

**Cara Hapus Kamera:**
1. Klik icon **Delete (🗑️)** di baris kamera
2. Konfirmasi popup muncul
3. Klik **"Ya, Hapus"**

#### 2️⃣ **Notifikasi Settings**
- Toggle untuk aktifkan/nonaktifkan notifikasi
- Konfigurasi threshold alert
- Email notification settings

#### 3️⃣ **User Profile**
- Nama user
- Role (Admin/Management/Staff)
- Email
- Tombol "Logout"

### Cara Menggunakan:

1. **Manajemen Kamera (Admin):**
   - Gunakan untuk menambah/edit/hapus kamera
   - Pastikan IP address valid
   - Set status "Online" hanya untuk kamera aktif

2. **Notifikasi:**
   - Toggle ON untuk menerima alert
   - Set threshold sesuai kebutuhan

3. **Logout:**
   - Klik tombol "Keluar" di pojok kanan atas
   - Atau di User Profile section

---

## 🚨 Fitur Advanced: AI & Automation

### 1️⃣ **Anomaly Detection (Deteksi Anomali)**

**Cara Kerja:**
- Sistem otomatis menganalisis pola aktivitas
- Jika terdeteksi penyimpangan → Flag sebagai anomali
- Badge "Anomali: Ya" muncul di tabel
- Tingkat bahaya otomatis naik ke "High"

**Contoh Anomali:**
- Aktivitas di luar jam sekolah
- Lonjakan aktivitas mendadak
- Pola tidak wajar

### 2️⃣ **Activity Aggregates**

**Fitur:**
- Data agregasi per jam, hari, minggu
- Background job (Artisan command)
- Untuk analisis tren jangka panjang

**Command:**
```bash
php artisan calculate:activity-aggregates
```

### 3️⃣ **Audit Logs**

**Fitur:**
- Mencatat semua aktivitas user:
  - Login/Logout
  - Create/Update/Delete data
  - Filter laporan
  - Export data
- Timestamp + IP Address
- User identifier

**Akses:** Admin only di menu Settings

---

## 🔐 Role-Based Access Control (RBAC)

### Pembagian Akses Berdasarkan Role:

| Fitur | Admin | Management | Staff |
|-------|-------|------------|-------|
| **Dashboard** | ✅ Full | ✅ Full | ✅ Limited |
| **Live Monitoring** | ✅ | ✅ | ✅ |
| **Laporan** | ✅ + Export | ✅ + Export | ❌ |
| **Settings - Kamera** | ✅ | ❌ | ❌ |
| **Settings - Notifikasi** | ✅ | ✅ | ❌ |
| **Audit Logs** | ✅ | ❌ | ❌ |

### Cara Role Bekerja:

1. **Saat Login:**
   - Sistem cek role user
   - Menu disesuaikan dengan role
   - Endpoint API diproteksi middleware

2. **Middleware Protection:**
   ```php
   // Backend Laravel
   Route::middleware(['auth:sanctum', 'role:admin'])
   ```

3. **Frontend Guard:**
   ```typescript
   // React Context
   if (user.role !== 'admin') {
     return <Navigate to="/dashboard" />
   }
   ```

---

## 📱 Tips Penggunaan Optimal

### 1. **Monitoring Harian (Staff/Management)**
```
08:00 - Login sebagai Staff/Management
08:05 - Cek Dashboard → Lihat stat cards
08:10 - Review "Bahaya Terdeteksi" jika ada
08:15 - Tandai kejadian sebagai "Direview"
08:30 - Monitor Live Feed via Live Monitoring
```

### 2. **Pembuatan Laporan Mingguan (Management/Admin)**
```
Setiap Senin:
1. Buka menu "Laporan"
2. Set filter: 7 hari terakhir
3. Tipe: "Semua"
4. Bahaya: "High" + "Medium"
5. Export Excel untuk data mentah
6. Export PDF untuk presentasi
7. Analisis tren dari grafik
```

### 3. **Manajemen Sistem (Admin)**
```
Rutin:
- Cek status kamera (Settings → Manajemen Kamera)
- Review audit logs untuk keamanan
- Update konfigurasi notifikasi
- Hapus data lama jika perlu
```

### 4. **Respons Kejadian Kritis**
```
Jika "Bahaya Terdeteksi" > 0:
1. Segera buka Dashboard
2. Klik "Lihat Semua" di Riwayat Deteksi
3. Filter: Tingkat Bahaya = "High"
4. Review setiap kejadian
5. Cek Live Monitoring untuk verifikasi visual
6. Tandai sebagai "Direview" setelah ditindaklanjuti
7. Export laporan untuk dokumentasi
```

---

## 🔄 Alur Kerja End-to-End

### Scenario: Deteksi Aktivitas Mencurigakan

```
[1] CCTV menangkap aktivitas → Data masuk ke database
                ↓
[2] AI Anomaly Detection menganalisis → Flag sebagai "Suspicious"
                ↓
[3] Dashboard update real-time → Stat card "Bahaya Terdeteksi" +1
                ↓
[4] Notifikasi ke Admin/Management → Alert muncul
                ↓
[5] Staff review via Live Monitoring → Visual confirmation
                ↓
[6] Staff tandai "Direview" → Status berubah di database
                ↓
[7] Admin export laporan → PDF/Excel untuk dokumentasi
                ↓
[8] Audit log mencatat semua aktivitas → Tracking lengkap
```

---

## ❓ FAQ (Frequently Asked Questions)

### Q1: Bagaimana cara menambah kamera baru?
**A:** Login sebagai Admin → Settings → Manajemen Kamera → + Tambah Kamera → Isi form → Simpan

### Q2: Laporan tidak muncul data setelah filter?
**A:** Pastikan range tanggal benar dan ada data dalam periode tersebut. Coba reset filter terlebih dahulu.

### Q3: Video Live Monitoring tidak muncul?
**A:** Cek koneksi internet, pastikan browser support iframe, dan kamera dalam status "Online".

### Q4: Bagaimana cara logout?
**A:** Klik tombol "Keluar" di pojok kanan atas header, atau di Settings → User Profile.

### Q5: Export PDF/Excel lambat?
**A:** Wajar jika data banyak (>1000 records). Gunakan filter untuk memperkecil range data.

---

## 📞 Support & Troubleshooting

### Masalah Umum:

**1. Error saat login:**
- Cek backend server running: `php artisan serve`
- Cek database connection di `.env`
- Pastikan credentials benar

**2. Data dashboard kosong:**
- Jalankan seeder: `php artisan db:seed`
- Refresh browser (Ctrl+F5)

**3. Export gagal:**
- Pastikan folder storage writable
- Cek log: `storage/logs/laravel.log`

---

## 🎓 Kesimpulan

**SchoolGuard** adalah solusi komprehensif untuk pemantauan keamanan sekolah yang menggabungkan:
- ✅ Monitoring real-time
- ✅ AI-powered anomaly detection
- ✅ Comprehensive reporting
- ✅ Multi-level access control
- ✅ User-friendly interface

Dengan mengikuti panduan ini, pengguna dapat memaksimalkan semua fitur yang tersedia untuk meningkatkan keamanan dan efisiensi monitoring sekolah.

---

**© 2026 Althaf Sulistyo Wicaksono - SchoolGuard v1.0**
