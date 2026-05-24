import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { LineChart, Line, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Video, Activity, Clock, MapPin, CheckCircle } from 'lucide-react';

// --- Interface Data ---
interface DashboardStats {
  total_today: number;
  critical_alerts: number;
  active_cameras: number;
  weekly_trend?: any[];
  monthly_recap?: any;
}

interface CctvEvent {
  id: string;
  camera_name: string;
  event_type: string;
  severity: string;
  is_reviewed: boolean;
  created_at: string;
}

interface Camera {
  id: string;
  name: string;
  location: string;
  status: string;
}

// Data dummy grafik mingguan
const dummyWeeklyTrend = [
  { day: 'Sen', low: 5, medium: 2, high: 0 },
  { day: 'Sel', low: 8, medium: 3, high: 1 },
  { day: 'Rab', low: 4, medium: 1, high: 0 },
  { day: 'Kam', low: 6, medium: 4, high: 2 },
  { day: 'Jum', low: 10, medium: 5, high: 1 },
  { day: 'Sab', low: 2, medium: 0, high: 0 },
  { day: 'Min', low: 1, medium: 0, high: 0 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ 
    total_today: 0, 
    critical_alerts: 0, 
    active_cameras: 0,
    weekly_trend: dummyWeeklyTrend,
    monthly_recap: { current_month_total: 0, percentage_change: 0, by_severity: { high: 0, medium: 0, low: 0 } }
  });
  const [events, setEvents] = useState<CctvEvent[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);

  // Ref untuk menyimpan ID notifikasi terakhir agar tidak spam
  const lastNotifiedId = useRef<string | null>(null);

  useEffect(() => {

    // --- 1A. FIREBASE LISTENER UNTUK STATISTIK HARI INI ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const qStats = query(
      collection(db, 'cctv_events'),
      where('timestamp', '>=', today)
    );

    const unsubscribeStats = onSnapshot(qStats, (snapshot) => {
      let total = 0;
      let critical = 0;

      snapshot.forEach((doc) => {
        total++;
        const data = doc.data();
        const severityStr = data.severity?.toLowerCase() || 'low';
        if (severityStr === 'high') critical++;
      });

      setStats(prev => ({
        ...prev,
        total_today: total,
        critical_alerts: critical,
        monthly_recap: {
            ...prev.monthly_recap,
            current_month_total: total, 
            by_severity: { high: critical, medium: 0, low: total - critical }
        }
      }));
    });

    // --- 1B. FIREBASE LISTENER UNTUK 5 EVENT TERBARU (BEBAS TANGGAL) ---
    const qLatestEvents = query(
      collection(db, 'cctv_events'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribeEvents = onSnapshot(qLatestEvents, (snapshot) => {
      const latestEvents: CctvEvent[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        latestEvents.push({
          id: doc.id,
          camera_name: data.camera_name || 'Unknown',
          event_type: data.category || data.event_type || 'Aktivitas',
          severity: data.severity?.toLowerCase() || 'low',
          is_reviewed: data.status === 'reviewed' || data.is_reviewed || false,
          created_at: data.timestamp?.toDate()?.toISOString() || new Date().toISOString()
        });
      });

      setEvents(latestEvents);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Events Listener Error:", error);
      setLoading(false);
    });

    // --- 2. FIREBASE REAL-TIME LISTENER UNTUK KAMERA ---
    const qCameras = query(collection(db, 'cameras'));
    const unsubscribeCameras = onSnapshot(qCameras, (snapshot) => {
      let activeCount = 0;
      const cams: Camera[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        cams.push({ id: doc.id, ...data } as Camera);
        if (data.status === 'active') activeCount++;
      });
      setStats(prev => ({ ...prev, active_cameras: activeCount }));
      setCameras(cams);
    }, (error) => {
      console.error("Firebase Cameras Listener Error:", error);
    });

    return () => {
      unsubscribeStats();
      unsubscribeEvents();
      unsubscribeCameras();
    };
  }, []);

  if (loading) return <div className="p-8 text-slate-400">Memuat Data Sistem...</div>;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Halaman */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Dashboard Monitoring</h1>
          <p className="text-slate-400 text-sm">Real-time update from Firebase Firestore</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span> System Online
        </div>
      </div>

      {/* 1. KARTU STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0f172a] p-5 sm:p-6 rounded-xl shadow-lg border border-slate-800/50 ring-1 ring-white/5 flex justify-between items-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-medium">Total Kejadian Hari Ini</p>
            <h3 className="text-4xl font-bold text-slate-100 mt-1">{stats.total_today}</h3>
          </div>
          <div className="p-3 bg-[#1e293b] text-emerald-400 rounded-lg border border-slate-700/50 shadow-inner relative z-10"><Activity size={24} /></div>
        </div>
        
        <div className="bg-[#0f172a] p-5 sm:p-6 rounded-xl shadow-lg border border-slate-800/50 ring-1 ring-white/5 flex justify-between items-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-medium">Kamera Terhubung</p>
            <h3 className="text-4xl font-bold text-slate-100 mt-1">{stats.active_cameras}</h3>
          </div>
          <div className="p-3 bg-[#1e293b] text-emerald-400 rounded-lg border border-slate-700/50 shadow-inner relative z-10"><Video size={24} /></div>
        </div>

        <div className="bg-[#0f172a] p-5 sm:p-6 rounded-xl shadow-lg border border-rose-500/20 ring-1 ring-rose-500/10 flex justify-between items-center relative overflow-hidden">
          {stats.critical_alerts > 0 && <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full -mr-4 -mt-4 blur-xl"></div>}
          <div className="relative z-10">
            <p className="text-rose-400 font-medium text-sm">Bahaya Terdeteksi</p>
            <h3 className="text-4xl font-bold text-rose-500 mt-1 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">{stats.critical_alerts}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg border border-rose-500/20 animate-pulse relative z-10 shadow-[0_0_15px_rgba(244,63,94,0.3)]"><AlertTriangle size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. WEEKLY TREND */}
        <div className="lg:col-span-2 bg-[#0f172a] p-4 sm:p-6 rounded-xl shadow-lg border border-slate-800/50 ring-1 ring-white/5 min-w-0">
            <h3 className="font-bold text-slate-100 mb-6 text-lg tracking-tight truncate">Tren Aktivitas Sepekan</h3>
            <div className="h-[320px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.weekly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} dx={-10} />
                        <Tooltip 
                            cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
                            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)', color: '#f1f5f9' }} 
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line type="monotone" dataKey="low" name="Rendah (Low)" stroke="#10b981" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="medium" name="Sedang (Mid)" stroke="#f59e0b" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="high" name="Bahaya (High)" stroke="#f43f5e" strokeWidth={3} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 3. MONTHLY RECAP */}
        <div className="bg-[#0f172a] p-4 sm:p-6 rounded-xl shadow-lg border border-slate-800/50 ring-1 ring-white/5 flex flex-col">
          <h3 className="font-bold text-slate-100 mb-2 text-lg tracking-tight">Rekap Bulan Ini</h3>
          <div className="flex-1 flex flex-col justify-center items-center text-center mt-4 mb-4">
              <div className="w-32 h-32 rounded-full border-[6px] border-slate-800 flex items-center justify-center mb-4 relative drop-shadow-sm">
                  <div className="absolute inset-0 rounded-full border-[6px] border-emerald-500 border-t-transparent border-l-transparent rotate-45"></div>
                  <div className="flex flex-col">
                      <span className="text-3xl font-bold text-slate-100">{stats.monthly_recap?.current_month_total || 0}</span>
                      <span className="text-xs text-slate-400 font-bold tracking-wider">EVENT</span>
                  </div>
              </div>
          </div>
          
          <div className="space-y-3 mt-auto border-t border-slate-800/50 pt-4">
              <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-[#1e293b] transition">
                  <span className="flex items-center gap-2 text-slate-300 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Bahaya (High)</span>
                  <span className="font-bold text-slate-100 bg-[#1e293b] border border-slate-700 px-3 py-0.5 rounded-md">{stats.monthly_recap?.by_severity?.high || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-[#1e293b] transition">
                  <span className="flex items-center gap-2 text-slate-300 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Menengah (Mid)</span>
                  <span className="font-bold text-slate-100 bg-[#1e293b] border border-slate-700 px-3 py-0.5 rounded-md">{stats.monthly_recap?.by_severity?.medium || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-[#1e293b] transition">
                  <span className="flex items-center gap-2 text-slate-300 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Rendah (Low)</span>
                  <span className="font-bold text-slate-100 bg-[#1e293b] border border-slate-700 px-3 py-0.5 rounded-md">{stats.monthly_recap?.by_severity?.low || 0}</span>
              </div>
          </div>
        </div>
      </div>

      {/* 4. TABEL RIWAYAT KEJADIAN TERBARU */}
      <div className="bg-[#0f172a] rounded-xl shadow-lg border border-slate-800/50 ring-1 ring-white/5 overflow-hidden">
        <div className="p-4 border-b border-slate-800/50 flex justify-between items-center bg-[#1e293b]/30">
          <h3 className="font-bold text-slate-100 tracking-tight">Riwayat Deteksi Terkini</h3>
          <button
            onClick={() => navigate('/laporan')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition"
          >
            Lihat Semua
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1e293b]/50 text-slate-400 font-medium border-b border-slate-800/50">
              <tr>
                <th className="px-6 py-3">Waktu</th>
                <th className="px-6 py-3">Lokasi Kamera</th>
                <th className="px-6 py-3">Jenis Deteksi</th>
                <th className="px-6 py-3">Tingkat Bahaya</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {events.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => navigate('/laporan', { state: { selectedEventId: event.id } })}
                  className="hover:bg-[#1e293b] transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 flex items-center gap-2 text-slate-300">
                    <Clock size={16} className="text-slate-500" />
                    {new Date(event.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-500" />
                      <span className="font-medium text-slate-200">{event.camera_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700 font-medium">
                      {event.event_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {event.severity === 'high' ? (
                      <span className="text-rose-400 bg-rose-500/10 px-2 py-1 rounded text-xs font-bold border border-rose-500/20">TINGGI</span>
                    ) : event.severity === 'medium' ? (
                      <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded text-xs font-bold border border-amber-500/20">MENENGAH</span>
                    ) : (
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold border border-emerald-500/20">RENDAH</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {event.is_reviewed ? (
                      <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                        <CheckCircle size={14} /> Selesai
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-medium animate-pulse">
                        <AlertTriangle size={14} /> Perlu Cek
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500">Belum ada data kejadian hari ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;