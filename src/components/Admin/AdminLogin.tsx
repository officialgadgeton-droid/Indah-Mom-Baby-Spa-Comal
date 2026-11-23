import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Delete, ShieldCheck, Home, AlertCircle, Clock } from 'lucide-react';
import {
  getLocalSettings,
  getActivePinHash,
  hashPin,
  DEFAULT_ADMIN_PIN_HASH,
  isSupabaseConfigured,
} from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

interface AdminLoginProps {
  mode?: 'admin' | 'all';
  onSuccess: (pin: string) => void;
  onBackToHome: () => void;
}

const STORAGE_KEYS = {
  ATTEMPTS: 'indah_spa_pin_attempts',
  LOCKED_UNTIL: 'indah_spa_pin_locked_until',
};

// Batas Brute-Force & Lockout
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 Menit

// Hash SHA-256 bawaan untuk mode lokal dev jika VITE_ADMIN_PIN_HASH belum diset di .env
const DEFAULT_LOCAL_PIN_HASH = DEFAULT_ADMIN_PIN_HASH;

export const AdminLogin: React.FC<AdminLoginProps> = ({ mode, onSuccess, onBackToHome }) => {
  const [pin, setPin] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const { error, success } = useToast();

  const [remainingAttempts, setRemainingAttempts] = useState<number>(() => {
    const attempts = parseInt(localStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '0', 10);
    return Math.max(0, MAX_ATTEMPTS - attempts);
  });

  const [lockedUntil, setLockedUntil] = useState<number | null>(() => {
    const lockedStr = localStorage.getItem(STORAGE_KEYS.LOCKED_UNTIL);
    if (!lockedStr) return null;
    const time = parseInt(lockedStr, 10);
    return time > Date.now() ? time : null;
  });

  const [lockoutRemainingSec, setLockoutRemainingSec] = useState<number>(() => {
    const lockedStr = localStorage.getItem(STORAGE_KEYS.LOCKED_UNTIL);
    if (!lockedStr) return 0;
    const diff = parseInt(lockedStr, 10) - Date.now();
    return diff > 0 ? Math.ceil(diff / 1000) : 0;
  });

  const isLocked = lockedUntil !== null && lockoutRemainingSec > 0;
  const isAdminMode = mode === 'admin' || import.meta.env.VITE_APP_MODE === 'admin';

  // Timer hitung mundur sisa waktu lockout anti-brute-force
  useEffect(() => {
    if (!lockedUntil) return;

    const tick = () => {
      const diff = lockedUntil - Date.now();
      if (diff <= 0) {
        setLockedUntil(null);
        setLockoutRemainingSec(0);
        setRemainingAttempts(MAX_ATTEMPTS);
        localStorage.removeItem(STORAGE_KEYS.LOCKED_UNTIL);
        localStorage.setItem(STORAGE_KEYS.ATTEMPTS, '0');
      } else {
        setLockoutRemainingSec(Math.ceil(diff / 1000));
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [lockedUntil]);

  // Format detik menjadi mm:ss
  const formatCountdown = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDigitClick = (digit: string) => {
    if (isLocked || isVerifying) return;

    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setHasError(false);
      if (newPin.length === 6) {
        verify(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (isLocked || isVerifying) return;
    setPin(prev => prev.slice(0, -1));
    setHasError(false);
  };

  const handleClear = () => {
    if (isLocked || isVerifying) return;
    setPin('');
    setHasError(false);
  };

  // Fungsi helper untuk menghitung SHA-256 via Web Crypto API
  const calculateSha256 = async (rawString: string): Promise<string> => {
    return hashPin(rawString);
  };

  const verify = async (pinToVerify: string) => {
    if (isLocked) return;

    setIsVerifying(true);
    try {
      // 1. Hitung hash SHA-256 dari input PIN
      const inputHash = await calculateSha256(pinToVerify);

      // 2. Ambil hash target terbaru dari Supabase (clinic_settings dengan .maybeSingle())
      //    terlebih dahulu sebelum membandingkan dengan hash input PIN
      const expectedHash = await getActivePinHash();

      // Bandingkan hash input dengan expectedHash dari cloud / fallback
      let isValid = inputHash === expectedHash;

      // Hanya gunakan fallback localStorage pengaturan lama jika Supabase tidak dikonfigurasi atau sedang offline
      if (!isValid && !isSupabaseConfigured) {
        const settings = getLocalSettings();
        if (!localStorage.getItem('indah_spa_custom_pin_hash') && settings.admin_pin) {
          const localSettingHash = await calculateSha256(settings.admin_pin);
          if (inputHash === localSettingHash) {
            isValid = true;
          }
        }
      }

      if (isValid) {
        // Reset counter kegagalan saat PIN benar
        localStorage.setItem(STORAGE_KEYS.ATTEMPTS, '0');
        localStorage.removeItem(STORAGE_KEYS.LOCKED_UNTIL);
        setRemainingAttempts(MAX_ATTEMPTS);
        setLockedUntil(null);
        setLockoutRemainingSec(0);

        // Simpan PIN sesi sementara untuk kebutuhan otorisasi RPC admin
        sessionStorage.setItem('indah_spa_session_pin', pinToVerify);
        sessionStorage.setItem('imb_admin_pin', pinToVerify);

        success('PIN Terverifikasi. Selamat datang kembali, Bidan Indah!');
        onSuccess(pinToVerify);
      } else {
        // Increment kegagalan
        const currentAttempts = parseInt(localStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '0', 10) + 1;
        localStorage.setItem(STORAGE_KEYS.ATTEMPTS, currentAttempts.toString());
        setHasError(true);
        setPin('');

        if (currentAttempts >= MAX_ATTEMPTS) {
          const lockTime = Date.now() + LOCKOUT_DURATION_MS;
          localStorage.setItem(STORAGE_KEYS.LOCKED_UNTIL, lockTime.toString());
          setLockedUntil(lockTime);
          setLockoutRemainingSec(Math.ceil(LOCKOUT_DURATION_MS / 1000));
          setRemainingAttempts(0);
          error('Terlalu banyak percobaan salah (5x). Keypad dikunci selama 15 menit!');
        } else {
          const sisa = MAX_ATTEMPTS - currentAttempts;
          setRemainingAttempts(sisa);
          error(`PIN salah. Sisa kesempatan mencoba: ${sisa} kali.`);
        }
      }
    } catch (e) {
      console.error('Error saat verifikasi PIN:', e);
      error('Gagal memverifikasi PIN.');
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  // Dukungan input keyboard fisik untuk desktop / laptop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked || isVerifying) return;
      if (/^[0-9]$/.test(e.key)) {
        handleDigitClick(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, isVerifying, pin]);

  const publicSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://indahmombabyspa.com';

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-x-hidden bg-gradient-to-br from-[#2F0B3D] via-[#5B2C6F] to-[#1F2937]">
      {/* Return to Home Link/Button */}
      {isAdminMode ? (
        <a
          href={publicSiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all border border-white/10 shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Halaman Utama</span>
        </a>
      ) : (
        <button
          type="button"
          onClick={onBackToHome}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all border border-white/10 shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>Kembali ke Halaman Utama</span>
        </button>
      )}

      {/* Main Login Card */}
      <div
        className={`bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-white/20 transition-all ${
          hasError ? 'animate-shake ring-2 ring-rose-500' : ''
        }`}
      >
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-cream mx-auto p-0.5 border-2 border-accent/40 shadow-md flex items-center justify-center mb-3">
            <img src="/logo.png" alt="Logo Indah Mom & Baby Spa" className="w-full h-full rounded-full object-cover" />
          </div>
          <span className="text-[11px] font-bold text-accent uppercase tracking-widest bg-accent/15 px-3 py-1 rounded-full">
            Area Khusus Bidan
          </span>
          <h2 className="font-serif font-bold text-2xl text-primary mt-2">
            Masuk Panel Admin
          </h2>
          <p className="text-xs text-charcoal-light mt-1">
            Masukkan PIN 6 Digit untuk verifikasi akses portal klinik
          </p>
        </div>

        {/* Lockout Warning Box or PIN Dots Indicator */}
        {isLocked ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 text-center animate-pulse">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Akses Terkunci Sementara
            </h4>
            <p className="text-[11px] text-rose-600 mt-1">
              Batas 5x percobaan terlampaui. Silakan tunggu:
            </p>
            <div className="text-2xl font-mono font-bold text-rose-700 mt-2 flex items-center justify-center gap-1.5">
              <Clock className="w-5 h-5" />
              <span>{formatCountdown(lockoutRemainingSec)}</span>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            {/* Input field dengan autoComplete="off" agar browser tidak menyimpan PIN di password manager */}
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-lpignore="true"
              data-form-type="other"
              name="admin_pin"
              id="admin_pin"
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPin(val);
                setHasError(false);
                if (val.length === 6) verify(val);
              }}
              className="sr-only"
              aria-label="PIN Admin 6 Digit"
              tabIndex={-1}
            />
            <div className="flex justify-center items-center gap-3">
              {[0, 1, 2, 3, 4, 5].map(idx => {
                const isFilled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      isFilled
                        ? 'bg-accent border-accent scale-110 shadow-sm'
                        : 'bg-cream border-slate-300'
                    }`}
                  />
                );
              })}
            </div>
            {remainingAttempts < MAX_ATTEMPTS && (
              <p className="text-center text-[11px] text-amber-600 font-medium mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Sisa percobaan: {remainingAttempts} dari {MAX_ATTEMPTS}</span>
              </p>
            )}
          </div>
        )}

        {/* Virtual Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              disabled={isLocked || isVerifying}
              onClick={() => handleDigitClick(num)}
              className={`h-12 rounded-2xl font-bold text-lg shadow-sm border transition-all ${
                isLocked || isVerifying
                  ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                  : 'bg-cream hover:bg-cream-200 active:scale-95 text-primary border-slate-200'
              }`}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={isLocked || isVerifying || pin.length === 0}
            onClick={handleClear}
            className={`h-12 rounded-2xl text-xs font-bold transition-all ${
              isLocked || isVerifying || pin.length === 0
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-slate-100 hover:bg-slate-200 active:scale-95 text-charcoal-light'
            }`}
          >
            HAPUS
          </button>
          <button
            type="button"
            disabled={isLocked || isVerifying}
            onClick={() => handleDigitClick('0')}
            className={`h-12 rounded-2xl font-bold text-lg shadow-sm border transition-all ${
              isLocked || isVerifying
                ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                : 'bg-cream hover:bg-cream-200 active:scale-95 text-primary border-slate-200'
            }`}
          >
            0
          </button>
          <button
            type="button"
            disabled={isLocked || isVerifying || pin.length === 0}
            onClick={handleDelete}
            className={`h-12 rounded-2xl flex items-center justify-center transition-all ${
              isLocked || isVerifying || pin.length === 0
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-slate-100 hover:bg-slate-200 active:scale-95 text-charcoal-light'
            }`}
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Cryptography Badges */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>Terproteksi Hash SHA-256 & Anti-Brute-Force</span>
        </div>
      </div>
    </div>
  );
};
