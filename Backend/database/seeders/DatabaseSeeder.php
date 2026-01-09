<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test users with different roles for RBAC
        User::create([
            'id' => 1,
            'name' => 'Administrator',
            'email' => 'admin@schoolguard.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'id' => 2,
            'name' => 'Kepala Sekolah',
            'email' => 'management@schoolguard.com',
            'password' => Hash::make('password'),
            'role' => 'management',
        ]);

        User::create([
            'id' => 3,
            'name' => 'Guru Piket',
            'email' => 'staff@schoolguard.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
        ]);

        // Seed cameras and events
        $this->call([
            CameraSeeder::class,
            CctvEventSeeder::class,
        ]);
    }
}
