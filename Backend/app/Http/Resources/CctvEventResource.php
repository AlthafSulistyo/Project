<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CctvEventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'camera_name' => $this->camera->name,  // Frontend expects this field
            'event_type' => $this->event_type,
            'severity' => $this->severity,
            'is_reviewed' => $this->is_reviewed,
            'description' => $this->description,
            'snapshot_path' => $this->snapshot_path,
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
