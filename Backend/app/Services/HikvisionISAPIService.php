<?php

namespace App\Services;

use App\Models\Camera;
use App\Models\CctvEvent;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use SimpleXMLElement;

class HikvisionISAPIService
{
    protected bool $mockMode;
    
    public function __construct()
    {
        $this->mockMode = config('isapi.mock_mode', true);
    }
    
    /**
     * Enable or disable mock mode
     */
    public function setMockMode(bool $enabled): void
    {
        $this->mockMode = $enabled;
    }
    
    /**
     * Test ISAPI connection to camera
     */
    public function testConnection(Camera $camera): array
    {
        if ($this->mockMode) {
            return [
                'success' => true,
                'message' => 'Mock connection successful',
                'device_info' => $this->getMockDeviceInfo(),
            ];
        }
        
        try {
            $deviceInfo = $this->getDeviceInfo($camera);
            
            return [
                'success' => true,
                'message' => 'Connection successful',
                'device_info' => $deviceInfo,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Connection failed: ' . $e->getMessage(),
            ];
        }
    }
    
    /**
     * Get device information from ISAPI
     */
    public function getDeviceInfo(Camera $camera): array
    {
        if ($this->mockMode) {
            return $this->getMockDeviceInfo();
        }
        
        $url = $this->buildUrl($camera, config('isapi.endpoints.device_info'));
        
        $response = $this->makeAuthenticatedRequest($camera, 'GET', $url);
        
        // Parse XML response
        $xml = new SimpleXMLElement($response);
        
        return [
            'device_name' => (string) $xml->deviceName ?? 'Unknown',
            'device_id' => (string) $xml->deviceID ?? 'Unknown',
            'model' => (string) $xml->model ?? 'Unknown',
            'serial_number' => (string) $xml->serialNumber ?? 'Unknown',
            'firmware_version' => (string) $xml->firmwareVersion ?? 'Unknown',
        ];
    }
    
    /**
     * Fetch events from ISAPI within a time range
     */
    public function fetchEvents(Camera $camera, Carbon $startTime, Carbon $endTime): array
    {
        if ($this->mockMode) {
            return $this->generateMockEvents($startTime, $endTime);
        }
        
        // Build event search request XML
        $searchXml = $this->buildEventSearchXml($startTime, $endTime);
        
        $url = $this->buildUrl($camera, config('isapi.endpoints.event_search'));
        
        try {
            $response = $this->makeAuthenticatedRequest($camera, 'POST', $url, [
                'body' => $searchXml,
                'headers' => [
                    'Content-Type' => 'application/xml',
                ],
            ]);
            
            return $this->parseEventResponse($response, 'xml');
        } catch (\Exception $e) {
            Log::error('Failed to fetch ISAPI events', [
                'camera_id' => $camera->id,
                'error' => $e->getMessage(),
            ]);
            
            throw $e;
        }
    }
    
    /**
     * Sync events to database
     */
    public function syncEventsToDatabase(Camera $camera, array $events): int
    {
        $syncedCount = 0;
        
        foreach ($events as $eventData) {
            // Check if event already exists
            if (isset($eventData['isapi_event_id'])) {
                $exists = CctvEvent::where('isapi_event_id', $eventData['isapi_event_id'])->exists();
                if ($exists) {
                    continue; // Skip duplicate
                }
            }
            
            // Create event
            CctvEvent::create([
                'camera_id' => $camera->id,
                'event_type' => $eventData['event_type'] ?? 'unknown',
                'object_type' => $eventData['object_type'] ?? 'unknown',
                'severity' => $eventData['severity'] ?? 'medium',
                'description' => $eventData['description'] ?? null,
                'isapi_event_id' => $eventData['isapi_event_id'] ?? null,
                'raw_event_data' => $eventData['raw_data'] ?? null,
                'detection_region' => $eventData['detection_region'] ?? null,
                'snapshot_path' => $eventData['snapshot_path'] ?? null,
                'created_at' => $eventData['event_time'] ?? now(),
            ]);
            
            $syncedCount++;
        }
        
        // Update last sync time
        $camera->update(['last_event_sync_at' => now()]);
        
        return $syncedCount;
    }
    
    /**
     * Parse event response (XML or JSON)
     */
    protected function parseEventResponse(string $response, string $format = 'xml'): array
    {
        $events = [];
        
        if ($format === 'xml') {
            $xml = new SimpleXMLElement($response);
            
            foreach ($xml->searchMatchItem as $item) {
                $events[] = $this->parseXmlEventItem($item);
            }
        } elseif ($format === 'json') {
            $data = json_decode($response, true);
            
            if (isset($data['searchMatchList'])) {
                foreach ($data['searchMatchList'] as $item) {
                    $events[] = $this->parseJsonEventItem($item);
                }
            }
        }
        
        return $events;
    }
    
    /**
     * Parse single XML event item
     */
    protected function parseXmlEventItem(SimpleXMLElement $item): array
    {
        $eventType = (string) ($item->eventType ?? 'unknown');
        $targetType = (string) ($item->targetAttribs->ObjectType ?? 'unknown');
        
        return [
            'isapi_event_id' => (string) ($item->eventId ?? uniqid('event_')),
            'event_type' => $eventType,
            'object_type' => $this->extractObjectClassification($targetType),
            'severity' => $this->mapSeverity($eventType),
            'description' => (string) ($item->eventDescription ?? ''),
            'event_time' => isset($item->startTime) ? Carbon::parse((string) $item->startTime) : now(),
            'detection_region' => $this->parseDetectionRegion($item),
            'raw_data' => json_decode(json_encode($item), true),
        ];
    }
    
    /**
     * Parse single JSON event item
     */
    protected function parseJsonEventItem(array $item): array
    {
        $eventType = $item['eventType'] ?? 'unknown';
        $targetType = $item['targetAttribs']['ObjectType'] ?? 'unknown';
        
        return [
            'isapi_event_id' => $item['eventId'] ?? uniqid('event_'),
            'event_type' => $eventType,
            'object_type' => $this->extractObjectClassification($targetType),
            'severity' => $this->mapSeverity($eventType),
            'description' => $item['eventDescription'] ?? '',
            'event_time' => isset($item['startTime']) ? Carbon::parse($item['startTime']) : now(),
            'detection_region' => $item['detectionRegion'] ?? null,
            'raw_data' => $item,
        ];
    }
    
    /**
     * Extract object classification (human/vehicle)
     */
    protected function extractObjectClassification(string $targetType): string
    {
        $objectTypes = config('isapi.object_types');
        
        foreach ($objectTypes['human'] as $humanType) {
            if (stripos($targetType, $humanType) !== false) {
                return 'human';
            }
        }
        
        foreach ($objectTypes['vehicle'] as $vehicleType) {
            if (stripos($targetType, $vehicleType) !== false) {
                return 'vehicle';
            }
        }
        
        return 'unknown';
    }
    
    /**
     * Map event type to severity
     */
    protected function mapSeverity(string $eventType): string
    {
        $mapping = \Illuminate\Support\Facades\Cache::remember('severity_mapping', 300, function() {
            $setting = \App\Models\Setting::where('key', 'severity_mapping')->first();
            return $setting ? $setting->value : config('isapi.severity_mapping');
        });
        
        foreach ($mapping as $key => $severity) {
            if (strtolower($key) === strtolower($eventType)) {
                return $severity;
            }
        }
        
        return 'medium';
    }
    
    /**
     * Parse detection region from XML
     */
    protected function parseDetectionRegion(SimpleXMLElement $item): ?array
    {
        if (!isset($item->detectionRegionList)) {
            return null;
        }
        
        $regions = [];
        foreach ($item->detectionRegionList->detectionRegionEntry as $entry) {
            $regions[] = [
                'x' => (int) $entry->positionX,
                'y' => (int) $entry->positionY,
                'width' => (int) $entry->width,
                'height' => (int) $entry->height,
            ];
        }
        
        return empty($regions) ? null : $regions;
    }
    
    /**
     * Build event search XML request
     */
    protected function buildEventSearchXml(Carbon $startTime, Carbon $endTime): string
    {
        return sprintf(
            '<?xml version="1.0" encoding="utf-8"?><CMSearchDescription xmlns="http://www.hikvision.com/ver20/XMLSchema"><searchID>%s</searchID><trackList><trackID>101</trackID></trackList><timeSpanList><timeSpan><startTime>%s</startTime><endTime>%s</endTime></timeSpan></timeSpanList><maxResults>100</maxResults><searchResultPosition>0</searchResultPosition><metadataList><metadataDescriptor><metadataType>smart</metadataType></metadataDescriptor></metadataList></CMSearchDescription>',
            uniqid('search_'),
            $startTime->setTimezone('UTC')->format('Y-m-d\TH:i:s\Z'),
            $endTime->setTimezone('UTC')->format('Y-m-d\TH:i:s\Z')
        );
    }
    
    /**
     * Make authenticated HTTP request to ISAPI
     */
    protected function makeAuthenticatedRequest(Camera $camera, string $method, string $url, array $options = []): string
    {
        $username = $camera->isapi_username;
        $password = $camera->isapi_password ? Crypt::decryptString($camera->isapi_password) : '';
        
        $client = Http::timeout(config('isapi.timeout'))
            ->withDigestAuth($username, $password)
            ->withOptions(array_merge([
                'verify' => false,
            ], $options));
            
        if (isset($options['headers'])) {
            $client = $client->withHeaders($options['headers']);
        }
        
        if (isset($options['body']) && is_string($options['body'])) {
            $contentType = $options['headers']['Content-Type'] ?? 'application/xml';
            $response = $client->withBody($options['body'], $contentType)->$method($url);
        } else {
            $response = $client->$method($url, $options['body'] ?? []);
        }
        
        if (!$response->successful()) {
            throw new \Exception('ISAPI request failed: ' . $response->status() . ' - ' . $response->body());
        }
        
        return $response->body();
    }
    
    /**
     * Build full URL for ISAPI endpoint
     */
    protected function buildUrl(Camera $camera, string $endpoint): string
    {
        $protocol = 'http'; // Use https if camera supports it
        $host = $camera->isapi_host;
        $port = $camera->isapi_port ?? config('isapi.default_port');
        
        return sprintf('%s://%s:%d%s', $protocol, $host, $port, $endpoint);
    }
    
    /**
     * Generate mock events for testing
     */
    protected function generateMockEvents(Carbon $startTime, Carbon $endTime): array
    {
        $events = [];
        $eventTypes = ['linedetection', 'fielddetection', 'regionEntrance', 'loitering'];
        $objectTypes = ['Human', 'Vehicle', 'Person', 'Car'];
        
        // Generate 5-10 random events
        $count = rand(5, 10);
        
        for ($i = 0; $i < $count; $i++) {
            $eventType = $eventTypes[array_rand($eventTypes)];
            $objectType = $objectTypes[array_rand($objectTypes)];
            
            $eventTime = Carbon::createFromTimestamp(
                rand($startTime->timestamp, $endTime->timestamp)
            );
            
            $events[] = [
                'isapi_event_id' => 'mock_' . uniqid(),
                'event_type' => $eventType,
                'object_type' => $this->extractObjectClassification($objectType),
                'severity' => $this->mapSeverity($eventType),
                'description' => sprintf('Mock %s detection - %s detected', $eventType, $objectType),
                'event_time' => $eventTime,
                'detection_region' => [
                    ['x' => rand(0, 1920), 'y' => rand(0, 1080), 'width' => rand(50, 200), 'height' => rand(50, 200)]
                ],
                'raw_data' => [
                    'mock' => true,
                    'timestamp' => $eventTime->toIso8601String(),
                    'objectType' => $objectType,
                ],
            ];
        }
        
        return $events;
    }
    
    /**
     * Get mock device info
     */
    protected function getMockDeviceInfo(): array
    {
        return [
            'device_name' => 'Mock Hikvision Smart CCTV',
            'device_id' => 'MOCK-' . strtoupper(uniqid()),
            'model' => 'DS-2CD2185FWD-I',
            'serial_number' => 'MOCK' . rand(100000, 999999),
            'firmware_version' => 'V5.7.13',
        ];
    }
}
