<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f8fafc;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .info-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #2563eb;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #64748b;
            font-size: 12px;
        }
        h1 {
            margin: 0;
            font-size: 24px;
        }
        .subtitle {
            margin: 5px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛡️ SchoolGuard</h1>
        <p class="subtitle">Laporan Aktivitas CCTV</p>
    </div>
    
    <div class="content">
        <p>Yth. Bapak/Ibu,</p>
        
        <p>Terlampir adalah <strong>Laporan Aktivitas CCTV</strong> yang telah kami generate untuk periode berikut:</p>
        
        <div class="info-box">
            <p><strong>📅 Periode:</strong> {{ \Carbon\Carbon::parse($startDate)->format('d M Y') }} - {{ \Carbon\Carbon::parse($endDate)->format('d M Y') }}</p>
            <p><strong>📄 File:</strong> Laporan_Aktivitas_CCTV.pdf</p>
            <p><strong>⏰ Dibuat:</strong> {{ now()->format('d M Y, H:i') }} WIB</p>
        </div>
        
        <p>Laporan ini berisi data aktivitas yang terdeteksi oleh sistem CCTV SchoolGuard selama periode tersebut.</p>
        
        <p><em>File PDF terlampir pada email ini.</em></p>
        
        <p>Terima kasih,<br>
        <strong>Tim SchoolGuard</strong></p>
    </div>
    
    <div class="footer">
        <p>© {{ date('Y') }} SchoolGuard - Sistem Keamanan Sekolah</p>
        <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
    </div>
</body>
</html>
