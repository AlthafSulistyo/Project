<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Camera;

class CameraSeeder extends Seeder
{
    public function run(): void
    {
        // Data tidak lagi dihapus secara otomatis agar perubahan yang dilakukan user tetap tersimpan.
        // Camera::query()->delete();
        
        $cameras = [
            [
                'name' => 'CAM_D1_Lab_Kom',
                'location' => 'Lab Kom',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.76:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.76',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D2_Lab_IPA',
                'location' => 'Lab IPA',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.5:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.5',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D3_Kelas_12-1',
                'location' => 'Kelas 12-1',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.3:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.3',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D4_Kelas_12-2',
                'location' => 'Kelas 12-2',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.8:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.8',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D5_Kelas_11-1',
                'location' => 'Kelas 11-1',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.16:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.16',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D6_Kelas_11-2',
                'location' => 'Kelas 11-2',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.6:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.6',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D7_Kelas_10-1',
                'location' => 'Kelas 10-1',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.10:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.10',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D8_Kelas_10-2',
                'location' => 'Kelas 10-2',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.18:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.18',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D9_Kelas_9-1',
                'location' => 'Kelas 9-1',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.15:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.15',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D10_Kelas_9-2',
                'location' => 'Kelas 9-2',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.9:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.9',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D11_Kelas_8-1',
                'location' => 'Kelas 8-1',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.13:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.13',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D12_Kelas_8-2',
                'location' => 'Kelas 8-2',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.7:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.7',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D13_Kelas_7-1',
                'location' => 'Kelas 7-1',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.12:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.12',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D14_Kelas_7-2',
                'location' => 'Kelas 7-2',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.17:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.17',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D15_Perpustakaan',
                'location' => 'Perpustakaan',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.14:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.14',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ],
            [
                'name' => 'CAM_D16_Kelas_Umum',
                'location' => 'Kelas (Umum)',
                'rtsp_url' => 'rtsp://admin:Hikv2024@192.168.18.4:554/Streaming/Channels/101',
                'status' => 'active',
                'isapi_host' => '192.168.18.4',
                'isapi_port' => 80,
                'isapi_username' => 'admin',
                'isapi_password' => 'Hikv2024',
                'isapi_enabled' => true,
            ]
        ];

        foreach ($cameras as $camera) {
            Camera::updateOrCreate(['name' => $camera['name']], $camera);
        }

        $this->command->info('✅ Created ' . count($cameras) . ' active cameras with Hikvision RTSP and ISAPI setup');
    }
}
