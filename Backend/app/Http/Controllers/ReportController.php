<?php

namespace App\Http\Controllers;

use App\Models\CctvEvent;
use App\Models\AuditLog;
use App\Mail\ReportEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
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

        // Untuk PDF, batasi maksimal data karena DOMPDF sangat berat merender ribuan baris HTML.
        $events = $query->orderBy('created_at', 'desc')->take(300)->get();

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

        // Generate PDF using our new template
        $pdf = Pdf::loadView('reports.events-pdf', [
            'events' => $events,
            'startDate' => $request->start_date,
            'endDate' => $request->end_date,
        ]);

        $filename = 'Laporan_Aktivitas_' . date('Y-m-d_His') . '.pdf';

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

    /**
     * Send report via email with PDF attachment
     */
    public function sendEmail(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Fetch filtered events
        $query = CctvEvent::with('camera')
            ->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);

        $events = $query->orderBy('created_at', 'desc')->get();

        // Generate PDF
        $pdf = Pdf::loadView('reports.events-pdf', [
            'events' => $events,
            'startDate' => $request->start_date,
            'endDate' => $request->end_date,
        ]);

        $pdfContent = $pdf->output();

        // Send email with PDF attachment
        try {
            Mail::to('alth22227si@student.nurulfikri.ac.id')
                ->send(new ReportEmail($pdfContent, $request->start_date, $request->end_date));

            // Log email activity
            AuditLog::log(
                'send_report_email',
                "Sent PDF report via email: {$request->start_date} to {$request->end_date}, {$events->count()} events"
            );

            return response()->json([
                'success' => true,
                'message' => '✅ Laporan berhasil dikirim ke email alth22227si@student.nurulfikri.ac.id'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '❌ Gagal mengirim email: ' . $e->getMessage()
            ], 500);
        }
    }
}
