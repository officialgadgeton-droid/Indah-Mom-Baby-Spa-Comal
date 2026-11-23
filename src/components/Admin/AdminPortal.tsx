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
  SESSION_PIN: 'indah_spa_session_pin',
  SESSION_START: 'imb_admin_session_start',
  LAST_ACTIVITY: 'imb_admin_last_activity',
};

// Batas waktu sesi keamanan admin
const MAX_SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 jam maksimal sesi aktif
const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 60 menit auto-lock jika tab/pengguna tidak aktif (idle timeout)

export const AdminPortal: React.FC<AdminPortalProps> = ({ mode, onBackToHome }) => {
  const { warning } = useToast();
  const lastActivityRef = useRef<number>(Date.now());

  const clearAdminSession = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEYS.PIN);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_PIN);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_START);
    sessionStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
    sessionStorage.removeItem('indah_spa_tab_hidden_at');
  }, []);

  // Inisialisasi status autentikasi dari sessionStorage dengan validasi batas waktu
  const [adminPin, setAdminPin] = useState<string | null>(() => {
    const pin = sessionStorage.getItem(STORAGE_KEYS.SESSION_PIN) || sessionStorage.getItem(STORAGE_KEYS.PIN);
    if (!pin) return null;

    const sessionStart = parseInt(sessionStorage.getItem(STORAGE_KEYS.SESSION_START) || '0', 10);
    const lastActivity = parseInt(sessionStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY) || '0', 10);
    const now = Date.now();

    // Cek batas sesi 2 jam
    if (sessionStart && now - sessionStart > MAX_SESSION_DURATION_MS) {
      clearAdminSession();
      return null;
    }

    // Cek idle auto-lock 60 menit
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
    sessionStorage.setItem(STORAGE_KEYS.SESSION_PIN, pin);
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
    const publicUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://indahmombabyspa.com';
    if (isAdminMode) {
      window.open(publicUrl, '_blank', 'noopener,noreferrer');
    } else if (onBackToHome) {
      onBackToHome();
    }
  };

  // Tracking aktivitas pengguna untuk idle auto-lock (60 menit) & batas durasi (2 jam)
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

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sessionStorage.setItem('indah_spa_tab_hidden_at', Date.now().toString());
      } else {
        const hiddenAt = parseInt(sessionStorage.getItem('indah_spa_tab_hidden_at') || '0', 10);
        const lastAct = parseInt(sessionStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY) || '0', 10);
        const now = Date.now();

        if ((hiddenAt && now - hiddenAt >= IDLE_TIMEOUT_MS) || (lastAct && now - lastAct >= IDLE_TIMEOUT_MS)) {
          handleAdminLogout();
          warning('Sesi admin telah berakhir karena tab tidak aktif lebih dari 60 menit.');
          return;
        }
        handleUserInteraction();
      }
    };

    const trackedEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    trackedEvents.forEach(eventName => {
      window.addEventListener(eventName, handleUserInteraction, { passive: true });
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);

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

      // 2. Cek inaktivitas melebihi 60 menit (idle timeout)
      if (lastActivity && now - lastActivity >= IDLE_TIMEOUT_MS) {
        handleAdminLogout();
        warning('Sesi admin telah berakhir karena tab tidak aktif lebih dari 60 menit.');
        return;
      }
    }, 10000);

    return () => {
      trackedEvents.forEach(eventName => {
        window.removeEventListener(eventName, handleUserInteraction);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
