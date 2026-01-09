import { useState } from 'react';
import { Camera, Maximize2, AlertCircle } from 'lucide-react';

interface CameraFeedProps {
  cameraName: string;
  location: string;
  isAlarm?: boolean;
  alarmMessage?: string;
}

export function CameraFeed({ cameraName, location, isAlarm, alarmMessage }: CameraFeedProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <div
      className={`relative bg-gray-900 rounded-lg overflow-hidden ${
        isAlarm ? 'ring-4 ring-red-500 animate-pulse' : 'border border-gray-800'
      }`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="flex items-center justify-between p-3 bg-black/60">
        <div>
          <div className="text-white text-sm">{cameraName}</div>
          <div className="text-gray-400 text-xs">{location}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-red-600 rounded text-xs text-white">
            <div className="size-2 bg-white rounded-full animate-pulse"></div>
            LIVE
          </div>
        </div>
      </div>

      <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        {isAlarm && (
          <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center z-10">
            <div className="text-center">
              <AlertCircle className="size-16 text-red-500 mx-auto mb-2" />
              <div className="text-red-500 text-xl uppercase tracking-wider">
                {alarmMessage || 'INTRUSION DETECTED'}
              </div>
            </div>
          </div>
        )}
        
        <Camera className="size-16 text-gray-700" />
        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          Camera feed simulation
        </div>
      </div>

      {showControls && (
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button className="p-2 bg-black/60 hover:bg-black/80 rounded-lg transition-colors">
            <Camera className="size-4 text-white" />
          </button>
          <button className="p-2 bg-black/60 hover:bg-black/80 rounded-lg transition-colors">
            <Maximize2 className="size-4 text-white" />
          </button>
        </div>
      )}

      {isAlarm && (
        <div className="absolute top-3 right-3 z-20">
          <div className="px-3 py-1 bg-red-600 text-white text-xs rounded-full animate-pulse">
            ALERT
          </div>
        </div>
      )}
    </div>
  );
}
