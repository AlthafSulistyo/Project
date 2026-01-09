import { CircleAlert, Camera, Clock } from 'lucide-react';

export function TodaySummary() {
  const stats = [
    { label: 'Total Events', value: '145', change: '+12%', changeType: 'increase' },
    { label: 'Active Cameras', value: '1/1', change: 'Online', changeType: 'success' },
    { label: 'Avg Response Time', value: '2.3m', change: '-15%', changeType: 'decrease' },
    { label: 'Critical Alerts', value: '3', change: 'Pending', changeType: 'warning' },
  ];

  return (
    <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
      <h3 className="text-white mb-4">Today's Summary</h3>
      
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
            <div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
              <div className="text-white text-xl mt-1">{stat.value}</div>
            </div>
            <div>
              {stat.changeType === 'increase' && (
                <div className="text-green-400 text-sm">{stat.change}</div>
              )}
              {stat.changeType === 'success' && (
                <div className="flex items-center gap-1">
                  <div className="size-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 text-sm">{stat.change}</span>
                </div>
              )}
              {stat.changeType === 'decrease' && (
                <div className="text-green-400 text-sm">{stat.change}</div>
              )}
              {stat.changeType === 'warning' && (
                <div className="text-red-400 text-sm">{stat.change}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Camera className="size-5 text-blue-400 mt-1" />
          <div>
            <div className="text-white text-sm">System Status</div>
            <div className="text-gray-400 text-xs mt-1">
              All surveillance systems operational. Last check: 2 minutes ago.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
