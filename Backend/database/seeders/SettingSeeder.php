<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultSeverityMapping = [
            'linedetection' => 'medium',
            'fielddetection' => 'medium',
            'regionEntrance' => 'high',
            'regionExiting' => 'medium',
            'loitering' => 'medium',
            'parking' => 'low',
            'motion_detected' => 'low',
            'VMD' => 'low',
            'line_crossed' => 'medium',
            'intrusion' => 'high',
        ];

        \App\Models\Setting::updateOrCreate(
            ['key' => 'severity_mapping'],
            ['value' => $defaultSeverityMapping]
        );
    }
}
