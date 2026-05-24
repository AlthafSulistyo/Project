import { useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';

export default function GlobalNotification() {
  const lastNotifiedId = useRef<string | null>(null);

  useEffect(() => {
    // Minta izin notifikasi browser
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    const qLatestEvents = query(
      collection(db, 'cctv_events'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(qLatestEvents, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const eventId = change.doc.id;
          const severity = data.severity?.toLowerCase() || 'low';
          const isReviewed = data.status === 'reviewed' || data.is_reviewed || false;

          if (severity === 'high' && !isReviewed) {
            // Cek agar tidak muncul dua kali untuk data yang sama
            if (lastNotifiedId.current !== eventId) {
              lastNotifiedId.current = eventId;

              // 1. Munculkan Toast UI (merah)
              toast.error(`BAHAYA TERDETEKSI: ${data.camera_name || 'Kamera'}`, {
                description: `Sistem mendeteksi ${data.category || data.event_type || 'Aktivitas Mencurigakan'}. Segera periksa!`,
                duration: 8000,
                position: 'top-right',
                style: {
                  background: '#f43f5e',
                  color: 'white',
                  border: 'none',
                  fontWeight: 'bold'
                }
              });

              // 2. Munculkan System OS Notification
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("⚠️ BAHAYA TERDETEKSI!", {
                  body: `Terdeteksi di ${data.camera_name || 'Kamera'}`,
                  requireInteraction: true
                });
              }
              
              // 3. Play alert sound (optional)
              try {
                const audio = new Audio('/alert.mp3');
                audio.play().catch(() => {});
              } catch (e) {}
            }
          }
        }
      });
    }, (error) => {
      console.error("GlobalNotification Listener Error:", error);
    });

    return () => unsubscribe();
  }, []);

  return null;
}
