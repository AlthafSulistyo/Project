# Hikvision ISAPI Integration - Dokumentasi Lengkap

## 📋 Overview

Kode ini mengimplementasikan integrasi dengan **Hikvision ISAPI Protocol** untuk menarik data event dari Smart CCTV secara otomatis. Sistem fokus pada **klasifikasi objek (Manusia/Kendaraan)** dalam format JSON/XML tanpa memproses video.

## 🎯 Fitur Utama

- ✅ Koneksi ke Hikvision ISAPI menggunakan HTTP Digest Authentication
- ✅ Pull event data otomatis dengan object classification (Human/Vehicle)
- ✅ Parsing JSON/XML response dari ISAPI
- ✅ Deduplication event berdasarkan `isapi_event_id`
- ✅ Mock mode untuk testing tanpa hardware fisik
- ✅ Scheduled sync otomatis setiap X menit (configurable)
- ✅ API endpoints untuk testing koneksi dan manual sync
- ✅ Artisan command untuk sync via CLI

## 📁 File yang Dibuat

### 1. Database Migrations

#### `2026_01_15_000001_add_isapi_fields_to_cameras_table.php`
Menambahkan field ISAPI ke tabel cameras:
- `isapi_host` - IP/hostname kamera
- `isapi_port` - Port ISAPI (default: 80)
- `isapi_username` - Username autentikasi
- `isapi_password` - Password terenkripsi
- `isapi_enabled` - Enable/disable per camera
- `last_event_sync_at` - Timestamp sync terakhir

#### `2026_01_15_000002_add_object_classification_to_cctv_events.php`
Menambahkan field klasifikasi objek ke tabel cctv_events:
- `object_type` - Enum: 'human', 'vehicle', 'unknown'
- `isapi_event_id` - ID event dari ISAPI (untuk deduplication)
- `raw_event_data` - JSON data lengkap dari ISAPI
- `detection_region` - Koordinat area deteksi

### 2. Configuration

#### `config/isapi.php`
File konfigurasi untuk ISAPI settings:
- ISAPI endpoints
- Object type mapping
- Severity mapping
- Sync interval dan timeout

### 3. Models

#### `app/Models/Camera.php` (Updated)
Tambahan fitur:
- Auto-encrypt/decrypt password ISAPI
- Fillable fields untuk ISAPI
- Helper method `getIsapiUrlAttribute()`

#### `app/Models/CctvEvent.php` (Updated)
Tambahan fitur:
- Fillable fields untuk object classification
- JSON casting untuk `raw_event_data` dan `detection_region`
- Scope methods: `scopeHumans()`, `scopeVehicles()`

### 4. Services

#### `app/Services/HikvisionISAPIService.php`
Service utama untuk komunikasi ISAPI:

**Methods:**
- `testConnection()` - Test koneksi ke kamera
- `getDeviceInfo()` - Ambil info device dari ISAPI
- `fetchEvents()` - Pull events dalam time range
- `syncEventsToDatabase()` - Simpan events ke DB
- `parseEventResponse()` - Parse XML/JSON response
- `extractObjectClassification()` - Ekstrak Human/Vehicle
- `generateMockEvents()` - Generate data mock untuk testing

### 5. Controllers

#### `app/Http/Controllers/HikvisionISAPIController.php`
Controller untuk ISAPI endpoints:

**Endpoints (Admin only):**
- `POST /api/cameras/{camera}/isapi/test-connection` - Test koneksi
- `GET /api/cameras/{camera}/isapi/device-info` - Info device
- `POST /api/cameras/{camera}/isapi/sync-events` - Manual sync
- `POST /api/isapi/sync-all` - Sync semua kamera

### 6. Console Commands

#### `app/Console/Commands/SyncHikvisionEvents.php`
Artisan command untuk sync events:

**Usage:**
```bash
# Sync semua kamera
php artisan isapi:sync-events

# Sync kamera tertentu
php artisan isapi:sync-events --camera=1

# Menggunakan mock mode
php artisan isapi:sync-events --mock

# Sync X hari ke belakang
php artisan isapi:sync-events --days=7
```

### 7. Routes

#### `routes/api.php` (Updated)
Menambahkan routes untuk ISAPI management dalam group admin.

### 8. Environment

#### `.env.example` (Updated)
Menambahkan variabel environment:
```
ISAPI_ENABLED=true
ISAPI_MOCK_MODE=true
ISAPI_DEFAULT_PORT=80
ISAPI_TIMEOUT_SECONDS=10
ISAPI_SYNC_INTERVAL_MINUTES=5
ISAPI_INITIAL_SYNC_DAYS=1
```

## 🚀 Cara Menggunakan

### Step 1: Setup Database

```bash
# Jalankan migration
php artisan migrate
```

### Step 2: Konfigurasi Environment

Edit file `.env`:
```
ISAPI_ENABLED=true
ISAPI_MOCK_MODE=true  # Set false saat pakai CCTV asli
ISAPI_SYNC_INTERVAL_MINUTES=5
```

### Step 3: Testing dengan Mock Mode

```bash
# Test sync dengan mock data
php artisan isapi:sync-events --mock
```

### Step 4: Tambah Kamera dengan ISAPI

**Via API (Admin):**
```json
POST /api/cameras
{
  "name": "CCTV Pintu Masuk",
  "location": "Lantai 1",
  "isapi_host": "192.168.1.100",
  "isapi_port": 80,
  "isapi_username": "admin",
  "isapi_password": "password123",
  "isapi_enabled": true,
  "status": "active"
}
```

**Via Tinker:**
```php
php artisan tinker

Camera::create([
    'name' => 'CCTV Test',
    'location' => 'Test Location',
    'isapi_host' => '192.168.1.100',
    'isapi_port' => 80,
    'isapi_username' => 'admin',
    'isapi_password' => 'admin123',
    'isapi_enabled' => true,
    'status' => 'active'
]);
```

### Step 5: Test Koneksi

**Via API:**
```
POST /api/cameras/1/isapi/test-connection
```

**Response (Mock Mode):**
```json
{
  "success": true,
  "message": "Mock connection successful",
  "device_info": {
    "device_name": "Mock Hikvision Smart CCTV",
    "model": "DS-2CD2185FWD-I",
    "firmware_version": "V5.7.13"
  }
}
```

### Step 6: Sync Events Manual

**Via API:**
```
POST /api/cameras/1/isapi/sync-events
{
  "start_time": "2026-01-14 00:00:00",
  "end_time": "2026-01-14 23:59:59"
}
```

**Via Command:**
```bash
php artisan isapi:sync-events --camera=1
```

### Step 7: Setup Automatic Sync (Optional)

Edit `app/Console/Kernel.php`, tambahkan:

```php
protected function schedule(Schedule $schedule)
{
    // Sync events setiap 5 menit
    $schedule->command('isapi:sync-events')
        ->everyFiveMinutes()
        ->withoutOverlapping();
}
```

Jalankan scheduler:
```bash
php artisan schedule:work
```

## 📊 Query Events dengan Object Classification

```php
// Get semua event manusia
$humanEvents = CctvEvent::humans()->get();

// Get semua event kendaraan
$vehicleEvents = CctvEvent::vehicles()->get();

// Get events dengan filter
$events = CctvEvent::where('object_type', 'human')
    ->where('severity', 'high')
    ->unreviewed()
    ->with('camera')
    ->get();

// Get raw ISAPI data
$event = CctvEvent::find(1);
$rawData = $event->raw_event_data; // Array dari ISAPI response
$region = $event->detection_region; // Koordinat deteksi
```

## 🔧 Menggunakan dengan CCTV Asli

Ketika CCTV fisik sudah tersedia:

1. **Update Environment:**
```
ISAPI_MOCK_MODE=false
```

2. **Pastikan Network:**
- CCTV dan server dalam network yang sama
- Port 80 (HTTP) terbuka
- Test ping ke IP kamera

3. **Update Kamera:**
```php
Camera::find(1)->update([
    'isapi_host' => '192.168.1.100',  // IP asli kamera
    'isapi_username' => 'admin',       // Username asli
    'isapi_password' => 'password',    // Password asli
    'isapi_enabled' => true
]);
```

4. **Test Koneksi:**
```bash
php artisan isapi:sync-events --camera=1
```

## 🎭 Mock Mode vs Real Mode

| Feature | Mock Mode | Real Mode |
|---------|-----------|-----------|
| ISAPI Connection | Simulated | Actual HTTP request |
| Events | Random generated | From real CCTV |
| Device Info | Static mock data | From ISAPI endpoint |
| Network Required | ❌ No | ✅ Yes |
| Use Case | Testing, development | Production |

## 📝 ISAPI Endpoints yang Digunakan

1. **Device Info:** `/ISAPI/System/deviceInfo`
2. **Event Search:** `/ISAPI/ContentMgmt/EventSearch`
3. **Smart Events:** `/ISAPI/Smart/channels/{id}/events`

## 🔐 Security

- Password ISAPI **auto-encrypted** menggunakan Laravel Crypt
- API endpoints hanya untuk **Admin role**
- SSL verification disabled untuk local network (bisa di-enable jika perlu)

## 🐛 Troubleshooting

### Error: "Connection failed"
- Cek network connectivity ke kamera
- Pastikan IP dan port benar
- Verify username/password
- Cek firewall settings

### Error: "ISAPI request failed: 401"
- Username atau password salah
- Cek authentication type (Digest vs Basic)

### Tidak ada events yang ter-sync
- Pastikan kamera punya events dalam time range
- Cek `last_event_sync_at` di database
- Coba perluas time range sync

### Events duplicate
- Deduplication otomatis via `isapi_event_id`
- Jika masih duplicate, cek database constraints

## 📚 Referensi

- [Hikvision ISAPI Documentation](https://www.hikvision.com/en/support/download/sdk/)
- Laravel HTTP Client: https://laravel.com/docs/http-client
- Laravel Encryption: https://laravel.com/docs/encryption

## 💡 Tips

1. Gunakan **mock mode** untuk development tanpa hardware
2. Set sync interval sesuai kebutuhan (jangan terlalu sering)
3. Monitor disk space untuk `raw_event_data` jika volume tinggi
4. Gunakan queue untuk sync dalam production
5. Backup database secara regular

## ✅ Checklist Implementasi

- [x] Migrations
- [x] Models with encryption
- [x] ISAPI Service dengan parsing XML/JSON
- [x] Controller dengan endpoints
- [x] Console command
- [x] Routes update
- [x] Configuration file
- [x] Mock mode support
- [x] Object classification (Human/Vehicle)
- [x] Event deduplication
- [ ] Scheduled task setup (opsional)
- [ ] Testing dengan CCTV asli (butuh hardware)

---

**Created:** 2026-01-14  
**Version:** 1.0  
**Status:** Ready for Testing
