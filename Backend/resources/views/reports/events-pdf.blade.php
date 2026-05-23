<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Aktivitas CCTV - SchoolGuard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
        }
        
        .header h1 {
            font-size: 24px;
            color: #1e40af;
            margin-bottom: 5px;
        }
        
        .header p {
            font-size: 11px;
            color: #64748b;
        }
        
        .info-section {
            background-color: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .info-label {
            font-weight: bold;
            color: #475569;
        }
        
        .info-value {
            color: #1e293b;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        th {
            background-color: #2563eb;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
        }
        
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
        }
        
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        
        tr:hover {
            background-color: #e0f2fe;
        }
        
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .badge-high {
            background-color: #fee2e2;
            color: #991b1b;
        }
        
        .badge-medium {
            background-color: #fef3c7;
            color: #92400e;
        }
        
        .badge-low {
            background-color: #d1fae5;
            color: #065f46;
        }
        
        .badge-reviewed {
            background-color: #d1fae5;
            color: #065f46;
        }
        
        .badge-new {
            background-color: #dbeafe;
            color: #1e40af;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #cbd5e1;
            text-align: center;
            font-size: 10px;
            color: #64748b;
        }
        
        .summary-box {
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;
        }
        
        .summary-item {
            text-align: center;
            padding: 10px;
            background-color: #f8fafc;
            border-radius: 5px;
            min-width: 150px;
        }
        
        .summary-value {
            font-size: 20px;
            font-weight: bold;
            color: #2563eb;
        }
        
        .summary-label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>SchoolGuard - Laporan Aktivitas CCTV</h1>
        <p>Sistem Keamanan Sekolah</p>
    </div>

    <!-- Info Section -->
    <div class="info-section">
        <div class="info-row">
            <span class="info-label">Periode:</span>
            <span class="info-value">
                {{ $startDate ? \Carbon\Carbon::parse($startDate)->format('d M Y') : 'Semua' }} 
                - 
                {{ $endDate ? \Carbon\Carbon::parse($endDate)->format('d M Y') : 'Semua' }}
            </span>
        </div>
        <div class="info-row">
            <span class="info-label">Kamera:</span>
            <span class="info-value">{{ $events->first()?->camera->name ?? 'Semua Kamera' }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Dibuat pada:</span>
            <span class="info-value">{{ now()->format('d M Y, H:i') }} WIB</span>
        </div>
    </div>

    <!-- Summary -->
    <div class="summary-box">
        <div class="summary-item">
            <div class="summary-value">{{ $events->count() }}</div>
            <div class="summary-label">Total Kejadian</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">{{ $events->where('severity', 'high')->count() }}</div>
            <div class="summary-label">Tingkat Tinggi</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">{{ $events->where('is_reviewed', false)->count() }}</div>
            <div class="summary-label">Belum Direview</div>
        </div>
    </div>

    <!-- Events Table -->
    <table>
        <thead>
            <tr>
                <th style="width: 15%;">Tanggal</th>
                <th style="width: 12%;">Waktu</th>
                <th style="width: 23%;">Kamera</th>
                <th style="width: 20%;">Jenis Deteksi</th>
                <th style="width: 15%;">Tingkat</th>
                <th style="width: 15%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($events as $event)
            <tr>
                <td>{{ \Carbon\Carbon::parse($event->created_at)->format('d M Y') }}</td>
                <td>{{ \Carbon\Carbon::parse($event->created_at)->format('H:i') }} WIB</td>
                <td>{{ $event->camera->name }}</td>
                <td>{{ str_replace('_', ' ', $event->event_type) }}</td>
                <td>
                    @if($event->severity === 'high')
                        <span class="badge badge-high">Tinggi</span>
                    @elseif($event->severity === 'medium')
                        <span class="badge badge-medium">Menengah</span>
                    @else
                        <span class="badge badge-low">Rendah</span>
                    @endif
                </td>
                <td>
                    @if($event->is_reviewed)
                        <span class="badge badge-reviewed">Reviewed</span>
                    @else
                        <span class="badge badge-new">New</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #94a3b8;">
                    Tidak ada data kejadian untuk periode ini.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        <p>Dokumen ini dibuat secara otomatis oleh Sistem SchoolGuard</p>
        <p>© {{ date('Y') }} SchoolGuard - Sistem Keamanan Sekolah</p>
    </div>
</body>
</html>
