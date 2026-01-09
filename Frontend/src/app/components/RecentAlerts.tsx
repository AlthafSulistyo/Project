import { Eye } from 'lucide-react';

const alerts = [
  {
    id: 1,
    severity: 'High',
    time: '10:45 AM',
    location: 'Class 9.1',
    type: 'Intrusion Detected',
    severityColor: 'bg-red-500',
  },
  {
    id: 2,
    severity: 'Medium',
    time: '10:32 AM',
    location: 'Class 9.1',
    type: 'Motion After Hours',
    severityColor: 'bg-orange-500',
  },
  {
    id: 3,
    severity: 'Low',
    time: '10:18 AM',
    location: 'Class 9.1',
    type: 'Camera Adjustment',
    severityColor: 'bg-yellow-500',
  },
  {
    id: 4,
    severity: 'High',
    time: '09:55 AM',
    location: 'Class 9.1',
    type: 'Unauthorized Access',
    severityColor: 'bg-red-500',
  },
  {
    id: 5,
    severity: 'Medium',
    time: '09:30 AM',
    location: 'Class 9.1',
    type: 'Loitering Detected',
    severityColor: 'bg-orange-500',
  },
];

export function RecentAlerts() {
  return (
    <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white">Recent Alerts</h3>
        <button className="text-blue-400 text-sm hover:text-blue-300">View All</button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-3 bg-gray-900/50 border border-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`${alert.severityColor} px-2 py-1 rounded text-xs text-white`}>
                  {alert.severity}
                </div>
                <span className="text-xs text-gray-500">{alert.time}</span>
              </div>
            </div>

            <div className="text-white text-sm mb-1">{alert.type}</div>
            <div className="text-gray-400 text-xs mb-3">{alert.location}</div>

            <button className="flex items-center gap-2 text-blue-400 text-xs hover:text-blue-300">
              <Eye className="size-3" />
              View Clip
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
