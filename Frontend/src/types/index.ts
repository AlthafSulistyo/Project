// src/types/index.ts

export interface CctvEvent {
  id: number;
  camera_name: string;
  event_type: 'intrusion' | 'line_crossing' | 'loitering';
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  image_url?: string; // URL snapshot kejadian
}

export interface DashboardStats {
  total_events: number;
  active_cameras: number;
  critical_alerts: number;
}