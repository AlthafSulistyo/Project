<?php

namespace App\Console\Commands;

use App\Models\Camera;
use App\Services\HikvisionISAPIService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SyncHikvisionEvents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'isapi:sync-events 
                            {--camera= : Sync specific camera by ID}
                            {--mock : Use mock mode for testing}
                            {--days=1 : Number of days to sync (default: 1)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync events from Hikvision ISAPI cameras';

    protected HikvisionISAPIService $isapiService;

    public function __construct(HikvisionISAPIService $isapiService)
    {
        parent::__construct();
        $this->isapiService = $isapiService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting Hikvision ISAPI event sync...');
        
        // Set mock mode if specified
        if ($this->option('mock')) {
            $this->isapiService->setMockMode(true);
            $this->warn('Running in MOCK mode');
        }
        
        // Get cameras to sync
        $cameras = $this->getCameras();
        
        if ($cameras->isEmpty()) {
            $this->error('No cameras found with ISAPI enabled');
            return Command::FAILURE;
        }
        
        $this->info(sprintf('Found %d camera(s) to sync', $cameras->count()));
        
        $totalSynced = 0;
        $successCount = 0;
        $failureCount = 0;
        
        foreach ($cameras as $camera) {
            $this->line('');
            $this->info(sprintf('Syncing: %s (ID: %d)', $camera->name, $camera->id));
            
            try {
                $syncedCount = $this->syncCamera($camera);
                $totalSynced += $syncedCount;
                $successCount++;
                $this->info(sprintf('✓ Synced %d events', $syncedCount));
            } catch (\Exception $e) {
                $failureCount++;
                $this->error(sprintf('✗ Failed: %s', $e->getMessage()));
            }
        }
        
        $this->line('');
        $this->info('=== Sync Summary ===');
        $this->info(sprintf('Total events synced: %d', $totalSynced));
        $this->info(sprintf('Successful cameras: %d', $successCount));
        
        if ($failureCount > 0) {
            $this->warn(sprintf('Failed cameras: %d', $failureCount));
        }
        
        return Command::SUCCESS;
    }
    
    /**
     * Get cameras to sync based on options
     */
    protected function getCameras()
    {
        $query = Camera::where('isapi_enabled', true)
            ->where('status', 'active');
        
        if ($cameraId = $this->option('camera')) {
            $query->where('id', $cameraId);
        }
        
        return $query->get();
    }
    
    /**
     * Sync events for a single camera
     */
    protected function syncCamera(Camera $camera): int
    {
        $days = (int) $this->option('days');
        
        // Determine sync time range
        $endTime = now();
        $startTime = $camera->last_event_sync_at 
            ?? now()->subDays($days);
        
        // Fetch events
        $events = $this->isapiService->fetchEvents($camera, $startTime, $endTime);
        
        $this->line(sprintf('  Found %d events from API', count($events)));
        
        // Sync to database
        $syncedCount = $this->isapiService->syncEventsToDatabase($camera, $events);
        
        return $syncedCount;
    }
}
