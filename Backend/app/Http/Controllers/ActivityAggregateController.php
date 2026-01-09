<?php

namespace App\Http\Controllers;

use App\Services\ActivityAggregateService;
use App\Models\ActivityAggregate;
use Illuminate\Http\Request;

class ActivityAggregateController extends Controller
{
    protected ActivityAggregateService $aggregateService;

    public function __construct(ActivityAggregateService $aggregateService)
    {
        $this->aggregateService = $aggregateService;
    }

    /**
     * Get aggregated statistics for a period
     */
    public function index(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'camera_id' => 'nullable|exists:cameras,id',
        ]);

        $stats = $this->aggregateService->getStatsForPeriod(
            $request->start_date,
            $request->end_date,
            $request->camera_id
        );

        return response()->json($stats);
    }

    /**
     * Get hourly breakdown for dashboard chart
     */
    public function hourlyBreakdown(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'camera_id' => 'nullable|exists:cameras,id',
        ]);

        $query = ActivityAggregate::where('date', $request->date);

        if ($request->camera_id) {
            $query->where('camera_id', $request->camera_id);
        }

        $aggregates = $query->orderBy('hour')->get();

        // Format for chart
        $chartData = $aggregates->map(function ($agg) {
            return [
                'hour' => sprintf('%02d:00', $agg->hour),
                'human' => $agg->total_human,
                'vehicle' => $agg->total_vehicle,
                'total' => $agg->total_human + $agg->total_vehicle,
            ];
        });

        return response()->json([
            'date' => $request->date,
            'data' => $chartData,
            'summary' => [
                'total_human' => $aggregates->sum('total_human'),
                'total_vehicle' => $aggregates->sum('total_vehicle'),
                'peak_hour' => $aggregates->sortByDesc('total_human')->first()?->hour ?? 0,
            ],
        ]);
    }

    /**
     * Trigger manual aggregation (admin only)
     */
    public function calculate(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        try {
            $total = $this->aggregateService->aggregateForDay($request->date);

            return response()->json([
                'message' => 'Aggregation completed successfully',
                'date' => $request->date,
                'total_records' => $total,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Aggregation failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
