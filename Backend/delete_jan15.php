<?php

// Quick script to delete events with date >= Jan 15, 2026
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CctvEvent;

echo "Checking for events with date >= 2026-01-15...\n";

$count = CctvEvent::whereDate('created_at', '>=', '2026-01-15')->count();
echo "Found {$count} events to delete\n";

if ($count > 0) {
    CctvEvent::whereDate('created_at', '>=', '2026-01-15')->delete();
    echo "✅ Deleted {$count} events\n";
}

$remaining = CctvEvent::count();
echo "Remaining events in database: {$remaining}\n";

// Show date range
$dates = CctvEvent::selectRaw('MIN(DATE(created_at)) as min_date, MAX(DATE(created_at)) as max_date')->first();
echo "Date range: {$dates->min_date} to {$dates->max_date}\n";

echo "\nDone!\n";
