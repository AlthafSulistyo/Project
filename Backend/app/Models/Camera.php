<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Camera extends Model
{
    protected $fillable = [
        'name',
        'location',
        'rtsp_url',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    /**
     * Get the cctv events for the camera.
     */
    public function cctvEvents()
    {
        return $this->hasMany(CctvEvent::class);
    }
}
