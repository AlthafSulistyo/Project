<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Camera;

class CameraSeeder extends Seeder
{
    public function run(): void
    {
        $cameras = [
            [
                'name' => 'CAM_01_Kelas_9.1',
                'location' => 'Kelas 9.1 - Lantai 2',
                'rtsp_url' => 'rtsp://192.168.1.101:554/stream',
                'status' => 'active', // ONLY THIS ONE IS ACTIVE
            ],
            [
                'name' => 'CAM_02_Lobby_Utama',
                'location' => 'Lobby Utama - Lantai 1',
                'rtsp_url' => 'rtsp://192.168.1.102:554/stream',
                'status' => 'inactive', // Inactive
            ],
            [
                'name' => 'CAM_03_Koridor_A',
                'location' => 'Koridor A - Lantai 2',
                'rtsp_url' => 'rtsp://192.168.1.103:554/stream',
                'status' => 'inactive', // Inactive
            ],
            [
                'name' => 'CAM_04_Kantin',
                'location' => 'Kantin Sekolah',
                'rtsp_url' => 'rtsp://192.168.1.104:554/stream',
                'status' => 'inactive', // Inactive
            ],
            [
                'name' => 'CAM_05_Parkir_Siswa',
                'location' => 'Area Parkir Siswa',
                'rtsp_url' => 'rtsp://192.168.1.105:554/stream',
                'status' => 'inactive', // Inactive
            ],
            [
                'name' => 'CAM_06_Lapangan',
                'location' => 'Lapangan Olahraga',
                'rtsp_url' => 'rtsp://192.168.1.106:554/stream',
                'status' => 'inactive', // Inactive
            ],
            [
                'name' => 'CAM_07_Perpustakaan',
                'location' => 'Perpustakaan - Lantai 2',
                'rtsp_url' => 'rtsp://192.168.1.107:554/stream',
                'status' => 'inactive', // Inactive
            ],
            [
                'name' => 'CAM_08_Lab_Komputer',
                'location' => 'Laboratorium Komputer',
                'rtsp_url' => 'rtsp://192.168.1.108:554/stream',
                'status' => 'inactive', // Inactive
            ],
            [
                'name' => 'CAM_09_Gerbang_Masuk',
                'location' => 'Gerbang Utama Sekolah',
                'rtsp_url' => 'rtsp://192.168.1.109:554/stream',
                'status' => 'inactive', // Inactive
            ],
            [
                'name' => 'CAM_10_Taman_Belakang',
                'location' => 'Taman Belakang Sekolah',
                'rtsp_url' => 'rtsp://192.168.1.110:554/stream',
                'status' => 'inactive', // Inactive
            ],
        ];

        foreach ($cameras as $camera) {
            Camera::create($camera);
        }

        $this->command->info('✅ Created 10 cameras (1 active, 9 inactive) - Focus on CAM_01');
    }
}
