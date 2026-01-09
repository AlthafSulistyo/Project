import { useState } from 'react';
import { Search, Download, Eye, Filter } from 'lucide-react';

const events = [
  {
    id: 'EVT-001',
    timestamp: 'Dec 24, 2025 10:45 AM',
    location: 'Class 9.1',
    type: 'Intrusion',
    severity: 'High',
    status: 'Pending',
  },
  {
    id: 'EVT-002',
    timestamp: 'Dec 24, 2025 10:32 AM',
    location: 'Class 9.1',
    type: 'Motion Detection',
    severity: 'Medium',
    status: 'Resolved',
  },
  {
    id: 'EVT-003',
    timestamp: 'Dec 24, 2025 10:18 AM',
    location: 'Class 9.1',
    type: 'Camera Adjustment',
    severity: 'Low',
    status: 'Resolved',
  },
  {
    id: 'EVT-004',
    timestamp: 'Dec 24, 2025 09:55 AM',
    location: 'Class 9.1',
    type: 'Unauthorized Access',
    severity: 'High',
    status: 'Resolved',
  },
  {
    id: 'EVT-005',
    timestamp: 'Dec 24, 2025 09:30 AM',
    location: 'Class 9.1',
    type: 'Loitering',
    severity: 'Medium',
    status: 'Resolved',
  },
  {
    id: 'EVT-006',
    timestamp: 'Dec 24, 2025 09:15 AM',
    location: 'Class 9.1',
    type: 'Line Crossing',
    severity: 'Medium',
    status: 'Resolved',
  },
  {
    id: 'EVT-007',
    timestamp: 'Dec 24, 2025 08:45 AM',
    location: 'Class 9.1',
    type: 'Motion Detection',
    severity: 'Low',
    status: 'Resolved',
  },
  {
    id: 'EVT-008',
    timestamp: 'Dec 24, 2025 08:20 AM',
    location: 'Class 9.1',
    type: 'System Check',
    severity: 'Low',
    status: 'Resolved',
  },
];

export function EventLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-orange-500';
      case 'Low':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Pending' ? 'text-yellow-400' : 'text-green-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-white mb-2">Event Logs & Reports</h1>
        <p className="text-gray-400">View and analyze security events</p>
      </div>

      <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search location or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Event Types</option>
            <option value="intrusion">Intrusion</option>
            <option value="loitering">Loitering</option>
            <option value="motion">Motion Detection</option>
            <option value="line-crossing">Line Crossing</option>
          </select>

          <input
            type="text"
            placeholder="Oct 1 - Oct 24, 2025"
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Download className="size-4" />
            Export PDF
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <Download className="size-4" />
            Export Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 text-sm">ID</th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm">Timestamp</th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm">Camera Location</th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm">Event Type</th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm">Severity</th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr
                  key={event.id}
                  className={`border-b border-gray-800 hover:bg-gray-900/50 ${
                    index % 2 === 0 ? 'bg-gray-900/20' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-white text-sm">{event.id}</td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{event.timestamp}</td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{event.location}</td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{event.type}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-2 px-2 py-1 ${getSeverityColor(event.severity)} text-white text-xs rounded`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-sm ${getStatusColor(event.status)}`}>
                    {event.status}
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="text-gray-400 text-sm">
            Showing 1 to 8 of 145 entries
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors">2</button>
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors">3</button>
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
