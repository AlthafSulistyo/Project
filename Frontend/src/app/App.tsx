import { useEffect, useState, FormEvent } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Video, Activity, Plus, Save } from 'lucide-react';

// Tipe Data
interface Camera {
  id: number;
  name: string;
  ip: string;
  status: string;
  location: string;
  thumbnail: string;
}

interface Stat {
  name: string;
  activity: number;
  alerts: number;
}

function App() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Form Tambah Kamera
  const [showForm, setShowForm] = useState(false);
  const [newCamName, setNewCamName] = useState('');
  const [newCamIp, setNewCamIp] = useState('');

  // Fetch Data Awal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [camsRes, statsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/cameras'),
          axios.get('http://localhost:5000/api/stats')
        ]);
        setCameras(camsRes.data);
        setStats(statsRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Gagal koneksi ke backend:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fungsi Handle Submit Form
  const handleAddCamera = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCamName || !newCamIp) return alert("Isi nama dan IP!");

    try {
      // Kirim data ke Backend
      const payload = {
        name: newCamName,
        ip: newCamIp,
        location: "Gedung Baru", // Default dulu
        status: "Online"
      };
      
      const res = await axios.post('http://localhost:5000/api/cameras', payload);
      
      // Update UI langsung tanpa refresh
      setCameras([...cameras, res.data.data]);
      
      // Reset Form
      setNewCamName('');
      setNewCamIp('');
      setShowForm(false);
      alert("Kamera berhasil ditambahkan!");
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan kamera.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading System...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CCTV Dashboard</h1>
          <div className="text-sm text-gray-500">System Status: <span className="text-green-600 font-bold">Operational</span></div>
        </div>

        {/* --- FORM TAMBAH KAMERA (Toggle) --- */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-700">
              <Plus size={20} /> Tambah Perangkat Baru
            </h3>
            <form onSubmit={handleAddCamera} className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Nama Kamera (misal: R. Guru)" 
                className="border p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newCamName}
                onChange={(e) => setNewCamName(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="IP Address (misal: 192.168.1.50)" 
                className="border p-2 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newCamIp}
                onChange={(e) => setNewCamIp(e.target.value)}
              />
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 justify-center">
                <Save size={18} /> Simpan
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 px-4">
                Batal
              </button>
            </form>
          </div>
        )}

        {/* --- GRAFIK --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Activity size={20} /></div>
            <h2 className="text-lg font-semibold">Statistik Deteksi Mingguan</h2>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="activity" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- LIST KAMERA --- */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg text-green-600"><Video size={20} /></div>
              Live Feed
            </h2>
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center gap-2"
              >
                <Plus size={16} /> Tambah Kamera
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cameras.map((cam) => (
              <div key={cam.id} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-300">
                <div className="relative h-48 bg-gray-100 group-hover:opacity-90 transition">
                  <img src={cam.thumbnail} alt={cam.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      cam.status === 'Online' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                    }`}>
                      {cam.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 truncate">{cam.name}</h3>
                  <div className="flex justify-between items-end mt-1">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{cam.location}</p>
                      <p className="text-xs text-gray-400 mt-1 font-mono bg-gray-100 inline-block px-1 rounded">{cam.ip}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;