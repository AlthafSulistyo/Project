<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Kejadian CCTV</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #333;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #2563eb;
        }
        
        .header h1 {
            font-size: 18pt;
            color: #1e40af;
            margin-bottom: 5px;
        }
        
        .header .subtitle {
            font-size: 12pt;
            color: #64748b;
        }
        
        .info-box {
            background: #f1f5f9;
            padding: 12px;
            margin-bottom: 20px;
            border-radius: 4px;
            border-left: 4px solid #3b82f6;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 9pt;
        }
        
        .info-label {
            font-weight: bold;
            color: #475569;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 10px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 18pt;
            font-weight: bold;
            color: #1e40af;
        }
        
        .stat-label {
            font-size: 8pt;
            color: #64748b;
            margin-top: 4px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        thead {
            background: #1e40af;
            color: white;
        }
        
        th, td {
            padding: 8px 6px;
            text-align: left;
            border: 1px solid #cbd5e1;
            font-size: 8pt;
        }
        
        tbody tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .severity-high {
            background: #fee2e2;
            color: #991b1b;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 7pt;
        }
        
        .severity-medium {
            background: #fef3c7;
            color: #92400e;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 7pt;
        }
        
        .severity-low {
            background: #dbeafe;
            color: #1e40af;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 7pt;
        }
        
        .status-reviewed {
            color: #065f46;
            font-size: 7pt;
        }
        
        .status-new {
            color: #b45309;
            font-size: 7pt;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #cbd5e1;
            font-size: 8pt;
            color: #64748b;
            text-align: center;
        }
        
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>🛡️ SchoolGuard CCTV Monitoring System</h1>
        <div class="subtitle">Laporan Kejadian Keamanan</div>
    </div>

    <!-- Report Info -->
    <div class="info-box">
        <div class="info-row">
            <span class="info-label">Periode Laporan:</span>
            <span>{{ \Carbon\Carbon::parse($start_date)->format('d M Y') }} - {{ \Carbon\Carbon::parse($end_date)->format('d M Y') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Dibuat oleh:</span>
            <span>{{ $generated_by }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Tanggal Cetak:</span>
            <span>{{ $generated_at }}</span>
        </div>
    </div>

    <!-- Statistics Summary -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">{{ $stats['total'] }}</div>
            <div class="stat-label">Total Kejadian</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="color: #dc2626;">{{ $stats['high'] }}</div>
            <div class="stat-label">Tingkat Tinggi</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="color: #ea580c;">{{ $stats['medium'] }}</div>
            <div class="stat-label">Tingkat Menengah</div>
        </div>
    </div>

    <!-- Events Table -->
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 15%;">Waktu</th>
                <th style="width: 18%;">Kamera</th>
                <th style="width: 20%;">Lokasi</th>
                <th style="width: 20%;">Jenis Kejadian</th>
                <th style="width: 12%;">Bahaya</th>
                <th style="width: 10%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($events as $index => $event)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $event->created_at->format('d/m/Y H:i') }}</td>
                <td>{{ $event->camera->name ?? '-' }}</td>
                <td>{{ $event->camera->location ?? '-' }}</td>
                <td>{{ $event->event_type }}</td>
                <td>
                    <span class="severity-{{ $event->severity }}">
                        {{ strtoupper($event->severity) }}
                    </span>
                </td>
                <td class="{{ $event->is_reviewed ? 'status-reviewed' : 'status-new' }}">
                    {{ $event->is_reviewed ? '✓ Reviewed' : '⚠ New' }}
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center; color: #94a3b8;">
                    Tidak ada data kejadian untuk periode ini
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Summary -->
    @if($events->count() > 0)
    <div style="background: #f1f5f9; padding: 12px; border-radius: 4px; margin-top: 20px;">
        <strong>Ringkasan:</strong><br>
        • Total {{ $stats['total'] }} kejadian terdeteksi<br>
        • {{ $stats['reviewed'] }} kejadian telah ditinjau<br>
        • {{ $stats['unreviewed'] }} kejadian masih pending<br>
        • Tingkat bahaya: {{ $stats['high'] }} Tinggi, {{ $stats['medium'] }} Menengah, {{ $stats['low'] }} Rendah
    </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <p>Dokumen ini digenerate secara otomatis oleh sistem SchoolGuard</p>
        <p>SMAS Plus Cendekia Cikeas - Sistem Keamanan Berbasis CCTV</p>
    </div>
</body>
</html>
