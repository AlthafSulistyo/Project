import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', events: 2 },
  { time: '02:00', events: 1 },
  { time: '04:00', events: 0 },
  { time: '06:00', events: 3 },
  { time: '08:00', events: 12 },
  { time: '10:00', events: 18 },
  { time: '12:00', events: 35 },
  { time: '14:00', events: 28 },
  { time: '16:00', events: 22 },
  { time: '18:00', events: 8 },
  { time: '20:00', events: 5 },
  { time: '22:00', events: 3 },
];

export function ActivityChart() {
  return (
    <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
      <h3 className="text-white mb-4">Hourly Activity Trend (24h)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="events" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
