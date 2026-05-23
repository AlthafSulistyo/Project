import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Edit2, Trash2, X, Save, Loader2, Shield } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'management' | 'staff';
    created_at: string;
}

const roleLabels = {
    admin: 'Administrator',
    management: 'Management',
    staff: 'Staff/Guru'
};

const roleColors = {
    admin: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    management: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    staff: 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
};

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff' as 'admin' | 'management' | 'staff'
    });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        fetchUsers();
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/user`);
            setCurrentUserId(response.data.id);
        } catch (error) {
            console.error('Failed to fetch current user:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/users`);
            setUsers(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'staff' });
        setShowModal(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't prefill password
            role: user.role
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = { ...formData };

            // If editing and password is empty, remove it from payload
            if (editingUser && !payload.password) {
                delete (payload as any).password;
            }

            if (editingUser) {
                // Update existing user
                await axios.put(`http://127.0.0.1:8000/api/users/${editingUser.id}`, payload);
            } else {
                // Create new user
                await axios.post(`http://127.0.0.1:8000/api/users`, payload);
            }
            await fetchUsers();
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', role: 'staff' });
        } catch (error: any) {
            console.error('Failed to save user:', error);
            const errorMsg = error.response?.data?.message || 'Gagal menyimpan user. Silakan coba lagi.';
            alert(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (id === currentUserId) {
            alert('Anda tidak dapat menghapus akun Anda sendiri.');
            setDeleteConfirm(null);
            return;
        }

        try {
            await axios.delete(`http://127.0.0.1:8000/api/users/${id}`);
            await fetchUsers();
            setDeleteConfirm(null);
        } catch (error: any) {
            console.error('Failed to delete user:', error);
            const errorMsg = error.response?.data?.message || 'Gagal menghapus user. Silakan coba lagi.';
            alert(errorMsg);
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
                    <h3 className="font-bold text-slate-100">Manajemen User</h3>
                    <p className="text-xs text-slate-400">Kelola user dan hak akses sistem</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium text-sm transition shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={18} /> Tambah User
                </button>
            </div>

            {/* Table */}
            <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-800/50 text-slate-400 font-medium">
                        <tr>
                            <th className="px-4 py-3 text-left">Nama</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-center">Role</th>
                            <th className="px-4 py-3 text-left">Dibuat</th>
                            <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-800/30 transition">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-slate-200">{user.name}</span>
                                        {user.id === currentUserId && (
                                            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                                                You
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-400">{user.email}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`${roleColors[user.role]} px-2 py-1 rounded text-xs font-bold inline-flex items-center gap-1`}>
                                        <Shield size={12} />
                                        {roleLabels[user.role]}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-400 text-xs">
                                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(user.id)}
                                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded transition disabled:opacity-30 disabled:hover:bg-transparent"
                                            title="Hapus"
                                            disabled={user.id === currentUserId}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                    Belum ada user. Klik "Tambah User" untuk menambahkan.
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
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#1e293b]/30">
                            <h3 className="text-lg font-bold text-slate-100">
                                {editingUser ? 'Edit User' : 'Tambah User Baru'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="user@schoolguard.com"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">
                                    Password {editingUser && <span className="text-slate-500 font-normal">(Kosongkan jika tidak diubah)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'management' | 'staff' })}
                                    className="w-full px-4 py-2 bg-[#1e293b] border border-slate-700 text-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    <option value="staff">Staff/Guru</option>
                                    <option value="management">Management</option>
                                    <option value="admin">Administrator</option>
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
                        <h3 className="text-lg font-bold text-slate-100 mb-2">Hapus User?</h3>
                        <p className="text-sm text-slate-400 mb-6">
                            Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
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
