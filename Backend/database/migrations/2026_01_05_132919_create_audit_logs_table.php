<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Purpose: Security audit trail to track all user activities
     * Reference: SDD Section 3.3.1 (Physical Model) & SRS Section 5.1
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            
            // User who performed the action (nullable for system actions)
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onUpdate('cascade')
                  ->onDelete('set null'); // Keep logs even if user is deleted
            
            // Action details
            $table->string('action', 100); // e.g., 'login', 'export_pdf', 'view_report'
            $table->text('description')->nullable(); // Additional context/parameters
            
            // Request metadata for security tracking
            $table->string('ip_address', 45)->nullable(); // Support IPv4 and IPv6
            $table->text('user_agent')->nullable(); // Browser/device info
            
            // Timestamp (immutable - only created_at, no updated_at)
            $table->timestamp('created_at')->useCurrent();
            
            // Index for common queries
            $table->index('user_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
