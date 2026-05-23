<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function getSeverityMapping()
    {
        $setting = Setting::where('key', 'severity_mapping')->first();
        if (!$setting) {
            return response()->json(['data' => []]);
        }
        return response()->json(['data' => $setting->value]);
    }

    public function updateSeverityMapping(Request $request)
    {
        $request->validate([
            'mapping' => 'required|array'
        ]);

        $mapping = $request->mapping;

        // Alias mapping for Hikvision specific event types
        if (isset($mapping['motion_detected'])) {
            $mapping['VMD'] = $mapping['motion_detected'];
            $mapping['Motion'] = $mapping['motion_detected'];
        }
        if (isset($mapping['line_crossed'])) {
            $mapping['linedetection'] = $mapping['line_crossed'];
        }

        $setting = Setting::updateOrCreate(
            ['key' => 'severity_mapping'],
            ['value' => $mapping]
        );

        \Illuminate\Support\Facades\Cache::forget('severity_mapping');

        return response()->json(['message' => 'Severity mapping updated successfully', 'data' => $setting->value]);
    }
}
