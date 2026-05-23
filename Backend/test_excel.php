<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// simulate the index query inside exportExcel
$events = App\Models\CctvEvent::with('camera')->whereBetween('created_at', ['2026-04-15 00:00:00', '2026-04-22 23:59:59'])->get();

try {
    echo "Found " . $events->count() . " events.\n";
    foreach ($events as $event) {
        $camName = $event->camera->name ?? '-';
        $camLoc = $event->camera->location ?? '-';
    }
    echo "Excel mock loop successful.\n";
    
    // Test AuditLog
    App\Models\AuditLog::log('export_excel', "Tested Excel mock");
    echo "AuditLog successful.\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
