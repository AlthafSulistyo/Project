import { useState } from 'react';
import { User, Bell, Shield, Video, Save, Check, List, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CameraManagement from '../components/settings/CameraManagement';
import UserManagement from '../components/settings/UserManagement';
import EventSeverityManagement from '../components/settings/EventSeverityManagement';

type TabType = 'profil' | 'notifikasi' | 'keamanan' | 'kamera' | 'kategori-deteksi' | 'daftar-kamera' | 'manajemen-user';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('profil');
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: 'Admin Petugas',
    email: 'admin@schoolguard.com',
    position: 'Kepala Keamanan IT'
  });

  const [notifSettings, setNotifSettings] = useState({
    emailAlerts: true,
    desktopSound: true,
    highSeverityOnly: false
  });

  const handleSave = () => {
    // Simulate save to backend
    console.log('Saving settings:', { profileData, notifSettings, activeTab });
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  // All tabs
  const allTabs = [
    { id: 'profil' as TabType, icon: User, label: 'Profil', adminOnly: false },
    { id: 'notifikasi' as TabType, icon: Bell, label: 'Notifikasi', adminOnly: false },
    { id: 'keamanan' as TabType, icon: Shield, label: 'Keamanan', adminOnly: false },
    { id: 'kategori-deteksi' as TabType, icon: AlertTriangle, label: 'Kategori Deteksi', adminOnly: true },
    { id: 'kamera' as TabType, icon: Video, label: 'Kamera', adminOnly: false },
    { id: 'daftar-kamera' as TabType, icon: List, label: 'Daftar Kamera', adminOnly: true },
    { id: 'manajemen-user' as TabType, icon: Users, label: 'Manajemen User', adminOnly: true }
  ];

  // Filter tabs based on user role
  const tabs = allTabs.filter(tab => !tab.adminOnly || user?.role === 'admin');

  return (
    <div className="p-6 space-y-6">{/* Removed max-w-4xl for full width */}
      {/* Toast Success */}
      {showSaveToast && (
        <div className="fixed top-20 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-in-right">
          <Check size={20} />
          <span className="font-medium">Perubahan berhasil disimpan!</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Pengaturan Sistem</h1>
        <p className="text-slate-400 text-sm">Kelola konfigurasi akun dan sistem keamanan SchoolGuard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-sm transition ${activeTab === tab.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                  : 'text-slate-400 hover:bg-[#1e293b] hover:text-slate-200 border border-transparent'
                  }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* Tab: Profil */}
          {activeTab === 'profil' && (
            <div className="bg-[#0f172a] rounded-xl border border-slate-800/50 shadow-lg overflow-hidden ring-1 ring-white/5">
              <div className="p-6 border-b border-slate-800/50 bg-[#1e293b]/30">
                <h3 className="font-bold text-slate-100">Informasi Profil</h3>
                <p className="text-xs text-slate-400">Update informasi dasar akun administrator Anda.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Nama Lengkap</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Jabatan</label>
                  <input
                    type="text"
                    value={profileData.position}
                    onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Notifikasi */}
          {activeTab === 'notifikasi' && (
            <div className="bg-[#0f172a] rounded-xl border border-slate-800/50 shadow-lg overflow-hidden ring-1 ring-white/5">
              <div className="p-6 border-b border-slate-800/50 bg-[#1e293b]/30">
                <h3 className="font-bold text-slate-100">Preferensi Notifikasi</h3>
                <p className="text-xs text-slate-400">Atur kapan Anda ingin menerima peringatan bahaya.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#1e293b] border border-slate-700/50 rounded-lg shadow-inner">
                  <div>
                    <p className="text-sm font-bold text-slate-200">Email Alerts</p>
                    <p className="text-xs text-slate-400">Kirim email setiap kali ada deteksi High Severity.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.emailAlerts}
                    onChange={(e) => setNotifSettings({ ...notifSettings, emailAlerts: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-[#1e293b] border border-slate-700/50 rounded-lg shadow-inner">
                  <div>
                    <p className="text-sm font-bold text-slate-200">Desktop Sound</p>
                    <p className="text-xs text-slate-400">Bunyikan alarm pada dashboard saat ada kejadian.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.desktopSound}
                    onChange={(e) => setNotifSettings({ ...notifSettings, desktopSound: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-[#1e293b] border border-slate-700/50 rounded-lg shadow-inner">
                  <div>
                    <p className="text-sm font-bold text-slate-200">High Severity Only</p>
                    <p className="text-xs text-slate-400">Hanya notifikasi untuk kejadian dengan tingkat bahaya tinggi.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.highSeverityOnly}
                    onChange={(e) => setNotifSettings({ ...notifSettings, highSeverityOnly: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Keamanan */}
          {activeTab === 'keamanan' && (
            <div className="bg-[#0f172a] rounded-xl border border-slate-800/50 shadow-lg overflow-hidden ring-1 ring-white/5">
              <div className="p-6 border-b border-slate-800/50 bg-[#1e293b]/30">
                <h3 className="font-bold text-slate-100">Keamanan Akun</h3>
                <p className="text-xs text-slate-400">Kelola kata sandi dan keamanan akun Anda.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Password Lama</label>
                  <input
                    type="password"
                    placeholder="Masukkan password lama"
                    className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Password Baru</label>
                  <input
                    type="password"
                    placeholder="Masukkan password baru"
                    className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    placeholder="Konfirmasi password baru"
                    className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <p className="text-xs text-amber-400">
                    <strong className="text-amber-500">Perhatian:</strong> Setelah mengubah password, Anda akan diminta login ulang.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Kamera */}
          {activeTab === 'kamera' && (
            <div className="bg-[#0f172a] rounded-xl border border-slate-800/50 shadow-lg overflow-hidden ring-1 ring-white/5">
              <div className="p-6 border-b border-slate-800/50 bg-[#1e293b]/30">
                <h3 className="font-bold text-slate-100">Pengaturan Kamera</h3>
                <p className="text-xs text-slate-400">Konfigurasi kamera CCTV dan streaming.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Kualitas Stream</label>
                  <select className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option>4K Ultra HD (3840x2160)</option>
                    <option>Full HD (1920x1080)</option>
                    <option>HD (1280x720)</option>
                    <option>SD (640x480)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Frame Rate (FPS)</label>
                  <select className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option>60 FPS</option>
                    <option>30 FPS</option>
                    <option>24 FPS</option>
                    <option>15 FPS</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#1e293b] border border-slate-700/50 rounded-lg shadow-inner">
                  <div>
                    <p className="text-sm font-bold text-slate-200">Auto Recording</p>
                    <p className="text-xs text-slate-400">Rekam otomatis saat deteksi aktivitas.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-600 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between p-4 bg-[#1e293b] border border-slate-700/50 rounded-lg shadow-inner">
                  <div>
                    <p className="text-sm font-bold text-slate-200">Night Vision</p>
                    <p className="text-xs text-slate-400">Aktifkan mode night vision otomatis.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-600 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Kategori Deteksi */}
          {activeTab === 'kategori-deteksi' && (
            <div className="bg-[#0f172a] rounded-xl border border-slate-800/50 shadow-lg overflow-hidden p-6 ring-1 ring-white/5">
              <EventSeverityManagement />
            </div>
          )}

          {/* Tab: Daftar Kamera */}
          {activeTab === 'daftar-kamera' && (
            <div className="bg-[#0f172a] rounded-xl border border-slate-800/50 shadow-lg overflow-hidden p-6 ring-1 ring-white/5">
              <CameraManagement />
            </div>
          )}

          {/* Tab: Manajemen User */}
          {activeTab === 'manajemen-user' && (
            <div className="bg-[#0f172a] rounded-xl border border-slate-800/50 shadow-lg overflow-hidden p-6 ring-1 ring-white/5">
              <UserManagement />
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-bold transition shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Save size={18} /> Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}