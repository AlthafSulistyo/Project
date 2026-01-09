<?php

namespace App\Http\Controllers;

use App\Models\Camera;
use App\Http\Resources\CameraResource;
use App\Http\Requests\StoreCameraRequest;
use App\Http\Requests\UpdateCameraRequest;
use Illuminate\Http\Request;

class CameraController extends Controller
{
    /**
     * Display a listing of all cameras.
     */
    public function index()
    {
        $cameras = Camera::all();
        return CameraResource::collection($cameras);
    }

    /**
     * Store a newly created camera in storage.
     */
    public function store(StoreCameraRequest $request)
    {
        $camera = Camera::create($request->validated());

        return response()->json([
            'message' => 'Camera created successfully.',
            'data' => new CameraResource($camera),
        ], 201);
    }

    /**
     * Display the specified camera.
     */
    public function show(string $id)
    {
        $camera = Camera::findOrFail($id);
        return new CameraResource($camera);
    }

    /**
     * Update the specified camera in storage.
     */
    public function update(UpdateCameraRequest $request, string $id)
    {
        $camera = Camera::findOrFail($id);
        $camera->update($request->validated());

        return response()->json([
            'message' => 'Camera updated successfully.',
            'data' => new CameraResource($camera),
        ]);
    }

    /**
     * Remove the specified camera from storage.
     */
    public function destroy(string $id)
    {
        $camera = Camera::findOrFail($id);
        $camera->delete();

        return response()->json([
            'message' => 'Camera deleted successfully.',
        ]);
    }
}
