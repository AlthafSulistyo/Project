<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CctvEvent extends Model
{
    protected $fillable = [
        'camera_id',
        'event_type',
        'severity',
        'is_reviewed',
        'reviewed_at',
        'reviewed_by',
        'is_anomaly',
        'description',
        'snapshot_path',
    ];

    protected $casts = [
        'severity' => 'string',
        'is_reviewed' => 'boolean',
        'is_anomaly' => 'boolean',
        'reviewed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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
}
