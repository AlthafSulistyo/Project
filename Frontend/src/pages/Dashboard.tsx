import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Video, Activity, Clock, MapPin, CheckCircle } from 'lucide-react';

// --- Interface Data ---
interface DashboardStats {
  total_today: number;
  critical_alerts: number;
  active_cameras: number;
}

interface CctvEvent {
  id: number;
  camera_name: string;
  event_type: string;
  severity: 'high' | 'medium' | 'low';
  is_reviewed: boolean;
  created_at: string;
}

// Data dummy grafik (bisa diganti API jika nanti ada)
const dataGrafik = [
  { jam: '08:00', event: 12 }, { jam: '10:00', event: 45 },
  { jam: '12:00', event: 80 }, { jam: '14:00', event: 50 },
  { jam: '16:00', event: 20 }, { jam: '18:00', event: 65 },
  { jam: '20:00', event: 30 },
];

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({ total_today: 0, critical_alerts: 0, active_cameras: 0 });
  const [events, setEvents] = useState<CctvEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Ref untuk menyimpan ID notifikasi terakhir agar tidak spam bunyi terus
  const lastNotifiedId = useRef<number | null>(null);

  const fetchData = async () => {
    try {
      // Kita panggil 2 API sekaligus: Statistik & Daftar Kejadian
      const [resStats, resEvents] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/cctv-stats'),
        axios.get('http://127.0.0.1:8000/api/cctv-events')
      ]);

      // 1. Update Statistik
      const statData = resStats.data.summary;
      const highAlerts = statData.by_severity.find((s: any) => s.severity === 'high')?.total || 0;
      setStats({
        total_today: statData.total_today,
        critical_alerts: highAlerts,
        active_cameras: statData.active_cameras || 0
      });

      // 2. Update Tabel (Ambil 5 data terbaru saja)
      const eventsData = resEvents.data.data;
      setEvents(eventsData.slice(0, 5));

      // --- LOGIKA NOTIFIKASI BARU (POP-UP) ---
      const latestEvent = eventsData[0];

      // Cek apakah ada data, severity HIGH, belum direview, DAN belum dinotifikasi sebelumnya
      if (latestEvent && latestEvent.severity === 'high' && !latestEvent.is_reviewed) {

        // Cek ID agar tidak notif berulang untuk kejadian yang sama
        if (lastNotifiedId.current !== latestEvent.id) {

          // Memunculkan notifikasi browser
          if (!("Notification" in window)) {
            console.log("Browser tidak mendukung notifikasi");
          } else if (Notification.permission === "granted") {
            new Notification("⚠️ BAHAYA TERDETEKSI!", {
              body: `Terdeteksi ${latestEvent.event_type} di ${latestEvent.camera_name}`,
              icon: "/vite.svg", // Pastikan file icon ada, atau bisa dihapus baris ini
              requireInteraction: true // Notifikasi tidak hilang otomatis sampai diklik
            });

            // Simpan ID agar tidak bunyi lagi
            lastNotifiedId.current = latestEvent.id;

          } else if (Notification.permission !== "denied") {
            Notification.requestPermission();
          }
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Gagal koneksi ke Backend:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Minta izin notifikasi saat pertama kali buka dashboard
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update setiap 5 detik
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Memuat Data Sistem...</div>;

  return (
    <div className="space-y-6 p-6">

      {/* Header Halaman */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Monitoring</h1>
          <p className="text-slate-500 text-sm">Real-time update from CCTV Server</p>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 bg-green-600 rounded-full"></span> System Online
        </div>
      </div>

      {/* 1. KARTU STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div>
            <p className="text-slate-500 text-sm">Total Kejadian Hari Ini</p>
            <h3 className="text-4xl font-bold text-slate-800 mt-1">{stats.total_today}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Activity size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div>
            <p className="text-slate-500 text-sm">Kamera Terhubung</p>
            <h3 className="text-4xl font-bold text-slate-800 mt-1">{stats.active_cameras}/10</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Video size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex justify-between items-center relative overflow-hidden">
          {stats.critical_alerts > 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-full -mr-4 -mt-4"></div>}
          <div>
            <p className="text-red-500 font-medium text-sm">Bahaya Terdeteksi</p>
            <h3 className="text-4xl font-bold text-red-600 mt-1">{stats.critical_alerts}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg animate-pulse"><AlertTriangle size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. LIVE FEED (Kiri) */}
        <div className="lg:col-span-2 bg-black rounded-xl overflow-hidden shadow-lg relative min-h-[350px]">
          {/* YouTube Video Embed */}
          <iframe
            className="w-full h-full min-h-[350px] lg:min-h-[450px]"
            src="https://www.youtube.com/embed/nsFgBrrt-tQ?autoplay=1&mute=1&loop=1&playlist=nsFgBrrt-tQ&controls=0&modestbranding=1&rel=0"
            title="CCTV Camera Feed"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>

          {/* LIVE Badge Overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="text-white text-xs font-bold tracking-wider bg-black/50 px-2 py-0.5 rounded">LIVE</span>
          </div>
        </div>

        {/* 3. GRAFIK (Kanan) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4 text-sm">Tren Aktivitas (24 Jam)</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataGrafik}>
                <defs>
                  <linearGradient id="colorEvent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="jam" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="event" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEvent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. TABEL RIWAYAT KEJADIAN TERBARU */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Riwayat Deteksi Terkini</h3>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Waktu</th>
                <th className="px-6 py-3">Lokasi Kamera</th>
                <th className="px-6 py-3">Jenis Deteksi</th>
                <th className="px-6 py-3">Tingkat Bahaya</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-2 text-slate-600">
                    <Clock size={16} className="text-slate-400" />
                    {new Date(event.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      <span className="font-medium text-slate-700">{event.camera_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200 font-medium">
                      {event.event_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {event.severity === 'high' ? (
                      <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold border border-red-100">TINGGI</span>
                    ) : event.severity === 'medium' ? (
                      <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold border border-yellow-100">MENENGAH</span>
                    ) : (
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-100">RENDAH</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {event.is_reviewed ? (
                      <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle size={14} /> Selesai
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600 text-xs font-medium animate-pulse">
                        <AlertTriangle size={14} /> Perlu Cek
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">Belum ada data kejadian hari ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;