import { FileText, Download, TrendingUp, TrendingDown, Camera, AlertCircle } from 'lucide-react';
import { ActivityChart } from './ActivityChart';
import { DonutChart } from './DonutChart';

export function Reports() {
  const reportCards = [
    {
      title: 'Weekly Events',
      value: '892',
      change: '+18%',
      trend: 'up',
      icon: AlertCircle,
    },
    {
      title: 'Avg. Response Time',
      value: '2.3 min',
      change: '-12%',
      trend: 'down',
      icon: TrendingDown,
    },
    {
      title: 'False Alarms',
      value: '23',
      change: '-8%',
      trend: 'down',
      icon: Camera,
    },
    {
      title: 'Reports Generated',
      value: '47',
      change: '+5%',
      trend: 'up',
      icon: FileText,
    },
  ];

  const recentReports = [
    {
      name: 'Weekly Security Summary',
      date: 'Dec 24, 2025',
      type: 'PDF',
      size: '2.4 MB',
    },
    {
      name: 'Monthly Event Analysis',
      date: 'Dec 20, 2025',
      type: 'Excel',
      size: '1.8 MB',
    },
    {
      name: 'Camera Performance Report',
      date: 'Dec 18, 2025',
      type: 'PDF',
      size: '3.1 MB',
    },
    {
      name: 'Incident Response Times',
      date: 'Dec 15, 2025',
      type: 'PDF',
      size: '1.2 MB',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-white mb-2">Reports & Analytics</h1>
        <p className="text-gray-400">Generate and view security reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {reportCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className="size-8 text-blue-400" />
                {card.trend === 'up' ? (
                  <TrendingUp className="size-4 text-green-400" />
                ) : (
                  <TrendingDown className="size-4 text-green-400" />
                )}
              </div>
              <div className="text-2xl text-white mb-1">{card.value}</div>
              <div className="text-sm text-gray-400 mb-2">{card.title}</div>
              <div className="text-xs text-green-400">{card.change} from last week</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart />
        <DonutChart />
      </div>

      <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-lg">Recent Reports</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <FileText className="size-4" />
            Generate New Report
          </button>
        </div>

        <div className="space-y-3">
          {recentReports.map((report, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="size-6 text-white" />
                </div>
                <div>
                  <div className="text-white text-sm mb-1">{report.name}</div>
                  <div className="text-gray-400 text-xs">
                    {report.date} • {report.type} • {report.size}
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                <Download className="size-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
