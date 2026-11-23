import React from 'react';
import { X, Smartphone, Share, PlusSquare, MoreVertical, CheckCircle2 } from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIos: boolean;
  onDirectInstall?: () => void;
  hasDirectPrompt?: boolean;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  isIos,
  onDirectInstall,
  hasDirectPrompt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl z-10 border border-purple-100 animate-bounce-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-charcoal-light hover:text-charcoal hover:bg-slate-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-primary leading-snug">
              Pasang Aplikasi di HP
            </h3>
            <p className="text-xs text-charcoal-light">
              Pengalaman Fullscreen & Akses Cepat
            </p>
          </div>
        </div>

        <p className="text-xs text-charcoal mb-4 leading-relaxed">
          Nikmati tampilan aplikasi penuh <strong>tanpa bilah URL browser</strong>, lebih cepat dibuka, dan hemat kuota langsung dari layar utama HP Anda.
        </p>

        {/* Petunjuk Instalasi Berdasarkan Device */}
        {isIos ? (
          <div className="bg-cream/80 border border-accent/20 rounded-xl p-3.5 space-y-2.5 mb-5 text-xs text-charcoal">
            <p className="font-bold text-primary flex items-center gap-1.5">
              <Share className="w-4 h-4 text-accent-dark" />
              Cara Pasang di iPhone / iPad (Safari):
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] text-charcoal-light leading-relaxed">
              <li>
                Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="inline w-3 h-3 text-primary mx-0.5" /> di menu bawah Safari.
              </li>
              <li>
                Gulir ke bawah, lalu pilih <strong>&quot;Tambah ke Layar Utama&quot;</strong> (<em>Add to Home Screen</em>) <PlusSquare className="inline w-3 h-3 text-accent-dark mx-0.5" />.
              </li>
              <li>
                Ketuk tombol <strong>Tambah (Add)</strong> di pojok kanan atas. Aplikasi siap dibuka!
              </li>
            </ol>
          </div>
        ) : (
          <div className="bg-cream/80 border border-accent/20 rounded-xl p-3.5 space-y-2.5 mb-5 text-xs text-charcoal">
            <p className="font-bold text-primary flex items-center gap-1.5">
              <MoreVertical className="w-4 h-4 text-accent-dark" />
              Cara Pasang di Android (Chrome):
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] text-charcoal-light leading-relaxed">
              <li>
                Ketuk tombol menu titik tiga <strong>(⋮)</strong> di sudut kanan atas browser Chrome.
              </li>
              <li>
                Pilih opsi <strong>&quot;Instal aplikasi&quot;</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>.
              </li>
              <li>
                Konfirmasi <strong>&quot;Instal&quot;</strong>. Ikon Indah Spa akan langsung muncul di HP Anda.
              </li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {hasDirectPrompt && onDirectInstall && (
            <button
              onClick={() => {
                onDirectInstall();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-dark text-white font-bold text-xs shadow-gold hover:opacity-95 transition-opacity"
            >
              <Smartphone className="w-4 h-4" />
              <span>Instal Sekarang Langsung</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-charcoal font-semibold text-xs transition-colors text-center"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
