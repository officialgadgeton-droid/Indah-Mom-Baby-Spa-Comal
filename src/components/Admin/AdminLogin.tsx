import React, { useState } from 'react';
import { Lock, Delete, ArrowRight, ShieldCheck, Home } from 'lucide-react';
import { verifyAdminPin } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

interface AdminLoginProps {
  onSuccess: (pin: string) => void;
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToHome }) => {
  const [pin, setPin] = useState<string>('');
  const [rememberSession, setRememberSession] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const { error, success } = useToast();

  const handleDigitClick = (digit: string) => {
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
    setPin(prev => prev.slice(0, -1));
    setHasError(false);
  };

  const handleClear = () => {
    setPin('');
    setHasError(false);
  };

  const verify = async (pinToVerify: string) => {
    setIsVerifying(true);
    try {
      const isValid = await verifyAdminPin(pinToVerify);
      if (isValid) {
        if (rememberSession) {
          sessionStorage.setItem('imb_admin_pin', pinToVerify);
        }
        success('Selamat datang kembali, Bidan Indah!');
        onSuccess(pinToVerify);
      } else {
        setHasError(true);
        error('PIN Admin salah. Silakan coba lagi.');
        setPin('');
      }
    } catch (e) {
      console.error(e);
      error('Gagal memverifikasi PIN.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2F0B3D] via-[#5B2C6F] to-[#1F2937] flex flex-col items-center justify-center p-4">
      {/* Return to Home Button */}
      <button
        onClick={onBackToHome}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Kembali ke Halaman Utama</span>
      </button>

      <div
        className={`bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-white/20 transition-transform ${
          hasError ? 'animate-shake ring-2 ring-rose-500' : ''
        }`}
      >
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-cream mx-auto p-1 border-2 border-accent/40 shadow-md flex items-center justify-center mb-3">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-[11px] font-bold text-accent uppercase tracking-widest bg-accent/15 px-3 py-1 rounded-full">
            Area Khusus Bidan
          </span>
          <h2 className="font-serif font-bold text-2xl text-primary mt-2">
            Masuk Panel Admin
          </h2>
          <p className="text-xs text-charcoal-light mt-1">
            Masukkan PIN 6 Digit untuk mengelola jadwal & layanan
          </p>
        </div>

        {/* PIN Dots Indicator (Prevents Password Manager prompt) */}
        <div className="flex justify-center items-center gap-3 mb-6">
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

        {/* Virtual Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              disabled={isVerifying}
              onClick={() => handleDigitClick(num)}
              className="h-12 rounded-2xl bg-cream hover:bg-cream-200 active:scale-95 text-primary font-bold text-lg shadow-sm border border-slate-200 transition-all"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={isVerifying}
            onClick={handleClear}
            className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-charcoal-light text-xs font-bold transition-all"
          >
            HAPUS
          </button>
          <button
            type="button"
            disabled={isVerifying}
            onClick={() => handleDigitClick('0')}
            className="h-12 rounded-2xl bg-cream hover:bg-cream-200 active:scale-95 text-primary font-bold text-lg shadow-sm border border-slate-200 transition-all"
          >
            0
          </button>
          <button
            type="button"
            disabled={isVerifying}
            onClick={handleDelete}
            className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-charcoal-light transition-all"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Remember Session Option */}
        <div className="flex items-center justify-between text-xs text-charcoal-light pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberSession}
              onChange={e => setRememberSession(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <span>Ingat Sesi di Tab Ini</span>
          </label>

          <span className="text-[10px] text-slate-400">PIN Bawaan: 123456</span>
        </div>
      </div>
    </div>
  );
};
