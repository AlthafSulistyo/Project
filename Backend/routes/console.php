<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Schedule hourly aggregation of CCTV events
Schedule::command('aggregate:calculate --current')->hourly()->withoutOverlapping();

// Daily cleanup of old aggregates (runs at 2 AM)
Schedule::command('aggregate:calculate')->dailyAt('02:00');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();
