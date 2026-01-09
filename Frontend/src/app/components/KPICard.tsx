import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
  statusColor?: 'green' | 'red' | 'yellow';
  accentColor?: 'red' | 'blue' | 'green';
}

export function KPICard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  statusColor,
  accentColor = 'blue',
}: KPICardProps) {
  const accentColors = {
    red: 'bg-red-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
  };

  const statusColors = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className="bg-[#0f1420] border border-gray-800 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`${accentColors[accentColor]} p-3 rounded-lg`}>
          <Icon className="size-6 text-white" />
        </div>
        {statusColor && (
          <div className={`${statusColors[statusColor]} size-3 rounded-full`}></div>
        )}
      </div>

      <div className="text-2xl text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400 mb-2">{title}</div>

      {subtitle && (
        <div className="flex items-center gap-2 text-xs">
          {statusColor === 'green' && (
            <span className="text-green-400">{subtitle}</span>
          )}
          {!statusColor && (
            <span className="text-gray-500">{subtitle}</span>
          )}
        </div>
      )}

      {trend && (
        <div className="text-xs text-green-400 mt-2">{trend}</div>
      )}
    </div>
  );
}
