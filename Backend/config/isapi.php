<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Hikvision ISAPI Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Hikvision ISAPI protocol integration
    |
    */

    'enabled' => env('ISAPI_ENABLED', true),
    
    'mock_mode' => env('ISAPI_MOCK_MODE', true),
    
    'default_port' => env('ISAPI_DEFAULT_PORT', 80),
    
    'timeout' => env('ISAPI_TIMEOUT_SECONDS', 10),
    
    'sync_interval_minutes' => env('ISAPI_SYNC_INTERVAL_MINUTES', 5),
    
    // How many days back to sync events on first run
    'initial_sync_days' => env('ISAPI_INITIAL_SYNC_DAYS', 1),
    
    // ISAPI endpoints
    'endpoints' => [
        'device_info' => '/ISAPI/System/deviceInfo',
        'event_search' => '/ISAPI/ContentMgmt/EventSearch',
        'smart_events' => '/ISAPI/Smart/channels/{channelId}/events',
        'alert_stream' => '/ISAPI/Event/notification/alertStream',
    ],
    
    // Object classification mapping
    'object_types' => [
        'human' => ['Human', 'Person', 'People', 'Pedestrian'],
        'vehicle' => ['Vehicle', 'Car', 'Truck', 'Motorcycle', 'Bus'],
    ],
    
    // Event type severity mapping
    'severity_mapping' => [
        'linedetection' => 'medium',
        'fielddetection' => 'medium',
        'regionEntrance' => 'high',
        'regionExiting' => 'medium',
        'loitering' => 'medium',
        'parking' => 'low',
    ],
];
