import { CameraFeed } from './CameraFeed';
import { RecentAlerts } from './RecentAlerts';
import { AlertCircle, Camera, CheckCircle } from 'lucide-react';

export function LiveView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white mb-2">Live Camera Monitoring</h1>
          <p className="text-gray-400">Real-time surveillance feed</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-800 rounded-lg">
            <CheckCircle className="size-5 text-green-400" />
            <div>
              <div className="text-green-400 text-sm">System Online</div>
              <div className="text-gray-400 text-xs">1 Camera Active</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-5">
          <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white">Active Camera Feed</h3>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Camera className="size-4" />
                <span>1 Camera Online</span>
              </div>
            </div>

            <div className="space-y-4">
              <CameraFeed
                cameraName="Main Camera"
                location="Class 9.1"
                isAlarm={true}
                alarmMessage="INTRUSION DETECTED"
              />
            </div>

            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-yellow-400 text-sm mb-1">Single Camera Setup</div>
                  <div className="text-gray-400 text-xs">
                    Currently monitoring Class 9.1. Consider expanding coverage to other areas of your school for comprehensive security.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <RecentAlerts />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Camera Status</div>
          <div className="text-white text-2xl mb-1">1/1</div>
          <div className="flex items-center gap-2 text-green-400 text-xs">
            <div className="size-2 bg-green-500 rounded-full"></div>
            Online & Recording
          </div>
        </div>

        <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Recording Time Today</div>
          <div className="text-white text-2xl mb-1">18h 45m</div>
          <div className="text-gray-500 text-xs">Since 06:00 AM</div>
        </div>

        <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Storage Used</div>
          <div className="text-white text-2xl mb-1">234 GB</div>
          <div className="text-gray-500 text-xs">48% of 500 GB</div>
        </div>
      </div>
    </div>
  );
}
