import { useState, useRef } from 'react';
import { Maximize2, Radio, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Disc } from 'lucide-react';

export default function LiveMonitoring() {
    // Hanya satu kamera
    const activeCamera = {
        id: 1,
        name: 'CAM_01_Kelas_9.1',
        status: 'online',
        location: 'Main Gate',
        resolution: '4K Ultra HD'
    };

    const [isRecording, setIsRecording] = useState(true);
    const [lastCommand, setLastCommand] = useState<string>('');
    const [showToast, setShowToast] = useState(false);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    // PTZ Command Handler with visual feedback
    const handlePTZCommand = (command: string) => {
        setLastCommand(command);
        setShowToast(true);

        // Auto hide toast after 2 seconds
        setTimeout(() => setShowToast(false), 2000);

        // Simulate command being sent to camera
        console.log(`PTZ Command sent: ${command}`);
    };

    // Fullscreen Handler
    const handleFullscreen = () => {
        if (!videoContainerRef.current) return;

        if (!document.fullscreenElement) {
            videoContainerRef.current.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="p-6 h-[calc(100vh-64px)] flex flex-col gap-6">

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-20 right-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="font-medium">PTZ Command: {lastCommand}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Live Monitoring</h1>
                    <p className="text-slate-500 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Real-time Feed • {activeCamera.name}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsRecording(!isRecording)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition font-medium ${isRecording ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        <Disc size={18} className={isRecording ? "animate-spin" : ""} />
                        {isRecording ? 'Recording ON' : 'Start Record'}
                    </button>
                    <button
                        onClick={handleFullscreen}
                        className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition flex items-center gap-2"
                    >
                        <Maximize2 size={18} /> Fullscreen
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">

                {/* AREA VIDEO UTAMA (Satu Kamera Besar) */}
                <div
                    ref={videoContainerRef}
                    className="flex-1 bg-black rounded-2xl overflow-hidden relative group border border-slate-800 shadow-2xl"
                >

                    {/* YouTube Video Embed - Full Size */}
                    <iframe
                        className="w-full h-full absolute inset-0"
                        src="https://www.youtube.com/embed/nsFgBrrt-tQ?autoplay=1&mute=0&loop=1&playlist=nsFgBrrt-tQ&controls=1&modestbranding=1&rel=0"
                        title="CCTV Live Feed - CAM_01_Kelas_9.1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>

                    {/* Overlay Info Atas */}
                    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
                            <div>
                                <h2 className="text-white text-lg font-bold font-mono tracking-wide">{activeCamera.name}</h2>
                                <div className="flex gap-3 text-xs text-slate-300">
                                    <span className="bg-white/10 px-2 py-0.5 rounded">{activeCamera.location}</span>
                                    <span className="bg-white/10 px-2 py-0.5 rounded">{activeCamera.resolution}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-mono text-xl font-bold">{new Date().toLocaleTimeString()}</p>
                            <p className="text-slate-400 text-xs font-mono">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* PANEL KONTROL PTZ (KANAN) */}
                <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">

                    {/* Status Panel */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Radio size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Connection Status</h3>
                                <p className="text-xs text-green-600 font-medium">● Stable (Low Latency)</p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-3 border-t border-slate-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">IP Address</span>
                                <span className="font-mono text-slate-700">192.168.1.101</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Uptime</span>
                                <span className="font-mono text-slate-700">24h 12m 05s</span>
                            </div>
                            {lastCommand && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Last Command</span>
                                    <span className="font-mono text-blue-600 font-bold">{lastCommand}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controller PTZ (Dark Theme) */}
                    <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-white flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
                        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>

                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 z-10 flex items-center gap-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span> PTZ Controls
                        </h3>

                        {/* D-PAD Navigasi */}
                        <div className="grid grid-cols-3 gap-3 mb-8 z-10">
                            <div></div>
                            <button
                                onClick={() => handlePTZCommand('TILT UP')}
                                className="w-14 h-14 bg-slate-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition shadow-lg active:scale-95 border border-slate-700 hover:border-blue-500"
                            ><ChevronUp size={24} /></button>
                            <div></div>

                            <button
                                onClick={() => handlePTZCommand('PAN LEFT')}
                                className="w-14 h-14 bg-slate-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition shadow-lg active:scale-95 border border-slate-700 hover:border-blue-500"
                            ><ChevronLeft size={24} /></button>
                            <div className="w-14 h-14 bg-slate-950 rounded-full flex items-center justify-center border-2 border-slate-700 shadow-inner">
                                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                            </div>
                            <button
                                onClick={() => handlePTZCommand('PAN RIGHT')}
                                className="w-14 h-14 bg-slate-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition shadow-lg active:scale-95 border border-slate-700 hover:border-blue-500"
                            ><ChevronRight size={24} /></button>

                            <div></div>
                            <button
                                onClick={() => handlePTZCommand('TILT DOWN')}
                                className="w-14 h-14 bg-slate-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition shadow-lg active:scale-95 border border-slate-700 hover:border-blue-500"
                            ><ChevronDown size={24} /></button>
                            <div></div>
                        </div>

                        {/* Zoom Control */}
                        <div className="flex gap-3 z-10 w-full px-4">
                            <button
                                onClick={() => handlePTZCommand('ZOOM OUT')}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition active:scale-95 border border-slate-700 hover:border-blue-500"
                            >
                                <ZoomOut size={16} /> Out
                            </button>
                            <button
                                onClick={() => handlePTZCommand('ZOOM IN')}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition active:scale-95 shadow-lg shadow-blue-900/20"
                            >
                                <ZoomIn size={16} /> In
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}