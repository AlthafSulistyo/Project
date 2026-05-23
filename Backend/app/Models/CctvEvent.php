<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CctvEvent extends Model
{
    protected $fillable = [
        'camera_id',
        'event_type',
        'object_type',
        'severity',
        'is_reviewed',
        'reviewed_at',
        'reviewed_by',
        'is_anomaly',
        'description',
        'snapshot_path',
        'isapi_event_id',
        'raw_event_data',
        'detection_region',
    ];

    protected $casts = [
        'severity' => 'string',
        'object_type' => 'string',
        'is_reviewed' => 'boolean',
        'is_anomaly' => 'boolean',
        'reviewed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'raw_event_data' => 'array',
        'detection_region' => 'array',
    ];

    /**
     * Get the camera that owns the event.
     */
    public function camera()
    {
        return $this->belongsTo(Camera::class);
    }

    /**
     * Scope for anomalies only
     */
    public function scopeAnomalies($query)
    {
        return $query->where('is_anomaly', true);
    }

    /**
     * Scope for unreviewed events
     */
    public function scopeUnreviewed($query)
    {
        return $query->where('is_reviewed', false);
    }

    /**
     * Scope for human detection events
     */
    public function scopeHumans($query)
    {
        return $query->where('object_type', 'human');
    }

    /**
     * Scope for vehicle detection events
     */
    public function scopeVehicles($query)
    {
        return $query->where('object_type', 'vehicle');
    }

    /**
     * Scope for specific object type
     */
    public function scopeObjectType($query, string $type)
    {
        return $query->where('object_type', $type);
    }
}
