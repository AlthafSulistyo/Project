// src/services/cctvService.ts
import api from './api';
import { DashboardStats, CctvEvent } from '../types';

export const cctvService = {
  // Ambil ringkasan statistik (untuk Kartu Atas Dashboard)
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Ambil list kejadian terbaru (untuk Panel Kanan)
  getRecentEvents: async (): Promise<CctvEvent[]> => {
    const response = await api.get('/events/recent');
    return response.data;
  },
  
  // Ambil semua log dengan filter (untuk Halaman Laporan)
  getAllEvents: async (startDate: string, endDate: string) => {
    const response = await api.get(`/events?start=${startDate}&end=${endDate}`);
    return response.data;
  }
};