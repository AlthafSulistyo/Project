<?php

namespace App\Http\Controllers;

use App\Models\CctvEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for today's events.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Get today's total events
        $totalToday = CctvEvent::whereDate('created_at', today())->count();

        // Get events grouped by severity for today
        $bySeverity = CctvEvent::whereDate('created_at', today())
            ->select('severity', DB::raw('count(*) as total'))
            ->groupBy('severity')
            ->get()
            ->map(function ($item) {
                return [
                    'severity' => $item->severity,
                    'total' => $item->total,
                ];
            })
            ->toArray();

        // Get active cameras count
        $activeCameras = \App\Models\Camera::where('status', 'active')->count();

        return response()->json([
            'summary' => [
                'total_today' => $totalToday,
                'active_cameras' => $activeCameras,
                'by_severity' => $bySeverity,
            ],
        ]);
    }
}
