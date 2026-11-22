import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { useToast } from '../../context/ToastContext';

interface AdminPortalProps {
  mode: 'admin' | 'all';
  onBackToHome?: () => void;
}

const STORAGE_KEYS = {
  PIN: 'imb_admin_pin',
  SESSION_START: 'imb_admin_session_start',
  LAST_ACTIVITY: 'imb_admin_last_activity',
};

// Batas waktu sesi keamanan admin
const MAX_SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 jam maksimal sesi aktif
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 menit auto-lock jika tidak ada aktivitas

export const AdminPortal: React.FC<AdminPortalProps> = ({ mode, onBackToHome }) => {
  const { warning } = useToast();
  const lastActivityRef = useRef<number>(Date.now());

  const clearAdminSession = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEYS.PIN);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_START);
    sessionStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
  }, []);

  // Inisialisasi status autentikasi dari sessionStorage dengan validasi batas waktu
  const [adminPin, setAdminPin] = useState<string | null>(() => {
    const pin = sessionStorage.getItem(STORAGE_KEYS.PIN);
    if (!pin) return null;

    const sessionStart = parseInt(sessionStorage.getItem(STORAGE_KEYS.SESSION_START) || '0', 10);
    const lastActivity = parseInt(sessionStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY) || '0', 10);
    const now = Date.now();

    // Cek batas sesi 2 jam
    if (sessionStart && now - sessionStart > MAX_SESSION_DURATION_MS) {
      clearAdminSession();
      return null;
    }

    // Cek idle auto-lock 30 menit
    if (lastActivity && now - lastActivity > IDLE_TIMEOUT_MS) {
      clearAdminSession();
      return null;
    }

    sessionStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
    return pin;
  });

  const handleAdminSuccess = (pin: string) => {
    const now = Date.now();
    sessionStorage.setItem(STORAGE_KEYS.PIN, pin);
    sessionStorage.setItem(STORAGE_KEYS.SESSION_START, now.toString());
    sessionStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
    lastActivityRef.current = now;
    setAdminPin(pin);
  };

  const handleAdminLogout = useCallback(() => {
    clearAdminSession();
    setAdminPin(null);
  }, [clearAdminSession]);

  const handleBack = () => {
    const isAdminMode = mode === 'admin' || import.meta.env.VITE_APP_MODE === 'admin';
    if (isAdminMode) {
      window.open('https://indah-mom-baby-spa-comal.pages.dev', '_blank', 'noopener,noreferrer');
    } else if (onBackToHome) {
      onBackToHome();
    }
  };

  // Tracking aktivitas pengguna untuk idle auto-lock (30 menit) & batas durasi (2 jam)
  useEffect(() => {
    if (!adminPin) return;

    const handleUserInteraction = () => {
      const now = Date.now();
      // Throttle pembaruan sessionStorage tiap 5 detik
      if (now - lastActivityRef.current > 5000) {
        lastActivityRef.current = now;
        sessionStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
      }
    };

    const trackedEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    trackedEvents.forEach(eventName => {
      window.addEventListener(eventName, handleUserInteraction, { passive: true });
    });

    // Pengecekan berkala setiap 10 detik
    const timerInterval = window.setInterval(() => {
      const now = Date.now();
      const sessionStart = parseInt(sessionStorage.getItem(STORAGE_KEYS.SESSION_START) || '0', 10);
      const lastActivity = parseInt(sessionStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY) || '0', 10);

      // 1. Cek sesi melebihi 2 jam
      if (sessionStart && now - sessionStart >= MAX_SESSION_DURATION_MS) {
        handleAdminLogout();
        warning('Sesi admin telah berakhir (batas maksimal 2 jam). Silakan masukkan PIN kembali.');
        return;
      }

      // 2. Cek inaktivitas melebihi 30 menit
      if (lastActivity && now - lastActivity >= IDLE_TIMEOUT_MS) {
        handleAdminLogout();
        warning('Sesi admin terkunci otomatis karena tidak ada aktivitas selama 30 menit.');
        return;
      }
    }, 10000);

    return () => {
      trackedEvents.forEach(eventName => {
        window.removeEventListener(eventName, handleUserInteraction);
      });
      clearInterval(timerInterval);
    };
  }, [adminPin, handleAdminLogout, warning]);

  if (!adminPin) {
    return (
      <AdminLogin
        mode={mode}
        onSuccess={handleAdminSuccess}
        onBackToHome={handleBack}
      />
    );
  }

  return (
    <AdminDashboard
      adminPin={adminPin}
      onLogout={handleAdminLogout}
      onBackToHome={handleBack}
    />
  );
};

export default AdminPortal;
