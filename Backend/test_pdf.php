<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$events = App\Models\CctvEvent::all();
try {
    $pdf = Barryvdh\DomPDF\Facade\Pdf::loadView('reports.events-pdf', ['events' => $events, 'startDate' => '2026-04-15', 'endDate' => '2026-04-22']);
    $output = $pdf->output();
    echo "PDF generated size: " . strlen($output) . "\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
