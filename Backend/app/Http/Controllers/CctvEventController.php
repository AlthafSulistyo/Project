<?php

namespace App\Http\Controllers;

use App\Models\CctvEvent;
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

        $events = $query->orderBy('created_at', 'desc')->paginate(15);

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
}
