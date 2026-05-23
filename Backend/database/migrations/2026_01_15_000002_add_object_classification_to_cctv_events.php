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
            $table->enum('object_type', ['human', 'vehicle', 'unknown'])->default('unknown')->after('event_type');
            $table->string('isapi_event_id')->nullable()->unique()->after('object_type');
            $table->json('raw_event_data')->nullable()->after('description');
            $table->json('detection_region')->nullable()->after('raw_event_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cctv_events', function (Blueprint $table) {
            $table->dropColumn([
                'object_type',
                'isapi_event_id',
                'raw_event_data',
                'detection_region',
            ]);
        });
    }
};
