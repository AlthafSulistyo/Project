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

  // Modal for Evidence/Screenshot
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Download Evidence/Screenshot Handler
  const handleDownloadEvidence = async (event: any) => {
    try {
      const imageUrl = `http://${window.location.hostname}:8000/${event.snapshot_path}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CCTV_Evidence_${event.id}_${new Date(event.created_at).toISOString().replace(/:/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download evidence:', error);
      alert('Gagal mendownload bukti. Silakan coba lagi.');
    }
  };

  // Fetch unreviewed events for notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://${window.location.hostname}:8000/api/cctv-events`);
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
      ? "bg-emerald-600 text-white shadow-md"
      : "text-slate-400 hover:bg-slate-800 hover:text-white";
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans">

      {/* --- OVELAY MOBILE --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR KIRI --- */}
      <aside className={`w-64 bg-[#0f172a] text-white fixed h-full shadow-2xl z-40 flex flex-col border-r border-slate-800/50 transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800/50 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain bg-slate-800 rounded-full p-0.5" /> SchoolGuard
          </h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Main Menu</div>

          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/')}`}>
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link to="/live" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/live')}`}>
            <Video size={20} />
            <span className="font-medium">Live Monitoring</span>
          </Link>

          <Link to="/laporan" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/laporan')}`}>
            <FileText size={20} />
            <span className="font-medium">Laporan</span>
          </Link>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2 px-2">System</div>

          <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive('/settings')}`}>
            <Settings size={20} />
            <span className="font-medium">Pengaturan</span>
          </Link>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <div className="bg-[#1e293b] rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
              {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{user?.name || 'Admin Petugas'}</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>
          {/* Keluar */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition font-medium border border-rose-500/20"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* --- KONTEN UTAMA (KANAN) --- */}
      <div className="flex-1 md:ml-64 transition-all flex flex-col">

        {/* HEADER ATAS (TOPBAR) */}
        <header className="bg-[#0f172a]/90 backdrop-blur-md shadow-sm border-b border-slate-800 h-16 flex items-center justify-between px-6 sticky top-0 z-20">

          {/* Judul Halaman (Kiri) */}
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-slate-400 hover:text-slate-200 transition">
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-slate-100 hidden sm:block tracking-tight">
              Sistem Keamanan Sekolah
            </h1>
          </div>

          {/* --- 2. TAMPILAN JAM & TANGGAL (Tengah/Kanan) --- */}
          <div className="flex items-center gap-6">

            {/* Bagian Jam Realtime */}
            <div className="text-right hidden sm:block">
              <p className="text-lg font-bold text-slate-100 leading-none font-mono">
                {dateState.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {dateState.toLocaleDateString('en-US', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Garis Pemisah */}
            <div className="h-8 w-[1px] bg-slate-800 hidden sm:block"></div>

            {/* Notifikasi & Profil */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-full relative transition"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-rose-500/50">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-[#0f172a] rounded-xl shadow-2xl border border-slate-800 z-50 overflow-hidden ring-1 ring-white/5">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#1e293b]/50">
                      <h3 className="font-bold text-slate-100 flex items-center gap-2">
                        <Bell size={18} className="text-emerald-500" />
                        Notifikasi ({unreadCount})
                      </h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1 hover:bg-slate-800 rounded-full transition"
                      >
                        <X size={18} className="text-slate-400 hover:text-slate-200" />
                      </button>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          <Check size={48} className="mx-auto mb-2 text-emerald-500/50" />
                          <p className="text-sm">Semua notifikasi sudah dibaca</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setSelectedEvent(notif);
                              setShowEvidenceModal(true);
                              setShowNotifications(false);
                            }}
                            className="p-4 border-b border-slate-800/50 hover:bg-emerald-500/10 transition cursor-pointer group"
                          >
                            <div className="flex gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)] ${notif.severity === 'high' ? 'bg-rose-500 shadow-rose-500/50' :
                                notif.severity === 'medium' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-500 shadow-emerald-500/50'
                                }`}></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-200 mb-1">
                                  {notif.event_type.replace(/_/g, ' ').toUpperCase()}
                                </p>
                                <p className="text-xs text-slate-400 mb-2">
                                  {notif.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span>📹 {notif.camera_name}</span>
                                  <span>•</span>
                                  <span>{new Date(notif.created_at).toLocaleString('id-ID')}</span>
                                  <span>•</span>
                                  <span className="text-emerald-400 group-hover:underline font-medium">📸 Lihat Bukti</span>
                                </div>
                              </div>
                              <span className={`text-xs font-bold px-2 py-1 rounded self-start border ${notif.severity === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                notif.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
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
                      <div className="p-3 bg-[#0f172a] border-t border-slate-800">
                        <Link
                          to="/laporan"
                          onClick={() => setShowNotifications(false)}
                          className="text-sm text-emerald-400 hover:text-emerald-300 font-medium block text-center"
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

      {/* Evidence Modal */}
      {showEvidenceModal && selectedEvent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ring-1 ring-white/10">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-900/20 to-[#0f172a]">
              <div>
                <h2 className="text-xl font-bold text-slate-100 mb-1">Bukti Kejadian CCTV</h2>
                <p className="text-sm text-slate-400">
                  ID Kejadian: #{selectedEvent.id} • {new Date(selectedEvent.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="p-2 hover:bg-slate-800 rounded-full transition"
              >
                <X size={24} className="text-slate-400 hover:text-slate-200" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Screenshot/Evidence */}
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    📸 Screenshot CCTV
                  </h3>
                  <div className="bg-slate-950 rounded-lg overflow-hidden aspect-video relative border border-slate-800">
                    {/* Actual CCTV Screenshot */}
                    <img
                      src={`http://${window.location.hostname}:8000/${selectedEvent.snapshot_path}`}
                      alt="CCTV Evidence"
                      className="w-full h-full object-cover opacity-90"
                    />
                    {/* Timestamp Overlay */}
                    <div className="absolute top-3 left-3 bg-slate-950/80 px-3 py-1 rounded text-white text-xs font-mono border border-slate-800">
                      {new Date(selectedEvent.created_at).toLocaleString('id-ID')}
                    </div>
                    {/* Camera Name Overlay */}
                    <div className="absolute top-3 right-3 bg-rose-500/90 px-3 py-1 rounded text-white text-xs font-bold flex items-center gap-1 shadow-lg shadow-rose-500/20 border border-rose-500/50">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      REC
                    </div>
                    {/* Severity Badge */}
                    <div className={`absolute bottom-3 left-3 px-3 py-1 rounded font-bold text-xs shadow-lg border ${selectedEvent.severity === 'high' ? 'bg-rose-500 text-white border-rose-400' :
                      selectedEvent.severity === 'medium' ? 'bg-amber-500 text-slate-950 border-amber-400' :
                        'bg-emerald-500 text-white border-emerald-400'
                      }`}>
                      {selectedEvent.severity.toUpperCase()}
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownloadEvidence(selectedEvent)}
                    className="mt-3 w-full py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition font-medium text-sm"
                  >
                    📥 Download Bukti
                  </button>
                </div>

                {/* Right: Event Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-300 mb-3">Detail Kejadian</h3>
                    <div className="space-y-3 bg-[#1e293b] p-4 rounded-lg border border-slate-800/50">
                      <div>
                        <label className="text-xs text-slate-500 font-medium">Jenis Kejadian</label>
                        <p className="text-sm font-bold text-slate-200">
                          {selectedEvent.event_type.replace(/_/g, ' ').toUpperCase()}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs text-slate-500 font-medium">Deskripsi</label>
                        <p className="text-sm text-slate-400">{selectedEvent.description}</p>
                      </div>

                      <div>
                        <label className="text-xs text-slate-500 font-medium">Lokasi Kamera</label>
                        <p className="text-sm font-mono text-slate-300">
                          📹 {selectedEvent.camera_name}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-500 font-medium">Tingkat Bahaya</label>
                          <span className={`inline-block mt-1 px-3 py-1 rounded font-bold text-xs border ${selectedEvent.severity === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            selectedEvent.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                            {selectedEvent.severity.toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <label className="text-xs text-slate-500 font-medium">Status Review</label>
                          <span className={`inline-block mt-1 px-3 py-1 rounded font-bold text-xs border ${selectedEvent.is_reviewed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            }`}>
                            {selectedEvent.is_reviewed ? '✓ SELESAI' : '⏳ MENUNGGU'}
                          </span>
                        </div>
                      </div>

                      {selectedEvent.is_anomaly && (
                        <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg mt-2">
                          <p className="text-xs font-bold text-rose-400">⚠️ ANOMALI TERDETEKSI</p>
                          <p className="text-xs text-rose-500/80 mt-1">Kejadian ini ditandai sebagai anomali oleh sistem AI</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowEvidenceModal(false);
                        navigate('/laporan');
                      }}
                      className="flex-1 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition font-medium text-sm"
                    >
                      Lihat di Laporan
                    </button>
                    <button className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition font-medium text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                      Tandai Selesai
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;