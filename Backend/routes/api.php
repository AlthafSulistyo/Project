<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CctvEventController;
use App\Http\Controllers\CameraController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ActivityAggregateController;
use App\Http\Controllers\AuditLogController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Dashboard Statistics - accessible by all authenticated users
    Route::get('/cctv-stats', [DashboardController::class, 'index']);
    
    // CCTV Events - accessible by all authenticated users
    Route::get('/cctv-events', [CctvEventController::class, 'index']);
    Route::patch('/cctv-events/{id}/review', [CctvEventController::class, 'review']);
    
    // Cameras - List accessible by all, mutations require admin
    Route::get('/cameras', [CameraController::class, 'index']);
    
    // Activity Aggregates - Stats accessible by all
    Route::get('/activity-aggregates', [ActivityAggregateController::class, 'index']);
    Route::get('/activity-aggregates/hourly', [ActivityAggregateController::class, 'hourlyBreakdown']);
    
    // Admin-only routes (Camera Management)
    Route::middleware('role:admin')->group(function () {
        Route::post('/cameras', [CameraController::class, 'store']);
        Route::put('/cameras/{camera}', [CameraController::class, 'update']);
        Route::delete('/cameras/{camera}', [CameraController::class, 'destroy']);
        
        // Manual aggregation trigger
        Route::post('/activity-aggregates/calculate', [ActivityAggregateController::class, 'calculate']);
        
        // Audit Logs (Admin only)
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
        Route::get('/audit-logs/stats', [AuditLogController::class, 'stats']);
        Route::get('/audit-logs/export', [AuditLogController::class, 'export']);
    });

    // Management & Admin can export reports
    Route::middleware('role:admin,management')->group(function () {
        Route::get('/export/pdf', [ReportController::class, 'exportPDF']);
        Route::get('/export/excel', [ReportController::class, 'exportExcel']);
    });
});
