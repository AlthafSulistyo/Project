<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CctvEvent;
use App\Models\Camera;
use Carbon\Carbon;

class TodayEventsSeeder extends Seeder
{
    /**
     * Seed events for the last 3 days to populate dashboard.
     */
    public function run(): void
    {
        $camera = Camera::where('name', 'CAM_01_Kelas_10.1')->first();

        if (!$camera) {
            $this->command->warn('Camera CAM_01_Kelas_10.1 not found.');
            return;
        }

        // Delete existing events first to ensure clean state
        CctvEvent::query()->delete();

        $this->command->info('🎯 Creating 3 days of CCTV events (Jan 12-14, 2026)...');

        $events = [];
        
        // Generate events for 3 days: Jan 12, 13, 14 (2026)
        $dates = [
            Carbon::create(2026, 1, 12), // 2 days ago
            Carbon::create(2026, 1, 13), // yesterday
            Carbon::create(2026, 1, 14), // today
        ];
        
        foreach ($dates as $dateIndex => $date) {
            $isToday = $dateIndex === 2;
            
            // Day-specific event data
            if ($isToday) {
                // For today (Jan 14), start from 10 AM as requested
                $eventData = [
                    // Morning activities starting from 10 AM
                    ['hour' => 10, 'minute' => 15, 'type' => 'ENTRY', 'severity' => 'low', 'anomaly' => false],
                    ['hour' => 10, 'minute' => 45, 'type' => 'MOTION_DETECTED', 'severity' => 'low', 'anomaly' => false],
                    ['hour' => 11, 'minute' => 20, 'type' => 'ENTRY', 'severity' => 'low', 'anomaly' => false],
                    ['hour' => 11, 'minute' => 50, 'type' => 'EXIT', 'severity' => 'low', 'anomaly' => false],
                    
                    // Afternoon (12-2 PM)
                    ['hour' => 12, 'minute' => 5, 'type' => 'LOITERING', 'severity' => 'medium', 'anomaly' => false],
                    ['hour' => 13, 'minute' => 30, 'type' => 'ENTRY', 'severity' => 'low', 'anomaly' => false],
                    ['hour' => 14, 'minute' => 0, 'type' => 'MOTION_DETECTED', 'severity' => 'low', 'anomaly' => false],
                ];
            } else {
                // For previous days (Jan 12, 13), use full day schedule
                $eventData = [
                    // Morning activities (7-9 AM)
                    ['hour' => 7, 'minute' => 15, 'type' => 'ENTRY', 'severity' => 'low', 'anomaly' => false],
                    ['hour' => 7, 'minute' => 45, 'type' => 'ENTRY', 'severity' => 'low', 'anomaly' => false],
                    ['hour' => 8, 'minute' => 10, 'type' => 'MOTION_DETECTED', 'severity' => 'low', 'anomaly' => false],
                    ['hour' => 8, 'minute' => 30, 'type' => 'ENTRY', 'severity' => 'low', 'anomaly' => false],
                    
                    // Mid-day activities (10-12 PM)
                    ['hour' => 10, 'minute' => 20, 'type' => 'MOTION_DETECTED', 'severity' => 'low', 'anomaly' => false],
                    ['hour' => 11, 'minute' => 45, 'type' => 'EXIT', 'severity' => 'low', 'anomaly' => false],
                    ['hour' => 12, 'minute' => 5, 'type' => 'LOITERING', 'severity' => 'medium', 'anomaly' => false],
                    
                    // Afternoon (1-3 PM)
                    ['hour' => 13, 'minute' => 30, 'type' => 'ENTRY', 'severity' => 'low', 'anomaly' => false],
                    ['hour' => 14, 'minute' => 15, 'type' => 'MOTION_DETECTED', 'severity' => 'low', 'anomaly' => false],
                    ['hour' => 14, 'minute' => 50, 'type' => 'EXIT', 'severity' => 'low', 'anomaly' => false],
                    
                    // Late afternoon 
                    ['hour' => 16, 'minute' => 30, 'type' => 'LOITERING', 'severity' => 'medium', 'anomaly' => false],
                    ['hour' => 17, 'minute' => 45, 'type' => 'MOTION_DETECTED', 'severity' => 'medium', 'anomaly' => true],
                ];
            }
            
            // Add some high-severity events only for today and yesterday
            if ($dateIndex >= 1) {
                $eventData[] = ['hour' => 19, 'minute' => 20, 'type' => 'MOTION_DETECTED', 'severity' => 'high', 'anomaly' => true];
                $eventData[] = ['hour' => 20, 'minute' => 15, 'type' => 'INTRUSION', 'severity' => 'high', 'anomaly' => true];
            }
            
            // For today, add one more recent event
            if ($isToday) {
                $eventData[] = ['hour' => 21, 'minute' => 30, 'type' => 'MOTION_DETECTED', 'severity' => 'medium', 'anomaly' => true];
            }

            foreach ($eventData as $data) {
                $timestamp = $date->copy()
                    ->setHour($data['hour'])
                    ->setMinute($data['minute'])
                    ->setSecond(rand(0, 59));

                // Older events are more likely to be reviewed
                $isReviewed = $isToday ? (rand(0, 100) <= 20) : (rand(0, 100) <= 70);

                $events[] = [
                    'camera_id' => $camera->id,
                    'event_type' => $data['type'],
                    'severity' => $data['severity'],
                    'is_reviewed' => $isReviewed,
                    'is_anomaly' => $data['anomaly'],
                    'description' => null,
                    'snapshot_path' => null,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];
            }
        }

        CctvEvent::insert($events);

        $total = count($events);
        $todayEvents = collect($events)->filter(function($e) {
            return Carbon::parse($e['created_at'])->isToday();
        })->count();
        $highSeverity = collect($events)->where('severity', 'high')->count();
        $anomalies = collect($events)->where('is_anomaly', true)->count();
        
        $this->command->info("✅ Created {$total} events across 3 days");
        $this->command->info("📅 Today's events: {$todayEvents}");
        $this->command->info("🚨 {$highSeverity} high severity events");
        $this->command->info("⚠️  {$anomalies} anomalies detected");
    }
}
