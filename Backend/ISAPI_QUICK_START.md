# Quick Start - Hikvision ISAPI Integration

## 🎯 Data CCTV Hikvision Anda

**RTSP URL:** `rtsp://admin:Hikv2024@192.168.18.7:554/Streaming/Channels/101`

**ISAPI Connection Info:**
- **Host:** 192.168.18.7
- **Port:** 80 (HTTP) / 443 (HTTPS)
- **Username:** admin
- **Password:** Hikv2024
- **RTSP Port:** 554 (untuk video streaming)

## 🚀 Setup Cepat (5 Langkah)

### 1. Jalankan Migration
```bash
cd Backend
php artisan migrate
```

### 2. Seed Camera dengan Data Anda
```bash
php artisan db:seed --class=HikvisionCameraSeeder
```

Atau manual via Tinker:
```bash
php artisan tinker
```
```php
Camera::create([
    'name' => 'Hikvision Smart CCTV',
    'location' => 'Main Entrance',
    'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.7:554/Streaming/Channels/101',
    'isapi_host' => '192.168.18.7',
    'isapi_port' => 80,
    'isapi_username' => 'admin',
    'isapi_password' => 'Hikv2024',
    'isapi_enabled' => true,
    'status' => 'active'
]);
```

### 3. Update Environment
Edit `.env`:
```env
ISAPI_ENABLED=true
ISAPI_MOCK_MODE=false  # Set false untuk pakai CCTV asli
ISAPI_SYNC_INTERVAL_MINUTES=5
```

### 4. Test Koneksi
```bash
# Via command line
php artisan isapi:sync-events --camera=1

# Atau via API (butuh login sebagai admin)
POST http://localhost:8000/api/cameras/1/isapi/test-connection
Authorization: Bearer {your_token}
```

### 5. Sync Events Otomatis
```bash
# One-time sync
php artisan isapi:sync-events

# Enable scheduler untuk auto-sync
php artisan schedule:work
```

## 📝 Test dengan Real CCTV

### Prerequisites
1. ✅ Pastikan PC/Server bisa ping ke `192.168.18.7`
2. ✅ CCTV dan server dalam network yang sama
3. ✅ Port 80 (HTTP) terbuka di firewall

### Test Manual
```bash
# Test ping
ping 192.168.18.7

# Test ISAPI endpoint (manual)
curl -u admin:Hikv2024 http://192.168.18.7/ISAPI/System/deviceInfo
```

### Expected Response (Device Info)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<DeviceInfo>
    <deviceName>IP Camera</deviceName>
    <deviceID>...</deviceID>
    <model>DS-2CD2xxx</model>
    <serialNumber>...</serialNumber>
    <firmwareVersion>V5.x.x</firmwareVersion>
</DeviceInfo>
```

## 🎯 Sync Events dari CCTV

### Via CLI (Recommended untuk testing)
```bash
# Sync today's events
php artisan isapi:sync-events --camera=1

# Sync last 7 days
php artisan isapi:sync-events --camera=1 --days=7

# Sync all cameras
php artisan isapi:sync-events
```

### Via API
```bash
POST /api/cameras/1/isapi/sync-events
Content-Type: application/json
Authorization: Bearer {token}

{
  "start_time": "2026-02-14 00:00:00",
  "end_time": "2026-02-14 23:59:59"
}
```

### Check Results
```bash
php artisan tinker
```
```php
// Get latest events
CctvEvent::with('camera')->latest()->take(10)->get();

// Get human detections
CctvEvent::humans()->with('camera')->get();

// Get vehicle detections
CctvEvent::vehicles()->with('camera')->get();

// Get today's events
CctvEvent::whereDate('created_at', today())->get();
```

## 🔧 Troubleshooting

### Error: Connection timeout
**Solusi:**
- Cek network: `ping 192.168.18.7`
- Pastikan CCTV menyala
- Cek firewall di CCTV dan PC

### Error: 401 Unauthorized
**Solusi:**
- Verify username/password
- Coba login manual via browser: `http://192.168.18.7`
- Reset password CCTV jika perlu

### Error: No events returned
**Kemungkinan:**
- CCTV belum ada event dalam time range
- Smart detection belum diaktifkan di CCTV
- Channel ID salah (101 vs 102)

**Cek settings CCTV:**
1. Login ke web interface: `http://192.168.18.7`
2. Menu: Configuration → Event → Smart Event
3. Enable: Line Crossing Detection, Intrusion Detection, dll
4. Set Detection Target: Human, Vehicle

## 📊 ISAPI Endpoints untuk Hikvision

Berdasarkan IP Anda (`192.168.18.7`):

| Endpoint | URL |
|----------|-----|
| Device Info | `http://192.168.18.7/ISAPI/System/deviceInfo` |
| Event Search | `http://192.168.18.7/ISAPI/ContentMgmt/EventSearch` |
| Smart Events | `http://192.168.18.7/ISAPI/Smart/channels/101/events` |
| Snapshot | `http://192.168.18.7/ISAPI/Streaming/channels/101/picture` |

## 🔐 Security Notes

- Password `Hikv2024` akan **auto-encrypted** di database
- Jangan commit `.env` dengan credentials asli
- Gunakan VPN jika akses CCTV dari luar network

## 📚 Next Steps

1. ✅ Setup camera (done via seeder)
2. ✅ Test connection
3. ✅ Sync events
4. ⏳ Configure auto-sync scheduler
5. ⏳ Integrate ke frontend dashboard
6. ⏳ Setup notification untuk event baru

---

**Data CCTV:** 192.168.18.7  
**Status:** Ready for Testing  
**Last Updated:** 2026-02-14
