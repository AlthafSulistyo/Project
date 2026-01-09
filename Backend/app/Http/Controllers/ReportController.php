<?php

namespace App\Http\Controllers;

use App\Models\CctvEvent;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    /**
     * Export events to PDF
     */
    public function exportPDF(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'camera_id' => 'nullable|exists:cameras,id',
            'severity' => 'nullable|in:low,medium,high',
        ]);

        // Fetch filtered events
        $query = CctvEvent::with('camera')
            ->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);

        if ($request->camera_id) {
            $query->where('camera_id', $request->camera_id);
        }

        if ($request->severity) {
            $query->where('severity', $request->severity);
        }

        $events = $query->orderBy('created_at', 'desc')->get();

        // Statistics
        $stats = [
            'total' => $events->count(),
            'high' => $events->where('severity', 'high')->count(),
            'medium' => $events->where('severity', 'medium')->count(),
            'low' => $events->where('severity', 'low')->count(),
            'reviewed' => $events->where('is_reviewed', true)->count(),
            'unreviewed' => $events->where('is_reviewed', false)->count(),
        ];

        // Log export activity
        AuditLog::log(
            'export_pdf',
            "Exported PDF report: {$request->start_date} to {$request->end_date}, {$events->count()} events"
        );

        // Generate PDF
        $pdf = Pdf::loadView('reports.pdf', [
            'events' => $events,
            'stats' => $stats,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'generated_by' => auth()->user()->name,
            'generated_at' => now()->format('d M Y, H:i'),
        ]);

        $filename = 'Laporan_CCTV_' . $request->start_date . '_to_' . $request->end_date . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Export events to Excel (CSV fallback)
     */
    public function exportExcel(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'camera_id' => 'nullable|exists:cameras,id',
            'severity' => 'nullable|in:low,medium,high',
        ]);

        // Fetch filtered events
        $query = CctvEvent::with('camera')
            ->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);

        if ($request->camera_id) {
            $query->where('camera_id', $request->camera_id);
        }

        if ($request->severity) {
            $query->where('severity', $request->severity);
        }

        $events = $query->orderBy('created_at', 'desc')->get();

        // Log export activity
        AuditLog::log(
            'export_excel',
            "Exported Excel report: {$request->start_date} to {$request->end_date}, {$events->count()} events"
        );

        // Generate CSV
        $filename = 'Laporan_CCTV_' . $request->start_date . '_to_' . $request->end_date . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($events) {
            $file = fopen('php://output', 'w');

            // CSV Header
            fputcsv($file, ['No', 'Waktu', 'Kamera', 'Lokasi', 'Jenis Kejadian', 'Tingkat Bahaya', 'Status Review']);

            // CSV Data
            foreach ($events as $index => $event) {
                fputcsv($file, [
                    $index + 1,
                    $event->created_at->format('d/m/Y H:i'),
                    $event->camera->name ?? '-',
                    $event->camera->location ?? '-',
                    $event->event_type,
                    strtoupper($event->severity),
                    $event->is_reviewed ? 'Reviewed' : 'New',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
