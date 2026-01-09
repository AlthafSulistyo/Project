<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityAggregate extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'activity_aggregates';

    /**
     * Indicates if the model should be timestamped.
     * Only updated_at is used (no created_at for aggregates)
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'camera_id',
        'date',
        'hour',
        'total_human',
        'total_vehicle',
        'updated_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'date' => 'date',
        'hour' => 'integer',
        'total_human' => 'integer',
        'total_vehicle' => 'integer',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the camera that owns the aggregate.
     */
    public function camera(): BelongsTo
    {
        return $this->belongsTo(Camera::class);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope to filter by camera
     */
    public function scopeForCamera($query, $cameraId)
    {
        return $query->where('camera_id', $cameraId);
    }
}
