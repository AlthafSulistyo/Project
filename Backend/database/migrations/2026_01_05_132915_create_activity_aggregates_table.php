<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Purpose: Table for hourly aggregated statistics to optimize dashboard performance
     * Reference: SDD Section 3.3.1 (Physical Model)
     */
    public function up(): void
    {
        Schema::create('activity_aggregates', function (Blueprint $table) {
            $table->id();
            
            // Foreign key to cameras table
            $table->foreignId('camera_id')
                  ->constrained('cameras')
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
            
            // Aggregation time period
            $table->date('date');
            $table->tinyInteger('hour')->unsigned(); // 0-23
            
            // Aggregated counts
            $table->integer('total_human')->unsigned()->default(0);
            $table->integer('total_vehicle')->unsigned()->default(0);
            
            $table->timestamp('updated_at')->nullable();
            
            // Composite unique index to prevent duplicates
            $table->unique(['camera_id', 'date', 'hour'], 'idx_aggregates_lookup');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_aggregates');
    }
};
