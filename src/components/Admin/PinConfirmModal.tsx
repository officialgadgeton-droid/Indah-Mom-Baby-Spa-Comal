import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Lock, AlertCircle, X, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { verifyAdminPin } from '../../lib/supabase';

export interface PinConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  itemSummary: React.ReactNode;
  warningText?: string;
  confirmButtonText?: string;
  onConfirm: (enteredPin: string) => Promise<void> | void;
}

export const PinConfirmModal: React.FC<PinConfirmModalProps> = ({
  isOpen,
  onClose,
  title = 'Konfirmasi Hapus Permanen',
  itemSummary,
  warningText = 'Tindakan ini permanen dan tidak dapat dibatalkan. Seluruh data terkait akan dihapus dari sistem.',
  confirmButtonText = 'Verifikasi & Hapus Permanen',
  onConfirm,
}) => {
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setShowPin(false);
      setErrorMsg(null);
      setIsSubmitting(false);
      // Auto focus ke input PIN setelah animasi modal
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedPin = pin.trim();
    if (trimmedPin.length !== 6) {
      setErrorMsg('Harap masukkan 6 digit PIN Admin.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Verifikasi PIN terlebih dahulu
      const isValid = await verifyAdminPin(trimmedPin);
      if (!isValid) {
        setErrorMsg('PIN Admin tidak valid! Silakan periksa dan coba lagi.');
        setIsSubmitting(false);
        inputRef.current?.focus();
        return;
      }

      // 2. Jalankan aksi konfirmasi
      await onConfirm(trimmedPin);
      // onConfirm sukses -> modal ditutup oleh parent
    } catch (err: unknown) {
      console.error('Error saat verifikasi & hapus:', err);
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat memproses penghapusan data.';
      setErrorMsg(msg);
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setPin(val);
    if (errorMsg) setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-50 to-amber-50/50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-rose-950 leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-rose-700/80 mt-0.5">
                Memerlukan Otorisasi PIN Bidan / Admin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-all disabled:opacity-50"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Ringkasan Item yang Akan Dihapus */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Data yang Dipilih:
            </span>
            {itemSummary}
          </div>

          {/* Peringatan Bahaya Permanen */}
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{warningText}</span>
          </div>

          {/* Input 6-Digit PIN Admin */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-charcoal flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                Masukkan 6-Digit PIN Admin:
              </span>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-normal"
              >
                {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPin ? 'Sembunyikan' : 'Lihat'}</span>
              </button>
            </label>

            <div className="relative">
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                value={pin}
                onChange={handlePinChange}
                disabled={isSubmitting}
                placeholder="••••••"
                className={`w-full py-2.5 px-4 text-center text-xl tracking-[0.4em] font-mono rounded-xl border transition-all outline-none ${
                  errorMsg
                    ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-charcoal'
                }`}
              />
            </div>

            {/* Error Message Inline (Tanpa Menutup Modal) */}
            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold pt-1 animate-shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-charcoal hover:bg-slate-50 font-bold text-xs transition-all disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting || pin.length !== 6}
              className="flex-[1.4] py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{confirmButtonText}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
