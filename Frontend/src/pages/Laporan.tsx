import { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Download, Calendar, Filter, Search, Printer, Eye, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Interface Data
interface CctvEvent {
    id: number;
    camera_name: string;
    event_type: string;
    severity: 'high' | 'medium' | 'low';
    is_reviewed: boolean;
    created_at: string;
}

export default function Laporan() {
    const { hasAnyRole } = useAuth(); // Add role checking
    const [logs, setLogs] = useState<CctvEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CctvEvent | null>(null);

    // Nama kamera tunggal yang kita fokuskan
    const SINGLE_CAM_NAME = "CAM_01_Kelas_9.1";

    // Fetch logs from API
    const fetchLogs = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/cctv-events');

            // Laravel Resource Collection returns: response.data.data (pagination wrapper)
            const rawData = response.data.data;

            // Override camera name untuk konsistensi dengan single camera view
            const singleCamData = rawData.map((item: CctvEvent) => ({
                ...item,
                camera_name: SINGLE_CAM_NAME
            }));

            setLogs(singleCamData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching logs:', error);
            setLoading(false);
        }
    };

    // Mark event as reviewed
    const handleMarkReviewed = async (eventId: number) => {
        const token = localStorage.getItem('auth_token');

        try {
            const response = await axios.patch(
                `http://127.0.0.1:8000/api/cctv-events/${eventId}/review`,
                { is_reviewed: true },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200) {
                // Update local state
                setLogs(prevLogs =>
                    prevLogs.map(log =>
                        log.id === eventId ? { ...log, is_reviewed: true } : log
                    )
                );

                // Update selected event if still open
                if (selectedEvent && selectedEvent.id === eventId) {
                    setSelectedEvent({ ...selectedEvent, is_reviewed: true });
                }

                // Show success message
                alert('✅ Event berhasil ditandai sebagai "Reviewed"');

                // Close modal
                setShowModal(false);
            }
        } catch (error) {
            console.error('Error marking as reviewed:', error);
            alert('❌ Gagal menandai event. Silakan coba lagi.');
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleExportCSV = () => {
        // Filter events based on current filters
        let dataToExport = filteredLogs; // Use filteredLogs to export what's currently displayed

        // CSV Headers
        const headers = ['Waktu Kejadian', 'Sumber Kamera', 'Objek Terdeteksi', 'Tingkat Risiko', 'Status'];

        // Convert data to CSV rows
        const csvRows = [
            headers.join(','), // Header row
            ...dataToExport.map(event => [
                new Date(event.created_at).toLocaleString('id-ID'),
                event.camera_name || 'CAM_01_Kelas_9.1',
                event.event_type.replace(/_/g, ' ').toUpperCase(),
                event.severity.toUpperCase(),
                event.is_reviewed ? 'Reviewed' : 'New'
            ].map(field => `"${field}"`).join(',')) // Wrap fields in quotes for CSV safety
        ];

        // Create CSV content
        const csvContent = csvRows.join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        // Generate filename with date
        const filename = `Laporan_CCTV_${new Date().toISOString().split('T')[0]}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export to PDF
    const handleExportPDF = () => {
        const token = localStorage.getItem('auth_token');

        // Use default dates if not set (last 7 days)
        const endDateValue = endDate || new Date().toISOString().split('T')[0];
        const startDateValue = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const params = new URLSearchParams({
            start_date: startDateValue,
            end_date: endDateValue,
        });

        const url = `http://127.0.0.1:8000/api/export/pdf?${params.toString()}`;

        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Laporan_CCTV_${startDateValue}_to_${endDateValue}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Export PDF error:', error);
                alert('Gagal export PDF. Pastikan Anda sudah login sebagai Admin atau Management.');
            });
    };

    // Export to Excel
    const handleExportExcel = () => {
        const token = localStorage.getItem('auth_token');

        // Use default dates if not set (last 7 days)
        const endDateValue = endDate || new Date().toISOString().split('T')[0];
        const startDateValue = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const params = new URLSearchParams({
            start_date: startDateValue,
            end_date: endDateValue,
        });

        const url = `http://127.0.0.1:8000/api/export/excel?${params.toString()}`;

        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'text/csv',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Laporan_CCTV_${startDateValue}_to_${endDateValue}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Export Excel error:', error);
                alert('Gagal export Excel. Pastikan Anda sudah login sebagai Admin atau Management.');
            });
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

    return (
        <div className="p-6 space-y-6">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="text-blue-600" /> Laporan Aktivitas
                    </h1>
                    <p className="text-slate-500 text-sm flex items-center gap-1">
                        <Video size={12} />
                        Data Log untuk: <span className="font-mono font-bold text-slate-700">{SINGLE_CAM_NAME}</span>
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium">
                        <Printer size={16} /> Print
                    </button>

                    {/* PDF & Excel: Admin and Management only */}
                    {hasAnyRole(['admin', 'management']) && (
                        <>
                            <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium shadow-sm">
                                <Download size={16} /> Export PDF
                            </button>
                            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm">
                                <Download size={16} /> Export Excel
                            </button>
                        </>
                    )}

                    {/* CSV: Available to all users */}
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* Input Tanggal */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative group flex-1">
                        <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input type="date" className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                    </div>
                    <span className="text-slate-400 text-sm">-</span>
                    <div className="relative group flex-1">
                        <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input type="date" className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                    </div>
                </div>

                {/* Filter Severity & Search */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                        <Filter size={16} className="absolute left-3 top-3 text-slate-400" />
                        <select
                            onChange={(e) => setFilterType(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none cursor-pointer"
                        >
                            <option value="all">Semua Status</option>
                            <option value="high">Bahaya (High)</option>
                            <option value="medium">Peringatan (Medium)</option>
                            <option value="low">Info (Low)</option>
                        </select>
                    </div>
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        {/* Search difokuskan ke tipe kejadian karena kamera cuma satu */}
                        <input type="text" placeholder="Cari jenis deteksi..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                    </div>
                </div>
            </div>

            {/* TABEL DATA */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="p-10 text-center text-slate-500 animate-pulse">
                        <p>Mengunduh data log...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Waktu Kejadian</th>
                                    <th className="px-6 py-4">Sumber Kamera</th>
                                    <th className="px-6 py-4">Objek Terdeteksi</th>
                                    <th className="px-6 py-4">Tingkat Risiko</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Bukti</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 text-slate-600 font-mono">
                                            {new Date(log.created_at).toLocaleString('id-ID', {
                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            {log.camera_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200 text-xs">
                                                {log.event_type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.severity === 'high' ? (
                                                <span className="text-red-700 bg-red-50 px-3 py-1 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1 w-fit">
                                                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> HIGH
                                                </span>
                                            ) : log.severity === 'medium' ? (
                                                <span className="text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold border border-yellow-100 flex items-center gap-1 w-fit">
                                                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span> MEDIUM
                                                </span>
                                            ) : (
                                                <span className="text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1 w-fit">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> LOW
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.is_reviewed ? (
                                                <span className="text-slate-500 text-xs flex items-center gap-1">
                                                    ✅ Reviewed
                                                </span>
                                            ) : (
                                                <span className="text-blue-600 text-xs font-bold flex items-center gap-1">
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
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-200"
                                                title="Lihat Detail Event"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search size={32} className="opacity-20" />
                                                <p>Tidak ada data kejadian ditemukan untuk filter ini.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <span className="text-xs text-slate-500">Menampilkan {filteredLogs.length} entri terbaru</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-white border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-50" disabled>Sebelumnya</button>
                        <button className="px-3 py-1 bg-white border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100">Selanjutnya</button>
                    </div>
                </div>
            </div>

            {/* MODAL DETAIL EVENT */}
            {showModal && selectedEvent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">Detail Kejadian CCTV</h2>
                                    <p className="text-blue-100 text-sm">Event ID: #{selectedEvent.id}</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Event Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="text-xs text-slate-500 mb-1">⏰ Waktu Kejadian</div>
                                    <div className="font-semibold text-slate-800">
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

                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="text-xs text-slate-500 mb-1">📹 Sumber Kamera</div>
                                    <div className="font-semibold text-slate-800">{selectedEvent.camera_name}</div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="text-xs text-slate-500 mb-1">🎯 Objek Terdeteksi</div>
                                    <div className="font-bold text-slate-800">{selectedEvent.event_type.toUpperCase()}</div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="text-xs text-slate-500 mb-1">⚠️ Tingkat Risiko</div>
                                    <div className="font-bold">
                                        {selectedEvent.severity === 'high' ? (
                                            <span className="text-red-600">🔴 HIGH</span>
                                        ) : selectedEvent.severity === 'medium' ? (
                                            <span className="text-yellow-600">🟡 MEDIUM</span>
                                        ) : (
                                            <span className="text-green-600">🟢 LOW</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Snapshot Preview */}
                            <div className="bg-slate-100 rounded-lg p-4 border-2 border-dashed border-slate-300">
                                <div className="text-center text-slate-500 py-12">
                                    <div className="text-6xl mb-4">📷</div>
                                    <p className="font-semibold">Snapshot Tidak Tersedia</p>
                                    <p className="text-sm mt-2">Bukti visual akan muncul setelah integrasi dengan kamera CCTV</p>
                                    <p className="text-xs mt-1 text-slate-400">(Requires Hikvision ISAPI Connection)</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div>
                                    <div className="text-xs text-blue-600 mb-1">Status Review</div>
                                    <div className="font-bold text-blue-800">
                                        {selectedEvent.is_reviewed ? '✅ Sudah Direview' : '🆕 Belum Direview'}
                                    </div>
                                </div>
                                {!selectedEvent.is_reviewed && (
                                    <button
                                        onClick={() => handleMarkReviewed(selectedEvent.id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                    >
                                        Tandai Direview
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
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