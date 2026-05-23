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

        // --- NEW: Weekly Trend (Last 7 Days) ---
        $last7Days = today()->subDays(6);
        $weeklyTrendRaw = CctvEvent::where('created_at', '>=', $last7Days)
            ->select(DB::raw('DATE(created_at) as event_date'), 'severity', DB::raw('count(*) as total'))
            ->groupBy('event_date', 'severity')
            ->get();

        $weeklyTrend = [];
        // Fill empty days to ensure array has 7 continuous days
        for ($i = 0; $i < 7; $i++) {
            $dt = today()->subDays(6 - $i);
            $dateStr = $dt->format('Y-m-d');
            $weeklyTrend[$dateStr] = [
                'day' => $dt->format('D'), // Mon, Tue...
                'date' => $dt->format('d M'),
                'high' => 0,
                'medium' => 0,
                'low' => 0,
            ];
        }

        foreach ($weeklyTrendRaw as $row) {
            $date = $row->event_date;
            if (isset($weeklyTrend[$date])) {
                $weeklyTrend[$date][$row->severity] = $row->total;
            }
        }
        $weeklyTrend = array_values($weeklyTrend);

        // --- NEW: Monthly Recap ---
        $currentMonthStart = today()->startOfMonth();
        $lastMonthStart = today()->subMonth()->startOfMonth();
        $lastMonthEnd = today()->subMonth()->endOfMonth();

        $currentMonthTotal = CctvEvent::where('created_at', '>=', $currentMonthStart)->count();
        $lastMonthTotal = CctvEvent::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
        
        $percentageChange = 0;
        if ($lastMonthTotal > 0) {
            $percentageChange = round((($currentMonthTotal - $lastMonthTotal) / $lastMonthTotal) * 100);
        } else if ($currentMonthTotal > 0) {
            $percentageChange = 100;
        }

        $monthlySeverityRaw = CctvEvent::where('created_at', '>=', $currentMonthStart)
            ->select('severity', DB::raw('count(*) as total'))
            ->groupBy('severity')
            ->get();
            
        $monthlySeverity = ['high' => 0, 'medium' => 0, 'low' => 0];
        foreach($monthlySeverityRaw as $row) {
            $monthlySeverity[$row->severity] = $row->total;
        }

        return response()->json([
            'summary' => [
                'total_today' => $totalToday,
                'active_cameras' => $activeCameras,
                'by_severity' => $bySeverity,
                'weekly_trend' => $weeklyTrend,
                'monthly_recap' => [
                    'current_month_total' => $currentMonthTotal,
                    'percentage_change' => $percentageChange,
                    'by_severity' => $monthlySeverity
                ]
            ],
        ]);
    }
}
