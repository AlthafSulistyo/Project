<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Http\Resources\AuditLogResource;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Display a paginated listing of audit logs (Admin only)
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by action
        if ($request->has('action')) {
            $query->where('action', 'like', '%' . $request->action . '%');
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        // Search in description
        if ($request->has('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(20);

        return AuditLogResource::collection($logs);
    }

    /**
     * Get audit log statistics
     */
    public function stats(Request $request)
    {
        $request->validate([
            'days' => 'nullable|integer|min:1|max:365',
        ]);

        $days = $request->get('days', 30);
        $startDate = now()->subDays($days);

        $stats = [
            'total_logs' => AuditLog::where('created_at', '>=', $startDate)->count(),
            'unique_users' => AuditLog::where('created_at', '>=', $startDate)
                ->distinct('user_id')
                ->count('user_id'),
            'login_count' => AuditLog::where('created_at', '>=', $startDate)
                ->where('action', 'login')
                ->count(),
            'failed_logins' => AuditLog::where('created_at', '>=', $startDate)
                ->where('action', 'login_failed')
                ->count(),
            'export_count' => AuditLog::where('created_at', '>=', $startDate)
                ->where('action', 'like', 'export_%')
                ->count(),
            'top_actions' => AuditLog::where('created_at', '>=', $startDate)
                ->selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->orderBy('count', 'desc')
                ->limit(5)
                ->get(),
            'recent_activity' => AuditLog::with('user')
                ->where('created_at', '>=', $startDate)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($log) {
                    return [
                        'action' => $log->action,
                        'user' => $log->user?->name ?? 'System',
                        'time' => $log->created_at->diffForHumans(),
                    ];
                }),
        ];

        return response()->json($stats);
    }

    /**
     * Export audit logs to CSV
     */
    public function export(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $logs = AuditLog::with('user')
            ->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'Audit_Logs_' . $request->start_date . '_to_' . $request->end_date . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($logs) {
            $file = fopen('php://output', 'w');

            // CSV Header
            fputcsv($file, ['ID', 'Time', 'User', 'Action', 'Description', 'IP Address']);

            // CSV Data
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->created_at->format('Y-m-d H:i:s'),
                    $log->user?->name ?? 'System',
                    $log->action,
                    $log->description,
                    $log->ip_address,
                ]);
            }

            fclose($file);
        };

        // Log the export action
        AuditLog::log('export_audit_logs', "Exported audit logs: {$request->start_date} to {$request->end_date}");

        return response()->stream($callback, 200, $headers);
    }
}
