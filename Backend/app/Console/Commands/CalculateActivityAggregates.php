<?php

namespace App\Console\Commands;

use App\Services\ActivityAggregateService;
use App\Models\AuditLog;
use Illuminate\Console\Command;

class CalculateActivityAggregates extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'aggregate:calculate 
                            {--date= : Specific date to calculate (Y-m-d)}
                            {--start-date= : Start date for range (Y-m-d)}
                            {--end-date= : End date for range (Y-m-d)}
                            {--current : Calculate for current hour only}';

    /**
     * The console command description.
     */
    protected $description = 'Calculate hourly activity aggregates from CCTV events';

    protected ActivityAggregateService $aggregateService;

    public function __construct(ActivityAggregateService $aggregateService)
    {
        parent::__construct();
        $this->aggregateService = $aggregateService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Starting activity aggregation...');

        try {
            // Option 1: Current hour (for scheduler)
            if ($this->option('current')) {
                $this->info('📊 Calculating for current hour...');
                $results = $this->aggregateService->aggregateCurrentHour();
                
                $this->info('✅ Calculated ' . count($results) . ' aggregates for current hour');
                
                // Log to audit
                AuditLog::create([
                    'user_id' => null,
                    'action' => 'aggregate_calculate',
                    'description' => 'Hourly aggregation (current hour): ' . count($results) . ' cameras processed',
                    'ip_address' => 'system',
                    'user_agent' => 'Laravel CLI',
                ]);
                
                return Command::SUCCESS;
            }

            // Option 2: Date range
            if ($this->option('start-date') && $this->option('end-date')) {
                $startDate = $this->option('start-date');
                $endDate = $this->option('end-date');
                
                $this->info("📅 Calculating for range: {$startDate} to {$endDate}");
                
                $total = $this->aggregateService->aggregateDateRange($startDate, $endDate);
                
                $this->info("✅ Calculated {$total} aggregates for date range");
                
                AuditLog::create([
                    'user_id' => null,
                    'action' => 'aggregate_calculate_range',
                    'description' => "Aggregation for {$startDate} to {$endDate}: {$total} records",
                    'ip_address' => 'system',
                    'user_agent' => 'Laravel CLI',
                ]);
                
                return Command::SUCCESS;
            }

            // Option 3: Specific date
            if ($this->option('date')) {
                $date = $this->option('date');
                
                $this->info("📅 Calculating for date: {$date}");
                
                $total = $this->aggregateService->aggregateForDay($date);
                
                $this->info("✅ Calculated {$total} aggregates for {$date}");
                
                AuditLog::create([
                    'user_id' => null,
                    'action' => 'aggregate_calculate_day',
                    'description' => "Aggregation for {$date}: {$total} records",
                    'ip_address' => 'system',
                    'user_agent' => 'Laravel CLI',
                ]);
                
                return Command::SUCCESS;
            }

            // Default: Calculate for yesterday (cleanup job)
            $yesterday = now()->subDay()->format('Y-m-d');
            $this->info("📅 No options specified. Calculating for yesterday: {$yesterday}");
            
            $total = $this->aggregateService->aggregateForDay($yesterday);
            
            $this->info("✅ Calculated {$total} aggregates for {$yesterday}");

            // Also clean up old aggregates (older than 1 year)
            $this->info('🧹 Cleaning up old aggregates...');
            $deleted = $this->aggregateService->clearOldAggregates(365);
            
            if ($deleted > 0) {
                $this->info("🗑️ Deleted {$deleted} old aggregates");
            }

            AuditLog::create([
                'user_id' => null,
                'action' => 'aggregate_calculate',
                'description' => "Daily aggregation: {$total} records, {$deleted} deleted",
                'ip_address' => 'system',
                'user_agent' => 'Laravel CLI',
            ]);

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('❌ Aggregation failed: ' . $e->getMessage());
            
            AuditLog::create([
                'user_id' => null,
                'action' => 'aggregate_calculate_failed',
                'description' => 'Error: ' . $e->getMessage(),
                'ip_address' => 'system',
                'user_agent' => 'Laravel CLI',
            ]);
            
            return Command::FAILURE;
        }
    }
}
