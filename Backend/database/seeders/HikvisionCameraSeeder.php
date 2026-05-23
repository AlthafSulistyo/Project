<?php

namespace Database\Seeders;

use App\Models\Camera;
use Illuminate\Database\Seeder;

class HikvisionCameraSeeder extends Seeder
{
    /**
     * Seed Hikvision camera dengan data acuan RTSP
     * RTSP: rtsp://admin:Hikv2024@192.168.18.7:554/Streaming/Channels/101
     */
    public function run(): void
    {
        // Camera 1 - Hikvision Smart CCTV (Real Data)
        Camera::create([
            'name' => 'Hikvision Smart CCTV - Channel 101',
            'location' => 'Main Entrance',
            'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.7:554/Streaming/Channels/101',
            'status' => 'active',
            
            // ISAPI Configuration
            'isapi_host' => '192.168.18.7',
            'isapi_port' => 80, // HTTP port untuk ISAPI
            'isapi_username' => 'admin',
            'isapi_password' => 'Hikv2024', // Will be auto-encrypted by model
            'isapi_enabled' => true,
        ]);

        // Camera 2 - Another channel (example)
        Camera::create([
            'name' => 'Hikvision Smart CCTV - Channel 102',
            'location' => 'Parking Area',
            'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.7:554/Streaming/Channels/102',
            'status' => 'active',
            
            // ISAPI Configuration
            'isapi_host' => '192.168.18.7',
            'isapi_port' => 80,
            'isapi_username' => 'admin',
            'isapi_password' => 'Hikv2024',
            'isapi_enabled' => true,
        ]);

        $this->command->info('✓ Hikvision cameras seeded successfully');
    }
}
