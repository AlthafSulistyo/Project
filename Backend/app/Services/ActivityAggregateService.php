<?php

namespace App\Services;

use App\Models\ActivityAggregate;
use App\Models\CctvEvent;
use App\Models\Camera;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ActivityAggregateService
{
    /**
     * Calculate hourly statistics for a specific date and hour
     */
    public function calculateHourlyStats(string $date, int $hour): array
    {
        $startTime = Carbon::parse($date)->setHour($hour)->setMinute(0)->setSecond(0);
        $endTime = $startTime->copy()->addHour();

        $cameras = Camera::all();
        $results = [];

        foreach ($cameras as $camera) {
            // Get all events for this camera in this hour
            $events = CctvEvent::where('camera_id', $camera->id)
                ->whereBetween('created_at', [$startTime, $endTime])
                ->get();

            // Count by event type (assuming human/vehicle classification)
            $humanEvents = $events->whereIn('event_type', ['INTRUSION', 'LOITERING', 'ENTRY', 'EXIT', 'FIGHTING'])->count();
            $vehicleEvents = $events->whereIn('event_type', ['VEHICLE_ENTRY', 'VEHICLE_EXIT', 'PARKING_VIOLATION'])->count();

            // Update or create aggregate
            $aggregate = ActivityAggregate::updateOrCreate(
                [
                    'camera_id' => $camera->id,
                    'date' => $date,
                    'hour' => $hour,
                ],
                [
                    'total_human' => $humanEvents,
                    'total_vehicle' => $vehicleEvents,
                    'updated_at' => now(),
                ]
            );

            $results[] = [
                'camera_id' => $camera->id,
                'camera_name' => $camera->name,
                'hour' => $hour,
                'human' => $humanEvents,
                'vehicle' => $vehicleEvents,
            ];
        }

        return $results;
    }

    /**
     * Calculate aggregates for entire day
     */
    public function aggregateForDay(string $date): int
    {
        $totalAggregates = 0;

        for ($hour = 0; $hour < 24; $hour++) {
            $results = $this->calculateHourlyStats($date, $hour);
            $totalAggregates += count($results);
        }

        Log::info("Calculated {$totalAggregates} aggregates for date: {$date}");

        return $totalAggregates;
    }

    /**
     * Calculate aggregates for a date range
     */
    public function aggregateDateRange(string $startDate, string $endDate): int
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $totalAggregates = 0;

        while ($start->lte($end)) {
            $totalAggregates += $this->aggregateForDay($start->format('Y-m-d'));
            $start->addDay();
        }

        return $totalAggregates;
    }

    /**
     * Calculate aggregates for current hour (for scheduler)
     */
    public function aggregateCurrentHour(): array
    {
        $now = now();
        $date = $now->format('Y-m-d');
        $hour = $now->hour;

        return $this->calculateHourlyStats($date, $hour);
    }

    /**
     * Get aggregated stats for dashboard
     */
    public function getStatsForPeriod(string $startDate, string $endDate, ?int $cameraId = null): array
    {
        $query = ActivityAggregate::whereBetween('date', [$startDate, $endDate]);

        if ($cameraId) {
            $query->where('camera_id', $cameraId);
        }

        $aggregates = $query->get();

        return [
            'total_human' => $aggregates->sum('total_human'),
            'total_vehicle' => $aggregates->sum('total_vehicle'),
            'total_events' => $aggregates->sum('total_human') + $aggregates->sum('total_vehicle'),
            'hourly_breakdown' => $aggregates->groupBy('hour')->map(function ($group) {
                return [
                    'hour' => $group->first()->hour,
                    'human' => $group->sum('total_human'),
                    'vehicle' => $group->sum('total_vehicle'),
                ];
            })->values(),
        ];
    }

    /**
     * Clear old aggregates (older than specified days)
     */
    public function clearOldAggregates(int $daysToKeep = 365): int
    {
        $cutoffDate = now()->subDays($daysToKeep)->format('Y-m-d');
        
        $deleted = ActivityAggregate::where('date', '<', $cutoffDate)->delete();
        
        Log::info("Deleted {$deleted} old aggregates (older than {$cutoffDate})");
        
        return $deleted;
    }
}
