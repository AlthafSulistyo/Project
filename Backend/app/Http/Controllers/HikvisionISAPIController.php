<?php

namespace App\Http\Controllers;

use App\Models\Camera;
use App\Services\HikvisionISAPIService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class HikvisionISAPIController extends Controller
{
    protected HikvisionISAPIService $isapiService;
    
    public function __construct(HikvisionISAPIService $isapiService)
    {
        $this->isapiService = $isapiService;
    }
    
    /**
     * Test ISAPI connection to a camera
     */
    public function testConnection(Camera $camera): JsonResponse
    {
        $result = $this->isapiService->testConnection($camera);
        
        return response()->json($result, $result['success'] ? 200 : 500);
    }
    
    /**
     * Get device information from camera
     */
    public function deviceInfo(Camera $camera): JsonResponse
    {
        try {
            $deviceInfo = $this->isapiService->getDeviceInfo($camera);
            
            return response()->json([
                'success' => true,
                'data' => $deviceInfo,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get device info: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Manually sync events from a specific camera
     */
    public function syncEvents(Request $request, Camera $camera): JsonResponse
    {
        $validated = $request->validate([
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after:start_time',
        ]);
        
        $startTime = isset($validated['start_time']) 
            ? Carbon::parse($validated['start_time'])
            : $camera->last_event_sync_at ?? now()->subHours(1);
            
        $endTime = isset($validated['end_time'])
            ? Carbon::parse($validated['end_time'])
            : now();
        
        try {
            // Fetch events
            $events = $this->isapiService->fetchEvents($camera, $startTime, $endTime);
            
            // Sync to database
            $syncedCount = $this->isapiService->syncEventsToDatabase($camera, $events);
            
            return response()->json([
                'success' => true,
                'message' => sprintf('Synced %d new events', $syncedCount),
                'data' => [
                    'total_events' => count($events),
                    'synced_events' => $syncedCount,
                    'start_time' => $startTime->toIso8601String(),
                    'end_time' => $endTime->toIso8601String(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync events: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Sync events from all enabled cameras
     */
    public function syncAll(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after:start_time',
        ]);
        
        $cameras = Camera::where('isapi_enabled', true)
            ->where('status', 'active')
            ->get();
        
        if ($cameras->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No cameras with ISAPI enabled found',
            ], 404);
        }
        
        $results = [];
        $totalSynced = 0;
        
        foreach ($cameras as $camera) {
            try {
                $startTime = isset($validated['start_time']) 
                    ? Carbon::parse($validated['start_time'])
                    : $camera->last_event_sync_at ?? now()->subHours(1);
                    
                $endTime = isset($validated['end_time'])
                    ? Carbon::parse($validated['end_time'])
                    : now();
                
                $events = $this->isapiService->fetchEvents($camera, $startTime, $endTime);
                $syncedCount = $this->isapiService->syncEventsToDatabase($camera, $events);
                
                $results[] = [
                    'camera_id' => $camera->id,
                    'camera_name' => $camera->name,
                    'success' => true,
                    'synced_events' => $syncedCount,
                ];
                
                $totalSynced += $syncedCount;
            } catch (\Exception $e) {
                $results[] = [
                    'camera_id' => $camera->id,
                    'camera_name' => $camera->name,
                    'success' => false,
                    'error' => $e->getMessage(),
                ];
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => sprintf('Synced %d total events from %d cameras', $totalSynced, count($cameras)),
            'data' => $results,
        ]);
    }
}
