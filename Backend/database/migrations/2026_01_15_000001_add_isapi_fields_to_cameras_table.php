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
        Schema::table('cameras', function (Blueprint $table) {
            $table->string('isapi_host')->nullable()->after('rtsp_url');
            $table->integer('isapi_port')->default(80)->after('isapi_host');
            $table->string('isapi_username')->nullable()->after('isapi_port');
            $table->text('isapi_password')->nullable()->after('isapi_username'); // Encrypted
            $table->boolean('isapi_enabled')->default(false)->after('isapi_password');
            $table->timestamp('last_event_sync_at')->nullable()->after('isapi_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cameras', function (Blueprint $table) {
            $table->dropColumn([
                'isapi_host',
                'isapi_port',
                'isapi_username',
                'isapi_password',
                'isapi_enabled',
                'last_event_sync_at',
            ]);
        });
    }
};
