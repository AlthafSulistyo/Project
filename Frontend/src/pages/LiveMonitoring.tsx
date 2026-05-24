import { useState, useEffect, useRef } from 'react';
import { Maximize2, Disc, Video, MapPin, Activity, Settings } from 'lucide-react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';

interface Camera {
    id: number;
    name: string;
    location: string;
    status: string;
    rtsp_url: string;
    mtxPath?: string;
}

export default function LiveMonitoring() {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());
    const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
    const gridContainerRef = useRef<HTMLDivElement>(null);
    
    // Global Stream URL from Firebase
    const [streamServerUrl, setStreamServerUrl] = useState(`http://${window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname}:8889`);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [tempUrl, setTempUrl] = useState(streamServerUrl);
    const [isSaving, setIsSaving] = useState(false);

    const saveConfig = async () => {
        setIsSaving(true);
        let cleanUrl = tempUrl.trim();
        if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
        
        try {
            const { doc, setDoc } = await import('firebase/firestore');
            await setDoc(doc(db, 'settings', 'system'), { streamServerUrl: cleanUrl }, { merge: true });
            setShowConfigModal(false);
        } catch (error) {
            console.error("Gagal menyimpan konfigurasi URL:", error);
            alert("Gagal menyimpan ke Firebase. Pastikan koneksi internet lancar.");
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        // Subscribe to system settings for global Stream URL
        import('firebase/firestore').then(({ doc, onSnapshot: onDocSnapshot }) => {
            const unsubSettings = onDocSnapshot(doc(db, 'settings', 'system'), (docSnap) => {
                if (docSnap.exists() && docSnap.data().streamServerUrl) {
                    setStreamServerUrl(docSnap.data().streamServerUrl);
                }
            });
            // Attach to window so we can cleanup, or just let it live for the session
        });

        // Subscribe to cameras
        const qCameras = query(collection(db, 'cameras'), where('status', '==', 'active'));
        
        const unsubscribe = onSnapshot(qCameras, (snapshot) => {
            const allCameras: Camera[] = [];
            let index = 0;
            snapshot.forEach((doc) => {
                const data = doc.data();
                allCameras.push({
                    id: doc.id as any, // Cast to any as id was previously number
                    name: data.name || `Camera ${index + 1}`,
                    location: data.location || 'Unknown',
                    status: data.status || 'active',
                    rtsp_url: data.rtsp_url || '',
                    mtxPath: `cam_${index + 1}`
                });
                index++;
            });
            setCameras(allCameras);
            setLoading(false);
        }, (error) => {
            console.error("Gagal koneksi ke Firebase:", error);
            setLoading(false);
        });

        // Update jam setiap detik
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(interval);
            unsubscribe();
        };
    }, []);

    if (loading) {
        return <div className="p-8 text-slate-400 font-medium animate-pulse">Memuat CCTV Grid...</div>;
    }

    return (
        <div className="p-6 h-[calc(100vh-64px)] flex flex-col gap-6" ref={gridContainerRef}>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0f172a] p-4 rounded-xl shadow-lg border border-slate-800/50 ring-1 ring-white/5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">CCTV Wall Monitoring</h1>
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                        {cameras.length} Kamera Terhubung • Live Status
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => { setTempUrl(streamServerUrl); setShowConfigModal(true); }} className="bg-[#1e293b] text-slate-300 hover:text-white px-3 py-2 rounded-lg flex items-center shadow-inner border border-slate-700/50 hover:bg-slate-700 transition" title="Pengaturan Server Video">
                        <Settings size={18} />
                    </button>
                    <div className="bg-[#1e293b] text-slate-200 px-4 py-2 font-mono text-sm rounded-lg flex items-center shadow-inner font-bold border border-slate-700/50">
                        {time.toLocaleTimeString('id-ID')}
                    </div>
                </div>
            </div>

            {/* GRID KAMERA (Responsive) */}
            <div className="flex-1 overflow-y-auto pr-2 pb-8 custom-scrollbar">
                {(window.location.hostname.includes('vercel.app') && streamServerUrl.includes('127.0.0.1')) ? (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-8 text-center flex flex-col items-center justify-center h-full">
                        <Video size={64} className="text-rose-500 mb-4 opacity-80" />
                        <h2 className="text-xl font-bold text-rose-400 mb-2">Live Stream Terblokir (Mode Cloud)</h2>
                        <p className="text-slate-300 max-w-2xl text-sm leading-relaxed mb-6">
                            Karena alasan keamanan browser <em>(Mixed Content)</em>, website Vercel tidak diizinkan memutar video dari <strong className="text-rose-400">127.0.0.1 (Localhost)</strong>.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left w-full max-w-3xl">
                            <div className="bg-[#0f172a] p-5 rounded-xl border border-emerald-500/30">
                                <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><Activity size={18}/> Opsi 1: Jaringan Lokal (WiFi Sama)</h3>
                                <p className="text-slate-400 text-xs mb-3">Sangat disarankan untuk presentasi sidang.</p>
                                <ol className="text-slate-300 text-sm list-decimal ml-4 space-y-1">
                                    <li>Sambungkan HP ke WiFi/Hotspot Laptop.</li>
                                    <li>Ketik <code className="bg-slate-800 text-emerald-300 px-1 rounded">ipconfig</code> di terminal Laptop.</li>
                                    <li>Buka di HP: <strong>http://[IP-Laptop]:5173</strong></li>
                                </ol>
                            </div>
                            <div className="bg-[#0f172a] p-5 rounded-xl border border-blue-500/30">
                                <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2"><Disc size={18}/> Opsi 2: Remote Jarak Jauh (Ngrok/Cloudflare)</h3>
                                <p className="text-slate-400 text-xs mb-3">Akses dari manapun via internet publik.</p>
                                <ol className="text-slate-300 text-sm list-decimal ml-4 space-y-1 mb-4">
                                    <li>Install & Jalankan Tunneling (misal Cloudflare).</li>
                                    <li>Arahkan tunnel ke port <strong>8889</strong>.</li>
                                    <li>Dapatkan URL Publik HTTPS.</li>
                                </ol>
                                <button onClick={() => setShowConfigModal(true)} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition shadow-lg shadow-blue-500/20">
                                    Masukkan URL Public Tunnel
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {cameras.map((camera) => (
                            <div 
                                key={camera.id} 
                                className="bg-black rounded-xl overflow-hidden relative group border border-slate-800 shadow-xl min-h-[220px] cursor-crosshair"
                            >
                                {/* LIVE WEBRTC STREAM FROM MEDIAMTX */}
                                <div className="absolute inset-0 bg-slate-900 animate-pulse -z-10"></div>
                                <iframe 
                                    src={`${streamServerUrl}/${camera.mtxPath}/`} 
                                    title={camera.name}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-700 contrast-125 scale-105"
                                    frameBorder="0"
                                    scrolling="no"
                                    allow="autoplay; fullscreen"
                                    style={{ pointerEvents: 'none' }}
                                ></iframe>

                                {/* Efek Scanline Buatan dengan CSS */}
                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50 mix-blend-overlay"></div>

                                {/* Overlay Top: Status & Name */}
                                <div className="absolute top-0 left-0 w-full p-3 bg-gradient-to-b from-black/80 to-transparent pointer-events-none flex justify-between items-start">
                                    <div className="flex gap-2 items-center">
                                        <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                                        <span className="text-white text-xs font-mono font-bold tracking-wider">{camera.name}</span>
                                    </div>
                                    <div className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg">LIVE</div>
                                </div>

                                {/* Overlay Bottom: Location & Timestamp */}
                                <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/90 to-transparent pointer-events-none flex justify-between items-end">
                                    <div className="text-emerald-400 font-mono text-xs flex items-center gap-1.5 opacity-90">
                                        <MapPin size={12} /> {camera.location}
                                    </div>
                                    <div className="text-amber-400 font-mono text-xs opacity-90">
                                        {time.toLocaleTimeString('id-ID', { hour12: false })}
                                    </div>
                                </div>

                                {/* RTSP Debug Info (Hover Only) */}
                                <div 
                                    className="absolute inset-0 bg-emerald-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4"
                                    onClick={() => setSelectedCamera(camera)}
                                >
                                    <Maximize2 className="text-white mb-2" size={32} />
                                    <span className="text-white font-bold text-sm">Klik untuk Perbesar Layar</span>
                                    <span className="text-emerald-300 text-[10px] mt-2 border border-emerald-400/30 px-2 py-1 rounded break-all shadow-sm">
                                        {camera.rtsp_url}
                                    </span>
                                </div>
                            </div>
                        ))}
                        
                        {cameras.length === 0 && (
                            <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-500 bg-[#0f172a] rounded-xl border border-dashed border-slate-700 ring-1 ring-white/5">
                                <Video size={48} className="mb-4 text-slate-600" />
                                <p>Tidak ada data kamera ditemukan.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* FULLSCREEN CAMERA MODAL WITH DVR TIMELINE MOCKUP */}
            {selectedCamera && (
                <div className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md">
                    {/* Header Controls */}
                    <div className="w-full max-w-5xl flex justify-between items-start sm:items-center mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
                                <h2 className="text-white text-lg sm:text-xl font-bold font-mono tracking-wider">{selectedCamera.name}</h2>
                            </div>
                            <span className="text-slate-300 text-sm flex items-center gap-1 bg-[#1e293b] px-3 py-1 rounded-full border border-slate-700/50"><MapPin size={14}/> {selectedCamera.location}</span>
                        </div>
                        <button onClick={() => setSelectedCamera(null)} className="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 w-10 h-10 rounded-full flex items-center justify-center transition shadow-lg border border-rose-500/20">
                            <span className="font-bold text-xl">×</span>
                        </button>
                    </div>
                    
                    {/* Large Video Area (Full 16:9 Aspect Ratio) */}
                    <div className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 relative shadow-2xl ring-4 ring-black/50 pointer-events-none">
                        <iframe 
                            src={`${streamServerUrl}/${selectedCamera.mtxPath}/`} 
                            title={selectedCamera.name}
                            className="w-full h-full object-cover scale-105"
                            frameBorder="0"
                            scrolling="no"
                            allow="autoplay; fullscreen"
                        ></iframe>
                        {/* Overlay Scanlines and Timestamp */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-40 mix-blend-overlay"></div>
                        <div className="absolute bottom-4 right-4 text-yellow-400 font-mono text-sm opacity-90 tracking-widest drop-shadow-md">
                            {time.toLocaleTimeString('id-ID', { hour12: false })}
                        </div>
                    </div>

                    {/* Timeline / Playback Controls */}
                    <div className="w-full max-w-5xl mt-6 bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col gap-4 shadow-xl">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            
                            {/* Rewind Button */}
                            <button 
                                onClick={() => alert("Fitur Rewind tertahan: Kamera Hikvision tidak memiliki memori SD Card/HDD Edge-Storage yang terpasang.")} 
                                className="text-slate-400 hover:text-emerald-400 flex flex-col items-center gap-1 transition min-w-[80px]"
                            >
                                <span className="text-3xl filter hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">⏪</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest">Rewind</span>
                            </button>
                            
                            {/* Playback Timeline GUI */}
                            <div 
                                className="flex-1 relative h-[50px] w-full bg-slate-900 rounded-lg overflow-hidden cursor-not-allowed group border border-slate-700/50 shadow-inner" 
                                onClick={() => alert("Timeline terkunci: Kamera tidak dapat menelusuri riwayat (No Local Disk).")} 
                            >
                                {/* Timeline line */}
                                <div className="absolute top-1/2 -mt-[2px] left-0 w-full h-[4px] bg-slate-700/70 rounded">
                                    <div className="absolute top-0 left-0 w-[95%] h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                                </div>
                                {/* Markers */}
                                <div className="absolute inset-0 flex justify-between px-3 items-end pb-1.5 text-[9px] text-slate-500 font-mono font-bold tracking-widest">
                                    <span>H-1 Jam</span>
                                    <span>H-30 Min</span>
                                    <span className="text-emerald-400 shadow-emerald-400/50">LIVE (SEKARANG)</span>
                                </div>
                                {/* Current Indicator */}
                                <div className="absolute right-[5%] top-0 w-[2px] h-full bg-white shadow-[0_0_12px_white] z-10 group-hover:bg-emerald-300 transition"></div>
                            </div>

                            {/* Forward Button (Disabled natively because it's live) */}
                            <button className="text-slate-600 flex flex-col items-center gap-1 min-w-[80px] cursor-not-allowed transition">
                                <span className="text-3xl">⏩</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest">Forward</span>
                            </button>
                        </div>
                        
                        <div className="text-center">
                            <span className="text-xs text-slate-500 font-medium">⚠️ Catatan SIstem: Modul Playback Terbatas. Perangkat Kamera CCTV tidak dilengkapi unit memori penyimpan (SD Card).</span>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIG MODAL */}
            {showConfigModal && (
                <div className="fixed inset-0 bg-slate-900/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2"><Settings size={18}/> Pengaturan Server Stream</h3>
                            <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-white">×</button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm text-slate-400 mb-2">MediaMTX URL (Local / Ngrok / Cloudflare)</label>
                            <input 
                                type="text" 
                                value={tempUrl}
                                onChange={(e) => setTempUrl(e.target.value)}
                                placeholder="Contoh: https://abcd.ngrok.app"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm mb-4"
                            />
                            <div className="text-xs text-slate-500 mb-6 space-y-1">
                                <p>• Default Lokal: <code className="text-slate-400">http://127.0.0.1:8889</code></p>
                                <p>• Jika pakai Ngrok, jangan lupa sertakan <code className="text-slate-400">https://</code></p>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setShowConfigModal(false)} className="px-4 py-2 rounded-lg font-bold text-slate-400 hover:text-white transition">Batal</button>
                                <button onClick={saveConfig} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition shadow-lg">Simpan URL</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom scrollbar styling in JSX */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #334155;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
}