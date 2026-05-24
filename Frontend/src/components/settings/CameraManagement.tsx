import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Video, Plus, Edit2, Trash2, X, Save, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Camera {
    id: string;
    name: string;
    location: string;
    rtsp_url: string;
    status: 'active' | 'inactive';
}

export default function CameraManagement() {
    const { isAdmin } = useAuth();
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        rtsp_url: '',
        status: 'active' as 'active' | 'inactive'
    });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        fetchCameras();
    }, []);

    const fetchCameras = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'cameras'));
            const data: Camera[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as Camera);
            });
            setCameras(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch cameras:', error);
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingCamera(null);
        setFormData({ name: '', location: '', rtsp_url: '', status: 'active' });
        setShowModal(true);
    };

    const handleEdit = (camera: Camera) => {
        setEditingCamera(camera);
        setFormData({
            name: camera.name,
            location: camera.location,
            rtsp_url: camera.rtsp_url,
            status: camera.status
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingCamera) {
                // Update existing camera
                const camRef = doc(db, 'cameras', editingCamera.id);
                await updateDoc(camRef, formData);
            } else {
                // Create new camera
                await addDoc(collection(db, 'cameras'), formData);
            }
            await fetchCameras();
            setShowModal(false);
            setFormData({ name: '', location: '', rtsp_url: '', status: 'active' });
        } catch (error) {
            console.error('Failed to save camera:', error);
            alert('Gagal menyimpan kamera. Silakan coba lagi.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'cameras', id));
            await fetchCameras();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Failed to delete camera:', error);
            alert('Gagal menghapus kamera. Silakan coba lagi.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-100">Daftar Kamera CCTV</h3>
                    <p className="text-xs text-slate-400">Kelola kamera yang terhubung ke sistem</p>
                </div>
                {isAdmin() ? (
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium text-sm transition shadow-lg shadow-emerald-500/20"
                    >
                        <Plus size={18} /> Tambah Kamera
                    </button>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 text-slate-400 rounded-lg border border-slate-700/50 text-xs font-medium">
                        <ShieldAlert size={14} /> Hanya Admin
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 shadow-sm overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                    <thead className="bg-slate-800/50 text-slate-400 font-medium">
                        <tr>
                            <th className="px-4 py-3 text-left">Nama</th>
                            <th className="px-4 py-3 text-left">Lokasi</th>
                            <th className="px-4 py-3 text-left">RTSP URL</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            {isAdmin() && <th className="px-4 py-3 text-center">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {cameras.map((camera) => (
                            <tr key={camera.id} className="hover:bg-slate-800/30 transition">
                                <td className="px-4 py-3 font-medium text-slate-200">{camera.name}</td>
                                <td className="px-4 py-3 text-slate-400">{camera.location}</td>
                                <td className="px-4 py-3 text-slate-500 font-mono text-xs truncate max-w-xs">
                                    {camera.rtsp_url}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {camera.status === 'active' ? (
                                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                            Aktif
                                        </span>
                                    ) : (
                                        <span className="bg-slate-800 border border-slate-700 text-slate-400 px-2 py-1 rounded text-xs font-bold">
                                            Nonaktif
                                        </span>
                                    )}
                                </td>
                                {isAdmin() && (
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(camera)}
                                                className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(camera.id)}
                                                className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded transition"
                                                title="Hapus"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {cameras.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                    Belum ada kamera. Klik "Tambah Kamera" untuk menambahkan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f172a] rounded-2xl shadow-2xl max-w-md w-full ring-1 ring-white/10">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-100">
                                {editingCamera ? 'Edit Kamera' : 'Tambah Kamera Baru'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Nama Kamera</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="CAM_01_Lobby"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Lokasi</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="Lobby Utama - Lantai 1"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">RTSP URL</label>
                                <input
                                    type="text"
                                    value={formData.rtsp_url}
                                    onChange={(e) => setFormData({ ...formData, rtsp_url: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                                    placeholder="rtsp://192.168.1.100:554/stream"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                    className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-[#1e293b]/30">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg font-medium transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0f172a] rounded-2xl shadow-2xl max-w-sm w-full p-6 ring-1 ring-white/10 border border-slate-800">
                        <h3 className="text-lg font-bold text-slate-100 mb-2">Hapus Kamera?</h3>
                        <p className="text-sm text-slate-400 mb-6">
                            Apakah Anda yakin ingin menghapus kamera ini? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg font-medium transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium transition"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
