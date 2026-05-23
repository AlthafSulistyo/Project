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
use App\Http\Controllers\UserController;
use App\Http\Controllers\HikvisionISAPIController;
use App\Http\Controllers\SettingController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/webhooks/cctv-ai', [CctvEventController::class, 'receiveAIWebhook']);
Route::get('/cameras', [CameraController::class, 'index']);

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
    
    // Cameras - mutations require admin
    

    // Activity Aggregates - Stats accessible by all
    Route::get('/activity-aggregates', [ActivityAggregateController::class, 'index']);
    Route::get('/activity-aggregates/hourly', [ActivityAggregateController::class, 'hourlyBreakdown']);
    
    // Admin-only routes (Camera Management & User Management)
    Route::middleware('role:admin')->group(function () {
        // Camera Management
        Route::post('/cameras', [CameraController::class, 'store']);
        Route::put('/cameras/{camera}', [CameraController::class, 'update']);
        Route::delete('/cameras/{camera}', [CameraController::class, 'destroy']);
        
        // User Management
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        
        // Manual aggregation trigger
        Route::post('/activity-aggregates/calculate', [ActivityAggregateController::class, 'calculate']);
        
        // Audit Logs (Admin only)
        Route::get('/audit-logs', [AuditLogController::class, 'index']);
        Route::get('/audit-logs/stats', [AuditLogController::class, 'stats']);
        Route::get('/audit-logs/export', [AuditLogController::class, 'export']);
        
        // Hikvision ISAPI Management (Admin only)
        Route::post('/cameras/{camera}/isapi/test-connection', [HikvisionISAPIController::class, 'testConnection']);
        Route::post('/cameras/{camera}/isapi/sync-events', [HikvisionISAPIController::class, 'syncEvents']);
        Route::get('/cameras/{camera}/isapi/device-info', [HikvisionISAPIController::class, 'deviceInfo']);
        Route::post('/isapi/sync-all', [HikvisionISAPIController::class, 'syncAll']);
        
        // Settings Management
        Route::get('/settings/severity-mapping', [SettingController::class, 'getSeverityMapping']);
        Route::post('/settings/severity-mapping', [SettingController::class, 'updateSeverityMapping']);
    });

    // Management & Admin can export reports
    Route::middleware('role:admin,management')->group(function () {
        Route::get('/export/pdf', [ReportController::class, 'exportPDF']);
        Route::get('/export/excel', [ReportController::class, 'exportExcel']);
        Route::post('/export/send-email', [ReportController::class, 'sendEmail']);
    });
});
