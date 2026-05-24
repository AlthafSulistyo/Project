import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Save, AlertTriangle, Activity, MapPin, Eye, CheckCircle2 } from 'lucide-react';

interface SeverityMapping {
  [key: string]: 'low' | 'medium' | 'high';
}

const EVENT_TYPES = [
  { key: 'motion_detected', label: 'Motion Detected (VMD)', icon: Activity },
  { key: 'line_crossed', label: 'Line Crossing (Lewati Garis)', icon: MapPin },
  { key: 'intrusion', label: 'Intrusion (Penyusupan)', icon: AlertTriangle },
  { key: 'loitering', label: 'Loitering (Mondar-mandir)', icon: Eye },
  { key: 'parking', label: 'Illegal Parking (Parkir Liar)', icon: AlertTriangle },
];

export default function EventSeverityManagement() {
  const [mapping, setMapping] = useState<SeverityMapping>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchMapping();
  }, []);

  const fetchMapping = async () => {
    try {
      const docRef = doc(db, 'settings', 'severity_mapping');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMapping(docSnap.data().mapping || {});
      } else {
        // Fallback default
        setMapping({
          motion_detected: 'medium',
          line_crossed: 'medium',
          intrusion: 'high',
          loitering: 'low',
          parking: 'medium'
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch severity mapping:', error);
      setLoading(false);
    }
  };

  const handleSeverityChange = (key: string, newSeverity: 'low' | 'medium' | 'high') => {
    setMapping((prev) => ({
      ...prev,
      [key]: newSeverity
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', 'severity_mapping');
      await setDoc(docRef, { mapping }, { merge: true });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save severity mapping:', error);
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Memuat pengaturan...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800/50 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Kategori Tingkat Bahaya (Severity)</h2>
          <p className="text-sm text-slate-400 mt-1">
            Atur tingkat bahaya untuk setiap jenis kejadian CCTV. Hal ini akan mempengaruhi prioritas notifikasi dan pelaporan.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-bold transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
          Simpan Pemetaan
        </button>
      </div>

      {success && (
        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={20} className="text-emerald-500" />
          <span className="font-medium text-sm">Pengaturan pemetaan kategori berhasil disimpan! Pembaruan ini akan langsung berlaku untuk deteksi selanjutnya.</span>
        </div>
      )}

      <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-700/50">
            <tr>
              <th className="px-6 py-4 font-semibold">Jenis Kejadian (Event Type)</th>
              <th className="px-6 py-4 font-semibold text-center">Tingkat Bahaya</th>
              <th className="px-6 py-4 font-semibold">Preview Indicator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 bg-[#1e293b]">
            {EVENT_TYPES.map((eventType) => {
              const currentSeverity = mapping[eventType.key] || 'medium';
              const Icon = eventType.icon;
              
              return (
                <tr key={eventType.key} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                        <Icon size={16} />
                      </div>
                      <span className="font-bold text-slate-200">{eventType.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800/50 p-1">
                      <button
                        onClick={() => handleSeverityChange(eventType.key, 'low')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                          currentSeverity === 'low' 
                            ? 'bg-slate-700 text-white shadow-sm border border-slate-600' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        LOW
                      </button>
                      <button
                        onClick={() => handleSeverityChange(eventType.key, 'medium')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                          currentSeverity === 'medium' 
                            ? 'bg-slate-700 text-white shadow-sm border border-slate-600' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        MEDIUM
                      </button>
                      <button
                        onClick={() => handleSeverityChange(eventType.key, 'high')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                          currentSeverity === 'high' 
                            ? 'bg-slate-700 text-white shadow-sm border border-slate-600' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        HIGH
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {currentSeverity === 'high' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[10px] uppercase tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_5px_rgba(244,63,94,0.8)]"></span>High Priority</span>}
                    {currentSeverity === 'medium' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[10px] uppercase tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Medium Alert</span>}
                    {currentSeverity === 'low' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] uppercase tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Low / Info</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3 text-sm text-emerald-400">
        <AlertTriangle size={20} className="text-emerald-500 flex-shrink-0" />
        <div>
          <p className="font-bold mb-1 text-emerald-300">Catatan Keamanan Pintar (Smart Security)</p>
          <p>Meskipun Anda mengatur "Motion Detected" sebagai LOW, sistem secara otomatis akan tetap mengklasifikasikannya sebagai <strong className="text-rose-400">HIGH</strong> apabila kejadian tersebut terjadi di luar jam sekolah (malam hari atau akhir pekan).</p>
        </div>
      </div>
    </div>
  );
}
