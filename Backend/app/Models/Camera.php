<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Camera extends Model
{
    protected $fillable = [
        'name',
        'location',
        'rtsp_url',
        'status',
        'isapi_host',
        'isapi_port',
        'isapi_username',
        'isapi_password',
        'isapi_enabled',
        'last_event_sync_at',
    ];

    protected $casts = [
        'status' => 'string',
        'isapi_enabled' => 'boolean',
        'last_event_sync_at' => 'datetime',
    ];

    protected $hidden = [
        'isapi_password',
    ];

    /**
     * Get the cctv events for the camera.
     */
    public function cctvEvents()
    {
        return $this->hasMany(CctvEvent::class);
    }

    /**
     * Encrypt password when setting
     */
    public function setIsapiPasswordAttribute($value)
    {
        if ($value) {
            $this->attributes['isapi_password'] = Crypt::encryptString($value);
        }
    }

    /**
     * Decrypt password when getting
     */
    public function getIsapiPasswordAttribute($value)
    {
        if ($value) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Get full ISAPI URL
     */
    public function getIsapiUrlAttribute(): ?string
    {
        if (!$this->isapi_host) {
            return null;
        }

        $port = $this->isapi_port ?? 80;
        return sprintf('http://%s:%d', $this->isapi_host, $port);
    }
}
