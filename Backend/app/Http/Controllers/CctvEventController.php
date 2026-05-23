<?php

namespace App\Http\Controllers;

use App\Models\CctvEvent;
use App\Models\Camera;
use App\Http\Resources\CctvEventResource;
use Illuminate\Http\Request;

class CctvEventController extends Controller
{
    /**
     * Display a paginated listing of CCTV events.
     */
    public function index(Request $request)
    {
        $query = CctvEvent::with('camera');

        // Filter by severity
        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        // Filter by anomaly only
        if ($request->boolean('anomaly_only')) {
            $query->where('is_anomaly', true);
        }

        // Filter by review status
        if ($request->has('is_reviewed')) {
            $query->where('is_reviewed', $request->boolean('is_reviewed'));
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }
        // Tampilkan 100 data
        $events = $query->orderBy('created_at', 'desc')->paginate(100);

        return CctvEventResource::collection($events);
    }

    /**
     * Mark an event as reviewed.
     * 
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function review($id, Request $request)
    {
        $request->validate([
            'is_reviewed' => 'required|boolean',
        ]);

        $event = CctvEvent::findOrFail($id);
        $event->is_reviewed = $request->is_reviewed;
        $event->save();

        return response()->json([
            'message' => 'Event review status updated successfully.',
            'data' => new CctvEventResource($event->load('camera')),
        ]);
    }
    /**
     * Receive webhook from Python AI script.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function receiveAIWebhook(Request $request)
    {
        $request->validate([
            'camera_name' => 'required|string',
            'category' => 'required|string',
            'severity' => 'required|string',
            'message' => 'required|string',
            'active_persons' => 'integer|nullable',
            'snapshot_base64' => 'string|nullable',
        ]);

        // Cari kamera berdasarkan nama
        $camera = Camera::where('name', $request->camera_name)->first();

        // Jika kamera tidak ada, gunakan ID 1 sebagai fallback (atau return error)
        $cameraId = $camera ? $camera->id : 1;

        $snapshotPath = null;
        if ($request->has('snapshot_base64') && !empty($request->snapshot_base64)) {
            $image = base64_decode($request->snapshot_base64);
            $filename = 'cctv_snapshots/ai_' . time() . '_' . uniqid() . '.jpg';
            \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $image);
            $snapshotPath = 'storage/' . $filename;
        }

        $event = CctvEvent::create([
            'camera_id' => $cameraId,
            'event_type' => 'ai_detection',
            'object_type' => 'human',
            'severity' => strtolower($request->severity),
            'description' => $request->message . ' (Kategori: ' . $request->category . ')',
            'is_anomaly' => strtolower($request->severity) === 'high',
            'is_reviewed' => false,
            'snapshot_path' => $snapshotPath,
            'raw_event_data' => $request->except('snapshot_base64'),
        ]);

        return response()->json([
            'message' => 'AI Webhook received successfully.',
            'data' => $event,
        ]);
    }
}
