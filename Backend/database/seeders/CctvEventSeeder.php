<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CctvEvent;
use App\Models\Camera;
use Carbon\Carbon;

class CctvEventSeeder extends Seeder
{
    public function run(): void
    {
        $camera = Camera::where('name', 'CAM_01_Kelas_9.1')->first();

        if (!$camera) {
            $this->command->warn('Camera CAM_01_Kelas_9.1 not found.');
            return;
        }

        $this->command->info('🎯 Creating enhanced realistic CCTV events...');

        $events = [];
        $anomalyCount = 0;

        // Generate events for last 30 days
        $endDate = Carbon::now();
        $startDate = $endDate->copy()->subDays(30);
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            $isWeekend = $currentDate->isWeekend();
            $eventsPerDay = $isWeekend ? rand(2, 5) : rand(5, 10);

            for ($i = 0; $i < $eventsPerDay; $i++) {
                $hour = $this->getRealisticHour($isWeekend);
                $timestamp = $currentDate->copy()
                    ->setHour($hour)
                    ->setMinute(rand(0, 59))
                    ->setSecond(rand(0, 59));

                $isNightTime = $hour >= 22 || $hour < 5;
                
                // Event type based on time
                if ($isNightTime) {
                    $eventType = rand(1, 100) <= 40 ? 'INTRUSION' : 'MOTION_DETECTED';
                } elseif ($hour >= 7 && $hour <= 15) {
                    $eventTypes = ['ENTRY', 'EXIT', 'LOITERING'];
                    $eventType = $eventTypes[array_rand($eventTypes)];
                } else {
                    $eventType = 'MOTION_DETECTED';
                }

                // Severity
                if ($eventType === 'INTRUSION') {
                    $severity = 'high';
                } elseif ($isWeekend && rand(1, 100) <= 30) {
                    $severity = 'medium';
                } else {
                    $rand = rand(1, 100);
                    $severity = $rand <= 60 ? 'low' : ($rand <= 90 ? 'medium' : 'high');
                }

                // Anomaly flag
                $isAnomaly = ($isNightTime && in_array($eventType, ['INTRUSION', 'LOITERING'])) 
                    || ($isWeekend && $severity === 'high');
                
                if ($isAnomaly) $anomalyCount++;

                // Review status
                $daysAgo = $currentDate->diffInDays($endDate);
                $isReviewed = rand(1, 100) <= ($daysAgo > 7 ? 80 : ($daysAgo > 3 ? 50 : 20));

                $events[] = [
                    'camera_id' => $camera->id,
                    'event_type' => $eventType,
                    'severity' => $severity,
                    'is_reviewed' => $isReviewed,
                    'is_anomaly' => $isAnomaly,
                    'description' => null,
                    'snapshot_path' => null,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];
            }

            $currentDate->addDay();
        }

        // Insert in chunks
        foreach (array_chunk($events, 50) as $chunk) {
            CctvEvent::insert($chunk);
        }

        $total = count($events);
        $this->command->info("✅ Created {$total} CCTV events");
        $this->command->info("🚨 {$anomalyCount} anomalies (" . round(($anomalyCount/$total)*100, 1) . "%)");
    }

    private function getRealisticHour(bool $isWeekend): int
    {
        $weights = $isWeekend ? [
            0=>1,1=>1,2=>1,3=>1,4=>1,5=>2,6=>3,7=>5,8=>8,9=>10,10=>10,11=>8,
            12=>6,13=>5,14=>5,15=>4,16=>3,17=>3,18=>2,19=>2,20=>2,21=>2,22=>3,23=>2
        ] : [
            0=>1,1=>1,2=>1,3=>1,4=>1,5=>2,6=>5,7=>15,8=>20,9=>18,10=>20,11=>18,
            12=>16,13=>18,14=>20,15=>12,16=>6,17=>4,18=>3,19=>2,20=>2,21=>2,22=>3,23=>2
        ];

        $total = array_sum($weights);
        $rand = rand(1, $total);
        $cumulative = 0;
        
        foreach ($weights as $hour => $weight) {
            $cumulative += $weight;
            if ($rand <= $cumulative) return $hour;
        }
        
        return 12;
    }
}
