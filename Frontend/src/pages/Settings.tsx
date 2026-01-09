import { useState } from 'react';
import { User, Bell, Shield, Video, Save, Check } from 'lucide-react';

type TabType = 'profil' | 'notifikasi' | 'keamanan' | 'kamera';

export default function Settings() {
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

  const tabs = [
    { id: 'profil' as TabType, icon: User, label: 'Profil' },
    { id: 'notifikasi' as TabType, icon: Bell, label: 'Notifikasi' },
    { id: 'keamanan' as TabType, icon: Shield, label: 'Keamanan' },
    { id: 'kamera' as TabType, icon: Video, label: 'Kamera' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Toast Success */}
      {showSaveToast && (
        <div className="fixed top-20 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-in-right">
          <Check size={20} />
          <span className="font-medium">Perubahan berhasil disimpan!</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h1>
        <p className="text-slate-500 text-sm">Kelola konfigurasi akun dan sistem keamanan SchoolGuard.</p>
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
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Informasi Profil</h3>
                <p className="text-xs text-slate-500">Update informasi dasar akun administrator Anda.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Nama Lengkap</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Jabatan</label>
                  <input
                    type="text"
                    value={profileData.position}
                    onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Notifikasi */}
          {activeTab === 'notifikasi' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Preferensi Notifikasi</h3>
                <p className="text-xs text-slate-500">Atur kapan Anda ingin menerima peringatan bahaya.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Email Alerts</p>
                    <p className="text-xs text-slate-500">Kirim email setiap kali ada deteksi High Severity.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.emailAlerts}
                    onChange={(e) => setNotifSettings({ ...notifSettings, emailAlerts: e.target.checked })}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Desktop Sound</p>
                    <p className="text-xs text-slate-500">Bunyikan alarm pada dashboard saat ada kejadian.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.desktopSound}
                    onChange={(e) => setNotifSettings({ ...notifSettings, desktopSound: e.target.checked })}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-bold text-slate-800">High Severity Only</p>
                    <p className="text-xs text-slate-500">Hanya notifikasi untuk kejadian dengan tingkat bahaya tinggi.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.highSeverityOnly}
                    onChange={(e) => setNotifSettings({ ...notifSettings, highSeverityOnly: e.target.checked })}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Keamanan */}
          {activeTab === 'keamanan' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Keamanan Akun</h3>
                <p className="text-xs text-slate-500">Kelola kata sandi dan keamanan akun Anda.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Password Lama</label>
                  <input
                    type="password"
                    placeholder="Masukkan password lama"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Password Baru</label>
                  <input
                    type="password"
                    placeholder="Masukkan password baru"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    placeholder="Konfirmasi password baru"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs text-amber-800">
                    <strong>Perhatian:</strong> Setelah mengubah password, Anda akan diminta login ulang.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Kamera */}
          {activeTab === 'kamera' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Pengaturan Kamera</h3>
                <p className="text-xs text-slate-500">Konfigurasi kamera CCTV dan streaming.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Kualitas Stream</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>4K Ultra HD (3840x2160)</option>
                    <option>Full HD (1920x1080)</option>
                    <option>HD (1280x720)</option>
                    <option>SD (640x480)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Frame Rate (FPS)</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>60 FPS</option>
                    <option>30 FPS</option>
                    <option>24 FPS</option>
                    <option>15 FPS</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Auto Recording</p>
                    <p className="text-xs text-slate-500">Rekam otomatis saat deteksi aktivitas.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Night Vision</p>
                    <p className="text-xs text-slate-500">Aktifkan mode night vision otomatis.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition shadow-lg shadow-blue-200 active:scale-95"
            >
              <Save size={18} /> Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}