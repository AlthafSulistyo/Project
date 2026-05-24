# SchoolGuard - Aplikasi Dashboard Pemantauan CCTV Berbasis AI

Repository ini berisi source code untuk **SchoolGuard: Sistem Keamanan Sekolah Berbasis Web dengan AI-Enhanced CCTV Monitoring**. Proyek ini dikembangkan sebagai pemenuhan Tugas Akhir (Capstone Project).

## 📖 Deskripsi Singkat

SchoolGuard adalah aplikasi dashboard pemantauan CCTV berbasis web yang dirancang untuk membantu pihak sekolah dalam memantau keamanan dan aktivitas kelas secara terpusat. Sistem ini dilengkapi dengan deteksi anomali berbasis AI yang memberikan notifikasi real-time kepada guru dan staf administrasi ketika terdeteksi aktivitas mencurigakan atau berbahaya.

## 🚀 Fitur Utama

### 📊 Dashboard Monitoring
* Tampilan statistik real-time (Total Kejadian Hari Ini, Kamera Terhubung, Bahaya Terdeteksi)
* Grafik tren aktivitas 24 jam
* Live feed CCTV dengan status koneksi
* Riwayat deteksi terkini dengan filter status

### 📹 Live Monitoring
* Tampilan video CCTV real-time
* PTZ Controls (Pan-Tilt-Zoom)
* Status koneksi dan uptime monitoring
* Recording toggle
* Fullscreen mode support

### 📑 Sistem Laporan
* Filter laporan berdasarkan tanggal, tipe kejadian, dan tingkat bahaya
* Export data ke format **PDF** dan **Excel**
* Statistik kejadian per periode
* Detail kejadian dengan timestamp dan lokasi

### 🔐 Role-Based Access Control (RBAC)
* **Admin:** Full access ke semua fitur termasuk pengaturan sistem
* **Management:** Akses ke laporan dan monitoring
* **Staff:** Akses terbatas ke monitoring dasar

### 🚨 AI-Enhanced Features
* **Anomaly Detection:** Deteksi otomatis kejadian tidak normal
* **Activity Aggregates:** Agregasi data aktivitas per jam/hari/minggu
* **Audit Logs:** Pencatatan seluruh aktivitas pengguna sistem
* **Real-time Notifications:** Peringatan otomatis untuk kejadian kritis

### 🧠 Computer Vision & AI Implementation (YOLOv8)
Sistem ini secara khusus mengimplementasikan **YOLOv8 (You Only Look Once)** untuk mendeteksi objek dan menganalisis aktivitas:
* **Deteksi Objek Real-time:** Menggunakan model `yolov8n` (versi Nano) yang dioptimasi dengan format NCNN agar sangat ringan, dapat dijalankan secara efisien tanpa memerlukan spesifikasi server yang terlalu tinggi.
* **Smart Motion Differencing:** Model AI tidak memproses video yang kosong secara terus-menerus. YOLOv8 hanya akan *triggered* jika sistem mendeteksi adanya pergerakan piksel. Teknik ini menghemat penggunaan komputasi (CPU) secara drastis.
* **Context-Aware Logic:** Algoritma mengkalkulasi jumlah orang aktif (*active persons*), kedekatan/ukuran objek di layar, dan mencocokkannya dengan jadwal harian (seperti jam istirahat atau jam pelajaran) untuk menentukan tingkat keparahan (*Severity Level*: Low, Medium, High).
* **Visual Alerting:** Menandai target secara otomatis dengan *bounding box* pada foto kejadian sesaat sebelum notifikasi (webhook) dikirim ke staf sekolah.

### ⚙️ Pengaturan Sistem
* Manajemen kamera (CRUD operations)
* Konfigurasi notifikasi
* User management dengan role assignment
* System health monitoring

## 🛠️ Teknologi yang Digunakan

### Frontend
* **Framework:** React.js 18 + TypeScript
* **Styling:** Tailwind CSS v3
* **Build Tool:** Vite 6
* **UI Components:** Lucide React Icons
* **Routing:** React Router v7
* **HTTP Client:** Axios
* **Charts:** Recharts

### Backend
* **Framework:** Laravel 11
* **Language:** PHP 8.2+
* **Database:** MySQL 8.0
* **Authentication:** Laravel Sanctum
* **PDF Generation:** DomPDF
* **Excel Export:** PhpSpreadsheet

### AI & Computer Vision
* **Model:** Ultralytics YOLOv8 (yolov8n / NCNN format)
* **Image Processing:** OpenCV (cv2)
* **Environment:** Python 3 + ultralytics
* **Integration:** Webhook REST API

### Development Tools
* **IDE:** Visual Studio Code
* **Version Control:** Git
* **Package Managers:** NPM (Frontend), Composer (Backend)
* **API Testing:** Postman/Thunder Client

## 📦 Cara Menjalankan (Installation)

### Prerequisites
* Node.js >= 18.x
* PHP >= 8.2
* Composer
* MySQL >= 8.0
* Git

### 1. Clone Repository
```bash
git clone https://github.com/AlthafSulistyo/Project.git
cd Project
```

### 2. Setup Backend (Laravel)

```bash
# Masuk ke folder Backend
cd Backend

# Install dependencies
composer install

# Copy environment file
copy .env.example .env

# Generate application key
php artisan key:generate

# Konfigurasi database di .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=schoolguard_db
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations
php artisan migrate

# Seed database dengan data dummy
php artisan db:seed

# Jalankan backend server
php artisan serve
# Server akan berjalan di http://127.0.0.1:8000
```

### 3. Setup Frontend (React)

```bash
# Buka terminal baru, masuk ke folder Frontend
cd Frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
# Server akan berjalan di http://localhost:5173
```

### 4. Akses Aplikasi

Buka browser dan akses: **http://localhost:5173**

**Demo Login Credentials:**
* **Admin:** ID = 1, Password = password
* **Management:** ID = 2, Password = password
* **Staff:** ID = 3, Password = password

## 📁 Struktur Project

```
Project/
├── Backend/               # Laravel 11 API Backend
│   ├── app/
│   │   ├── Models/       # Database Models
│   │   ├── Http/
│   │   │   ├── Controllers/   # API Controllers
│   │   │   ├── Middleware/    # Custom Middleware
│   │   │   └── Requests/      # Form Request Validation
│   │   ├── Services/     # Business Logic Services
│   │   └── Console/      # Artisan Commands
│   ├── database/
│   │   ├── migrations/   # Database Migrations
│   │   └── seeders/      # Data Seeders
│   └── routes/
│       └── api.php       # API Routes
│
└── Frontend/             # React + TypeScript Frontend
    ├── src/
    │   ├── components/   # Reusable Components
    │   │   ├── layout/   # Layout Components
    │   │   └── auth/     # Auth Components
    │   ├── pages/        # Page Components
    │   │   ├── Dashboard.tsx
    │   │   ├── LiveMonitoring.tsx
    │   │   ├── Laporan.tsx
    │   │   ├── Settings.tsx
    │   │   └── Login.tsx
    │   ├── context/      # React Context (Auth)
    │   └── styles/       # Global Styles
    └── public/           # Static Assets
```

## 🔑 API Endpoints

### Authentication
* `POST /api/login` - User login
* `POST /api/logout` - User logout

### Dashboard
* `GET /api/dashboard/stats` - Get dashboard statistics
* `GET /api/dashboard/events` - Get recent events

### CCTV Events
* `GET /api/cctv-events` - List all events (with filters)
* `GET /api/cctv-events/{id}` - Get event details
* `PUT /api/cctv-events/{id}/review` - Mark event as reviewed

### Reports
* `GET /api/reports/generate` - Generate report (PDF/Excel)

### Cameras
* `GET /api/cameras` - List all cameras
* `POST /api/cameras` - Create camera (Admin only)
* `PUT /api/cameras/{id}` - Update camera (Admin only)
* `DELETE /api/cameras/{id}` - Delete camera (Admin only)

## 👨‍💻 Identitas Pengembang

* **Nama:** Althaf Sulistyo Wicaksono
* **NIM:** 0110122227
* **Program Studi:** Sistem Informasi
* **Kampus:** Sekolah Tinggi Teknologi Terpadu Nurul Fikri
* **Email:** alth22227si@student.nurulfikri.ac.id
* **Tahun:** 2026

## 📝 Lisensi

© 2026 Althaf Sulistyo Wicaksono. All Rights Reserved.

Project ini dikembangkan untuk keperluan akademik sebagai Tugas Akhir.

---

## 🙏 Acknowledgments

* Dosen Pembimbing Tugas Akhir
* Dosen Pengampu Capstone Project
* Tim Pengembang Laravel dan React
* Singapore Data.gov.sg untuk Traffic Images API (demo purposes)

## 📞 Kontak

Untuk pertanyaan atau saran, silakan hubungi:
* **Email:** alth22227si@student.nurulfikri.ac.id
* **GitHub:** [@AlthafSulistyo](https://github.com/AlthafSulistyo)
