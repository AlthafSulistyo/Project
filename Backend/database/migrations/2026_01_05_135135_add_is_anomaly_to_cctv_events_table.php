<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cctv_events', function (Blueprint $table) {
            $table->boolean('is_anomaly')->default(false)->after('is_reviewed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cctv_events', function (Blueprint $table) {
            $table->dropColumn('is_anomaly');
        });
    }
};
