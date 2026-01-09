<?php

namespace App\Services;

use App\Models\CctvEvent;
use Carbon\Carbon;

class AnomalyDetectionService
{
    /**
     * Check if an event is anomalous based on multiple rules
     */
    public function isAnomaly(CctvEvent $event): bool
    {
        // Rule 1: Night-time human detection (22:00 - 05:00)
        if ($this->isNightTimeIntrusion($event)) {
            return true;
        }

        // Rule 2: Weekend high-severity events
        if ($this->isWeekendHighSeverity($event)) {
            return true;
        }

        // Rule 3: Multiple events in short time span
        if ($this->isRapidEventCluster($event)) {
            return true;
        }

        return false;
    }

    /**
     * Rule 1: Human detection during night hours
     */
    protected function isNightTimeIntrusion(CctvEvent $event): bool
    {
        $hour = Carbon::parse($event->created_at)->hour;
        
        // Night hours: 22:00 (22) to 05:00 (5)
        $isNightTime = $hour >= 22 || $hour < 5;
        
        // Human-related events
        $humanEvents = ['INTRUSION', 'LOITERING', 'ENTRY', 'EXIT', 'FIGHTING'];
        $isHumanEvent = in_array($event->event_type, $humanEvents);
        
        return $isNightTime && $isHumanEvent;
    }

    /**
     * Rule 2: High severity events on weekends
     */
    protected function isWeekendHighSeverity(CctvEvent $event): bool
    {
        $isWeekend = Carbon::parse($event->created_at)->isWeekend();
        $isHighSeverity = $event->severity === 'high';
        
        return $isWeekend && $isHighSeverity;
    }

    /**
     * Rule 3: Multiple events from same camera in < 5 minutes
     */
    protected function isRapidEventCluster(CctvEvent $event): bool
    {
        $fiveMinutesAgo = Carbon::parse($event->created_at)->subMinutes(5);
        
        $recentEventsCount = CctvEvent::where('camera_id', $event->camera_id)
            ->where('created_at', '>=', $fiveMinutesAgo)
            ->where('created_at', '<', $event->created_at)
            ->where('severity', 'high')
            ->count();
        
        // If there are 2+ high severity events in last 5 minutes, it's suspicious
        return $recentEventsCount >= 2;
    }

    /**
     * Auto-flag existing events as anomalies (for migration)
     */
    public function flagExistingAnomalies(): int
    {
        $events = CctvEvent::where('is_anomaly', false)->get();
        $flagged = 0;

        foreach ($events as $event) {
            if ($this->isAnomaly($event)) {
                $event->is_anomaly = true;
                $event->save();
                $flagged++;
            }
        }

        return $flagged;
    }

    /**
     * Get anomaly statistics
     */
    public function getAnomalyStats(string $startDate, string $endDate): array
    {
        $totalEvents = CctvEvent::whereBetween('created_at', [$startDate, $endDate])->count();
        $anomalyEvents = CctvEvent::whereBetween('created_at', [$startDate, $endDate])
            ->where('is_anomaly', true)
            ->count();

        $nightTimeAnomalies = CctvEvent::whereBetween('created_at', [$startDate, $endDate])
            ->where('is_anomaly', true)
            ->get()
            ->filter(function ($event) {
                $hour = Carbon::parse($event->created_at)->hour;
                return $hour >= 22 || $hour < 5;
            })
            ->count();

        return [
            'total_events' => $totalEvents,
            'total_anomalies' => $anomalyEvents,
            'anomaly_rate' => $totalEvents > 0 ? round(($anomalyEvents / $totalEvents) * 100, 2) : 0,
            'night_time_anomalies' => $nightTimeAnomalies,
            'unreviewed_anomalies' => CctvEvent::whereBetween('created_at', [$startDate, $endDate])
                ->where('is_anomaly', true)
                ->where('is_reviewed', false)
                ->count(),
        ];
    }
}
