import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Video, FileText, Settings, Bell, Menu, LogOut, X, Check, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- 1. LOGIKA JAM REALTIME ---
  const [dateState, setDateState] = useState(new Date());

  useEffect(() => {
    // Update jam setiap 1 detik (1000ms)
    const timer = setInterval(() => setDateState(new Date()), 1000);
    // Bersihkan timer saat komponen ditutup agar tidak berat
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      await logout();
      navigate('/login');
    }
  };

  // Fetch unreviewed events for notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/cctv-events');
        const events = response.data.data;
        const unreviewed = events.filter((e: any) => !e.is_reviewed).slice(0, 10);
        setNotifications(unreviewed);
        setUnreadCount(unreviewed.length);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path
      ? "bg-blue-600 text-white shadow-md"
      : "text-slate-400 hover:bg-slate-800 hover:text-white";
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* --- SIDEBAR KIRI --- */}
      <aside className="w-64 bg-slate-900 text-white fixed h-full shadow-xl z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight">
            <Shield className="text-blue-500" size={24} /> SchoolGuard
          </h2>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Main Menu</div>

          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/')}`}>
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link to="/live" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/live')}`}>
            <Video size={20} />
            <span className="font-medium">Live Monitoring</span>
          </Link>

          <Link to="/laporan" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/laporan')}`}>
            <FileText size={20} />
            <span className="font-medium">Laporan</span>
          </Link>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2 px-2">System</div>

          <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/settings')}`}>
            <Settings size={20} />
            <span className="font-medium">Pengaturan</span>
          </Link>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">
              {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{user?.name || 'Admin Petugas'}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
              </p>
            </div>
          </div>
          {/* Keluar */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium border border-red-200"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* --- KONTEN UTAMA (KANAN) --- */}
      <div className="flex-1 md:ml-64 transition-all flex flex-col">

        {/* HEADER ATAS (TOPBAR) */}
        <header className="bg-white shadow-sm border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20">

          {/* Judul Halaman (Kiri) */}
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500"><Menu /></button>
            <h1 className="text-lg font-bold text-slate-700 hidden sm:block">
              Sistem Keamanan Sekolah
            </h1>
          </div>

          {/* --- 2. TAMPILAN JAM & TANGGAL (Tengah/Kanan) --- */}
          <div className="flex items-center gap-6">

            {/* Bagian Jam Realtime */}
            <div className="text-right hidden sm:block">
              <p className="text-lg font-bold text-slate-800 leading-none font-mono">
                {dateState.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {dateState.toLocaleDateString('en-US', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Garis Pemisah */}
            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

            {/* Notifikasi & Profil */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Bell size={18} className="text-blue-600" />
                        Notifikasi ({unreadCount})
                      </h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1 hover:bg-slate-200 rounded-full transition"
                      >
                        <X size={18} className="text-slate-500" />
                      </button>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          <Check size={48} className="mx-auto mb-2 text-green-500" />
                          <p className="text-sm">Semua notifikasi sudah dibaca</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-4 border-b border-slate-100 hover:bg-blue-50 transition cursor-pointer group"
                          >
                            <div className="flex gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.severity === 'high' ? 'bg-red-500' :
                                notif.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800 mb-1">
                                  {notif.event_type.replace(/_/g, ' ').toUpperCase()}
                                </p>
                                <p className="text-xs text-slate-600 mb-2">
                                  {notif.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span>📹 CAM_01_Kelas_9.1</span>
                                  <span>•</span>
                                  <span>{new Date(notif.created_at).toLocaleString('id-ID')}</span>
                                </div>
                              </div>
                              <span className={`text-xs font-bold px-2 py-1 rounded self-start ${notif.severity === 'high' ? 'bg-red-100 text-red-700' :
                                notif.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                {notif.severity.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="p-3 bg-slate-50 border-t border-slate-200">
                        <Link
                          to="/laporan"
                          onClick={() => setShowNotifications(false)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium block text-center"
                        >
                          Lihat Semua di Laporan →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </header>

        {/* Konten Berubah Dinamis Di Sini */}
        <main className="flex-1">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default MainLayout;