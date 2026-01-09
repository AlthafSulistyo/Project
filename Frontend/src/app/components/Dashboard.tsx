import { TriangleAlert, Camera, Siren, TrendingUp } from 'lucide-react';
import { KPICard } from './KPICard';
import { DonutChart } from './DonutChart';
import { ActivityChart } from './ActivityChart';
import { TodaySummary } from './TodaySummary';
import { RecentAlerts } from './RecentAlerts';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Monitor your school security system in real-time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Total Events Today"
          value="145"
          icon={TriangleAlert}
          trend="+12% from yesterday"
          accentColor="blue"
        />
        <KPICard
          title="Active Cameras"
          value="1/1"
          icon={Camera}
          subtitle="All Systems Online"
          statusColor="green"
          accentColor="green"
        />
        <KPICard
          title="Critical Alerts"
          value="3"
          icon={Siren}
          subtitle="Requires attention"
          accentColor="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <ActivityChart />
          <DonutChart />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <TodaySummary />
          <RecentAlerts />
        </div>
      </div>
    </div>
  );
}
