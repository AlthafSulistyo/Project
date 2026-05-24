import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FileText, Download, Calendar, Filter, Search, Printer, Eye, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Interface Data
interface CctvEvent {
    id: string;
    camera_name: string;
    event_type: string;
    severity: string;
    is_reviewed: boolean;
    created_at: string;
    snapshot_url?: string;
}

export default function Laporan() {
    const { hasAnyRole } = useAuth();
    const location = useLocation();
    const [logs, setLogs] = useState<CctvEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 34;

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CctvEvent | null>(null);

    // Fetch logs from Firebase Firestore
    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'cctv_events'), orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData: CctvEvent[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                eventsData.push({
                    id: doc.id,
                    camera_name: data.camera_name || 'Unknown',
                    event_type: data.category || data.event_type || 'Aktivitas',
                    severity: data.severity?.toLowerCase() || 'low',
                    is_reviewed: data.status === 'reviewed' || data.is_reviewed || false,
                    created_at: data.timestamp?.toDate()?.toISOString() || new Date().toISOString(),
                    snapshot_url: data.snapshot_url
                });
            });

            setLogs(eventsData);
            setLoading(false);

            // Handle location state for opening modal automatically
            if (location.state?.selectedEventId) {
                const targetEvent = eventsData.find((e) => e.id === location.state.selectedEventId);
                if (targetEvent) {
                    setSelectedEvent(targetEvent);
                    setShowModal(true);
                }
                // Hapus state dari history
                window.history.replaceState({}, document.title);
            }
        }, (error) => {
            console.error('Error fetching logs from Firebase:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [location.state?.selectedEventId]);

    // Mark event as reviewed in Firestore
    const handleMarkReviewed = async (eventId: string) => {
        try {
            const eventRef = doc(db, 'cctv_events', eventId);
            await updateDoc(eventRef, {
                status: 'reviewed',
                is_reviewed: true
            });

            // Update selected event locally so the modal reflects the change immediately
            if (selectedEvent && selectedEvent.id === eventId) {
                setSelectedEvent({ ...selectedEvent, is_reviewed: true });
            }

            alert('✅ Event berhasil ditandai sebagai "Reviewed"');
            setShowModal(false);
        } catch (error) {
            console.error('Error marking as reviewed:', error);
            alert('❌ Gagal menandai event di Firebase. Silakan coba lagi.');
        }
    };

    // Export to PDF
    const handleExportPDF = () => {
        try {
            const doc = new jsPDF();
            doc.text("Laporan Aktivitas CCTV - SchoolGuard", 14, 15);
            doc.setFontSize(10);
            doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 22);
            
            const tableData = filteredLogs.map((log) => [
                new Date(log.created_at).toLocaleString('id-ID'),
                log.camera_name,
                log.event_type.toUpperCase(),
                log.severity.toUpperCase(),
                log.is_reviewed ? 'Reviewed' : 'New'
            ]);

            autoTable(doc, {
                head: [['Waktu Kejadian', 'Kamera', 'Objek Terdeteksi', 'Risiko', 'Status']],
                body: tableData,
                startY: 25,
                theme: 'grid',
                styles: { fontSize: 8 },
                headStyles: { fillColor: [16, 185, 129] } // Emerald-500
            });
            
            doc.save("Laporan_CCTV_SchoolGuard.pdf");
        } catch (error) {
            console.error("Gagal export PDF:", error);
            alert("Terjadi kesalahan saat mengekspor ke PDF.");
        }
    };

    // Export to Excel
    const handleExportExcel = () => {
        try {
            const dataToExport = filteredLogs.map(log => ({
                "Waktu Kejadian": new Date(log.created_at).toLocaleString('id-ID'),
                "Sumber Kamera": log.camera_name,
                "Objek Terdeteksi": log.event_type.toUpperCase(),
                "Tingkat Risiko": log.severity.toUpperCase(),
                "Status": log.is_reviewed ? 'Sudah Direview' : 'Belum Direview'
            }));
            
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data Kejadian");
            
            // Adjust column widths
            const wscols = [
                {wch: 25}, // Waktu
                {wch: 20}, // Kamera
                {wch: 20}, // Objek
                {wch: 15}, // Risiko
                {wch: 15}  // Status
            ];
            worksheet['!cols'] = wscols;
            
            XLSX.writeFile(workbook, "Laporan_CCTV_SchoolGuard.xlsx");
        } catch (error) {
            console.error("Gagal export Excel:", error);
            alert("Terjadi kesalahan saat mengekspor ke Excel.");
        }
    };

    // Filter Data
    const filteredLogs = logs
        .filter(log => filterType === 'all' || log.severity === filterType)
        .filter(log => {
            const logDate = new Date(log.created_at);
            if (startDate && new Date(startDate) > logDate) return false;
            if (endDate && new Date(endDate) < logDate) return false;
            return true;
        })
        .filter(log => log.event_type.toLowerCase().includes(searchTerm.toLowerCase()));

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    // Reset pagination to first page when any filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterType, startDate, endDate, searchTerm]);

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2 tracking-tight">
                        <FileText className="text-emerald-500" /> Laporan Aktivitas
                    </h1>
                    <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                        <Video size={12} />
                        Data Log untuk: <span className="font-mono font-bold text-slate-300 bg-[#1e293b] px-2 py-0.5 rounded border border-slate-700">Semua Kamera Aktif</span>
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-800 hover:text-white transition text-sm font-medium">
                        <Printer size={16} /> Print
                    </button>

                    {/* PDF & Excel: Admin and Management only */}
                    {hasAnyRole(['admin', 'management']) && (
                        <>
                            <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-rose-600/80 text-white border border-rose-500/50 rounded-lg hover:bg-rose-600 transition text-sm font-medium shadow-sm">
                                <Download size={16} /> Export PDF
                            </button>
                            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600/80 text-white border border-emerald-500/50 rounded-lg hover:bg-emerald-600 transition text-sm font-medium shadow-sm">
                                <Download size={16} /> Export Excel
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="bg-[#0f172a] p-4 rounded-xl shadow-lg border border-slate-800/50 ring-1 ring-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* Input Tanggal */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative group flex-1">
                        <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full color-scheme-dark"
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>
                    <span className="text-slate-500 text-sm">-</span>
                    <div className="relative group flex-1">
                        <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full color-scheme-dark"
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>
                </div>

                {/* Filter Severity & Search */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                        <Filter size={16} className="absolute left-3 top-3 text-slate-400" />
                        <select
                            onChange={(e) => setFilterType(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full appearance-none cursor-pointer"
                        >
                            <option value="all">Semua Status</option>
                            <option value="high">Bahaya (High)</option>
                            <option value="medium">Peringatan (Medium)</option>
                            <option value="low">Info (Low)</option>
                        </select>
                    </div>
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari jenis deteksi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                        />
                    </div>
                </div>
            </div>

            {/* TABEL DATA */}
            <div className="bg-[#0f172a] rounded-xl shadow-lg border border-slate-800/50 ring-1 ring-white/5 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="p-10 text-center text-slate-500 animate-pulse">
                        <p>Mengunduh data log dari Firebase...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#1e293b]/50 text-slate-400 uppercase font-bold text-xs border-b border-slate-800/50 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Waktu Kejadian</th>
                                    <th className="px-6 py-4">Sumber Kamera</th>
                                    <th className="px-6 py-4">Objek Terdeteksi</th>
                                    <th className="px-6 py-4">Tingkat Risiko</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Bukti</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {currentItems.length > 0 ? currentItems.map((log) => (
                                    <tr key={log.id} className="hover:bg-[#1e293b]/50 transition-colors group">
                                        <td className="px-6 py-4 text-slate-400 font-mono">
                                            {new Date(log.created_at).toLocaleString('id-ID', {
                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-200">
                                            {log.camera_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700 text-xs">
                                                {log.event_type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.severity === 'high' ? (
                                                <span className="text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full text-xs font-bold border border-rose-500/20 flex items-center gap-1 w-fit shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                                                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(244,63,94,0.8)]"></span> HIGH
                                                </span>
                                            ) : log.severity === 'medium' ? (
                                                <span className="text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/20 flex items-center gap-1 w-fit shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                                                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span> MEDIUM
                                                </span>
                                            ) : (
                                                <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 flex items-center gap-1 w-fit shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> LOW
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.is_reviewed ? (
                                                <span className="text-emerald-500 text-xs flex items-center gap-1 font-medium">
                                                    ✅ Reviewed
                                                </span>
                                            ) : (
                                                <span className="text-amber-400 text-xs font-bold flex items-center gap-1 animate-pulse">
                                                    🆕 New
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedEvent(log);
                                                    setShowModal(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition group-hover:bg-[#1e293b] border border-transparent group-hover:border-slate-700 shadow-sm"
                                                title="Lihat Detail Event"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search size={32} className="opacity-20" />
                                                <p>Tidak ada data kejadian ditemukan dari Firebase.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-slate-800/50 flex justify-between items-center bg-[#1e293b]/30">
                    <span className="text-xs text-slate-500">
                        Menampilkan {filteredLogs.length === 0 ? 0 : indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLogs.length)} dari {filteredLogs.length} entri (Halaman {currentPage} dari {totalPages || 1})
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="px-3 py-1 bg-[#1e293b] border border-slate-700 rounded text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition" 
                            disabled={currentPage <= 1}
                        >
                            Sebelumnya
                        </button>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="px-3 py-1 bg-[#1e293b] border border-slate-700 rounded text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition"
                            disabled={currentPage >= totalPages || totalPages === 0}
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DETAIL EVENT */}
            {showModal && selectedEvent && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-[#0f172a] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-900/40 to-[#0f172a] p-6 border-b border-slate-800">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold mb-1 text-slate-100">Detail Kejadian CCTV</h2>
                                    <p className="text-slate-400 text-xs sm:text-sm font-mono">Event ID: #{selectedEvent.id}</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 p-2 rounded-lg transition"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Event Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-[#1e293b] p-4 rounded-lg border border-slate-800/50">
                                    <div className="text-xs text-slate-400 mb-1 font-medium">⏰ Waktu Kejadian</div>
                                    <div className="font-semibold text-slate-200 text-sm">
                                        {new Date(selectedEvent.created_at).toLocaleString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </div>
                                </div>

                                <div className="bg-[#1e293b] p-4 rounded-lg border border-slate-800/50">
                                    <div className="text-xs text-slate-400 mb-1 font-medium">📹 Sumber Kamera</div>
                                    <div className="font-semibold text-slate-200 text-sm">{selectedEvent.camera_name}</div>
                                </div>

                                <div className="bg-[#1e293b] p-4 rounded-lg border border-slate-800/50">
                                    <div className="text-xs text-slate-400 mb-1 font-medium">🎯 Objek Terdeteksi</div>
                                    <div className="font-bold text-slate-200 text-sm">{selectedEvent.event_type.toUpperCase()}</div>
                                </div>

                                <div className="bg-[#1e293b] p-4 rounded-lg border border-slate-800/50">
                                    <div className="text-xs text-slate-400 mb-1 font-medium">⚠️ Tingkat Risiko</div>
                                    <div className="font-bold text-sm mt-1">
                                        {selectedEvent.severity === 'high' ? (
                                            <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">🔴 HIGH</span>
                                        ) : selectedEvent.severity === 'medium' ? (
                                            <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">🟡 MEDIUM</span>
                                        ) : (
                                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">🟢 LOW</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Snapshot Preview */}
                            <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 ring-1 ring-white/5">
                                {selectedEvent.snapshot_url ? (
                                    <img 
                                        src={selectedEvent.snapshot_url} 
                                        alt="CCTV Snapshot" 
                                        className="w-full h-auto rounded-md object-contain max-h-[400px] border border-slate-800/80" 
                                    />
                                ) : (
                                    <div className="text-center text-slate-500 py-12">
                                        <div className="text-6xl mb-4 opacity-50">📷</div>
                                        <p className="font-semibold text-slate-400">Snapshot Tidak Tersedia</p>
                                        <p className="text-sm mt-2">Kamera tidak menangkap snapshot untuk event ini</p>
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <div>
                                    <div className="text-xs text-emerald-400 mb-1 font-medium">Status Review</div>
                                    <div className="font-bold text-emerald-300">
                                        {selectedEvent.is_reviewed ? '✅ Sudah Direview' : '🆕 Belum Direview'}
                                    </div>
                                </div>
                                {!selectedEvent.is_reviewed && (
                                    <button
                                        onClick={() => handleMarkReviewed(selectedEvent.id)}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                    >
                                        Tandai Direview
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-[#1e293b]/50 border-t border-slate-800 flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition text-sm font-medium"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}