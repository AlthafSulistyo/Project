import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Shield } from 'lucide-react';

export default function Login() {
    const [userId, setUserId] = useState('1'); // Default ke 1
    const [password, setPassword] = useState('password'); // Default ke password
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setDebugInfo('');
        setLoading(true);

        try {
            setDebugInfo(`Mencoba login dengan User ID: ${userId}...`);
            await login(userId, password);
            setDebugInfo('Login berhasil! Redirecting...');
            navigate('/');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Login gagal, silakan coba lagi');
            setDebugInfo(`Error detail: ${JSON.stringify(err.response?.data || err.message)}`);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fill for testing
    useEffect(() => {
        setUserId('1');
        setPassword('password');
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 flex items-center justify-center p-6">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>

            <div className="relative w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
                        <Shield className="text-white" size={40} />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">SchoolGuard</h1>
                    <p className="text-blue-100">Sistem Keamanan Sekolah</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Masuk ke Sistem</h2>
                        <p className="text-slate-500 text-sm mt-1">Gunakan akun administrator Anda</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-red-800 text-sm font-medium">Login Gagal</p>
                                <p className="text-red-600 text-xs mt-0.5">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Debug Info */}
                    {debugInfo && (
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800 text-xs font-mono">{debugInfo}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* User ID Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Mail size={16} className="text-blue-600" />
                                ID User
                            </label>
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-slate-800 font-medium"
                                placeholder="Masukkan User ID"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Lock size={16} className="text-blue-600" />
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-slate-800 font-medium"
                                placeholder="Masukkan Password"
                                required
                            />
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6 active:scale-95"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-bold text-blue-900 mb-3">✨ Demo Credentials (3 Roles):</p>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-bold">ADMIN</span>
                                <span className="font-mono text-slate-700">ID: 1 | password</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold">MANAGEMENT</span>
                                <span className="font-mono text-slate-700">ID: 2 | password</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-bold">STAFF</span>
                                <span className="font-mono text-slate-700">ID: 3 | password</span>
                            </div>
                        </div>

                        <p className="text-xs text-green-700 mt-3 border-t border-blue-200 pt-2">
                            ✓ Default: Admin (ID=1) sudah terisi
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-white text-sm opacity-75">
                    <p>© 2026 SchoolGuard. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
