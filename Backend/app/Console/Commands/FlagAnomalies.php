<?php

namespace App\Console\Commands;

use App\Services\AnomalyDetectionService;
use Illuminate\Console\Command;

class FlagAnomalies extends Command
{
    protected $signature = 'anomaly:flag';
    protected $description = 'Flag existing events as anomalies based on detection rules';

    protected AnomalyDetectionService $anomalyService;

    public function __construct(AnomalyDetectionService $anomalyService)
    {
        parent::__construct();
        $this->anomalyService = $anomalyService;
    }

    public function handle()
    {
        $this->info('🔍 Scanning events for anomalies...');

        $flagged = $this->anomalyService->flagExistingAnomalies();

        $this->info("✅ Flagged {$flagged} events as anomalies");

        return Command::SUCCESS;
    }
}
