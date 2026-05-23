<?php

namespace App\Console\Commands;

use App\Models\Camera;
use App\Models\CctvEvent;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class ListenHikvisionAlerts extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'isapi:listen-alerts {--camera= : Specific camera ID to listen to}';

    /**
     * The console command description.
     */
    protected $description = 'Listen to live real-time alert streams from Hikvision cameras';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Starting Real-time Hikvision Alert Listener...");

        $query = Camera::where('isapi_enabled', true)
            ->where('status', 'active');
            
        if ($cameraId = $this->option('camera')) {
            $query->where('id', $cameraId);
        }
        
        $cameras = $query->get();
        if ($cameras->isEmpty()) {
            $this->error("No active cameras found with ISAPI enabled.");
            return Command::FAILURE;
        }

        // Initialize cURL Multi Handle
        $mh = curl_multi_init();
        $handles = [];
        $buffers = [];

        foreach ($cameras as $camera) {
            $ch = curl_init();
            
            $port = $camera->isapi_port ?? 80;
            $url = "http://{$camera->isapi_host}:{$port}/ISAPI/Event/notification/alertStream";
            $password = $camera->isapi_password ? Crypt::decryptString($camera->isapi_password) : '';
            
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, false); // Rely on writefunction to catch data progressively
            curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_DIGEST | CURLAUTH_BASIC); // Most use Digest, some fallback to Basic
            curl_setopt($ch, CURLOPT_USERPWD, "{$camera->isapi_username}:{$password}");
            curl_setopt($ch, CURLOPT_TIMEOUT, 0); // Indefinite timeout for streams
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
            
            // Bypass SSL verification if any
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $buffers[$camera->id] = '';

            // The magical write function that parses stream frames as they arrive over LAN!
            curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $data) use ($camera, &$buffers) {
                // Append chunk data to camera's personal buffer
                $buffers[$camera->id] .= $data;
                
                // Process the buffer for any complete XML frames
                $this->processBuffer($camera, $buffers);
                
                return strlen($data);
            });

            curl_multi_add_handle($mh, $ch);
            $handles[$camera->id] = $ch;
            
            $this->info("Connected streaming listener to [{$camera->name}] di {$camera->isapi_host}");
        }

        $this->line('');
        $this->warn("Listening for native live events... (Press Ctrl+C to stop)");

        // Non-blocking async multi-curl loop
        $active = null;
        do {
            $mrc = curl_multi_exec($mh, $active);
            if ($active) {
                // Sleep for a fraction to prevent 100% CPU usage loop
                curl_multi_select($mh, 0.5);
            }
        } while ($active && $mrc == CURLM_OK);

        $this->info("Connections closed, wrapping up...");

        foreach ($handles as $ch) {
            curl_multi_remove_handle($mh, $ch);
            curl_close($ch);
        }
        curl_multi_close($mh);

        return Command::SUCCESS;
    }

    /**
     * Process string buffer to find raw XML borders
     */
    protected function processBuffer(Camera $camera, array &$buffers)
    {
        $buffer = &$buffers[$camera->id];
        
        $startTag = '<EventNotificationAlert';
        $endTag = '</EventNotificationAlert>';
        
        while (($startPos = strpos($buffer, $startTag)) !== false) {
            $endPos = strpos($buffer, $endTag, $startPos);
            if ($endPos !== false) {
                // We successfully located a complete XML package chunk
                $xmlLength = ($endPos + strlen($endTag)) - $startPos;
                $xmlString = substr($buffer, $startPos, $xmlLength);
                
                // Excise it from the buffer
                $buffer = substr($buffer, $startPos + $xmlLength);
                
                // Attempt to translate it and save into MySQL
                $this->parseAndSaveEvent($camera, $xmlString);
            } else {
                // Incomplete tag (camera still sending bytes over network), break and wait for more
                break;
            }
        }
        
        // Prevent buffer bloat if the connection drops garbage long-term
        if (strlen($buffer) > 500000) { 
            $buffer = ''; // Hard reset
        }
    }

    /**
     * Dissect XML and store event in database if applicable
     */
    protected function parseAndSaveEvent(Camera $camera, string $xmlString)
    {
        try {
            // Suppress syntax warnings if device sent slightly malformed ISAPI standard
            $xml = @simplexml_load_string($xmlString);
            if (!$xml) return;
            
            $eventType = (string) ($xml->eventType ?? 'unknown');
            $eventState = (string) ($xml->eventState ?? 'active');
            
            // Hikvision pulses "inactive" events when an object leaves the frame or as a heartbeat
            if ($eventState === 'inactive' || $eventType === 'videoloss') {
                return;
            }
            
            $objectTypeInfo = (string) ($xml->channelName ?? '');
            
            // Konfigurasi Jam Sekolah (05:30 - 14:30 WIB, Senin-Jumat)
            // Pakai zona waktu lokal biar sinkron dengan jadwal Indonesia
            $now = now()->timezone('Asia/Jakarta');
            $isWeekday = $now->isWeekday(); // Senin-Jumat
            $isSchoolHours = false;
            
            if ($isWeekday) {
                // Konfigurasi patokan jam yang sama (05:30 s/d 14:30)
                $schoolStart = $now->copy()->setTime(5, 30, 0);
                $schoolEnd = $now->copy()->setTime(14, 30, 59);
                if ($now->between($schoolStart, $schoolEnd)) {
                    $isSchoolHours = true;
                }
            }
            $isOutOfHours = !$isSchoolHours;

            // Default fallback ke Medium (Tampering, Scene Change, Audio Anomaly, Fight)
            $mappedObject = 'unknown';
            $severity = 'medium';
            
            // Get mapping from DB
            $mapping = \Illuminate\Support\Facades\Cache::remember('severity_mapping', 300, function() {
                $setting = \App\Models\Setting::where('key', 'severity_mapping')->first();
                return $setting ? $setting->value : config('isapi.severity_mapping');
            });
            
            // Determine base severity from mapping
            foreach ($mapping as $key => $val) {
                if (stripos($eventType, $key) !== false) {
                    $severity = $val;
                    if (in_array(strtolower($key), ['linedetection', 'fielddetection', 'regionentrance', 'intrusion', 'line_crossed'])) {
                        $mappedObject = 'human';
                    }
                    break;
                }
            }
            
            // Pengecekan Khusus Malam / Luar Jam Sekolah
            $isLineOrIntrusion = stripos($eventType, 'linedetection') !== false || stripos($eventType, 'fielddetection') !== false || stripos($eventType, 'intrusion') !== false;
            $isMotion = stripos($eventType, 'VMD') !== false || stripos($eventType, 'Motion') !== false;

            if ($isOutOfHours) {
                // HIGH - DI LUAR JAM SEKOLAH (Malam hari / Sabtu-Minggu)
                if ($isLineOrIntrusion || $isMotion) {
                    $severity = 'high';
                }
            }

            // Rate Limit "Low" severity events to 1 per minute per camera
            if ($severity === 'low') {
                $cacheKey = "camera_{$camera->id}_last_low_event";
                if (\Illuminate\Support\Facades\Cache::has($cacheKey)) {
                    return; // Skip logging this event to prevent DB and snapshot spam saat jam belajar
                }
                // Lock for 60 seconds
                \Illuminate\Support\Facades\Cache::put($cacheKey, true, 60);
            }

            // Grab a snapshot image from the camera exactly when the event triggered
            $snapshotPath = $this->captureSnapshot($camera);

            // Save natively to database!
            // Wrapping in simple query or model call
            CctvEvent::create([
                'camera_id' => $camera->id,
                'event_type' => $eventType,
                'object_type' => $mappedObject,
                'severity' => $severity,
                'description' => "Real-time Trigger: " . ($xml->eventDescription ?? $eventType),
                'isapi_event_id' => uniqid("rt_"),
                'raw_event_data' => json_encode(['xml_raw' => $xmlString]),
                'snapshot_path' => $snapshotPath,
                'created_at' => now(),
            ]);

            $status = $snapshotPath ? '(With Snapshot 📸)' : '(No Snapshot)';
            $this->info(now()->format('H:i:s') . " | ⚡ [{$camera->name}] Event Terekam: {$eventType} {$status}");
            
        } catch (\Exception $e) {
            // Don't kill the loop just because single parsing failed
            $this->error("Error memproses XML dari [{$camera->name}]: " . $e->getMessage());
        }
    }

    /**
     * Download a real-time snapshot directly from ISAPI Picture endpoint
     */
    protected function captureSnapshot(Camera $camera): ?string
    {
        try {
            $port = $camera->isapi_port ?? 80;
            $url = "http://{$camera->isapi_host}:{$port}/ISAPI/Streaming/channels/101/picture";
            $password = $camera->isapi_password ? Crypt::decryptString($camera->isapi_password) : '';
            
            $response = \Illuminate\Support\Facades\Http::timeout(3)
                ->withDigestAuth($camera->isapi_username, $password)
                ->withOptions(['verify' => false])
                ->get($url);
                
            if ($response->successful()) {
                $filename = 'snapshots/cam_' . $camera->id . '_' . time() . '_' . uniqid() . '.jpg';
                \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $response->body());
                return 'storage/' . $filename;
            }
            return null;
        } catch (\Exception $e) {
            $this->error("Failed to capture snapshot for {$camera->name}: " . $e->getMessage());
            return null;
        }
    }
}
