import axios from 'axios';

// Ganti URL ini sesuai alamat server Laravel Anda nanti
// Backend API berjalan di port 5174
const API_BASE_URL = 'http://localhost:5174/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor: Otomatis sisipkan Token di setiap request (jika sudah login)
// Ini berguna agar backend tahu siapa user yang sedang login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;