import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Sparkles, Clock, AlertCircle, MessageCircle } from 'lucide-react';
import { ClinicOperationalStatus } from '../types';

interface NavbarProps {
  onNavigateToAdmin?: () => void;
  onSelectBooking?: () => void;
  whatsappNumber?: string;
  operationalStatus?: ClinicOperationalStatus;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectBooking,
  whatsappNumber = '6287856960422',
  operationalStatus,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cleanDigits = whatsappNumber.replace(/[^0-9]/g, '');
  const cleanWa = cleanDigits.startsWith('0') ? '62' + cleanDigits.slice(1) : cleanDigits;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      {/* Banner Status Operasional Real-Time (Homecare / Tutup Hari Ini) */}
      {operationalStatus && operationalStatus.status !== 'open' && (
        <div
          className={`py-2 px-3 sm:px-6 text-xs font-medium text-white shadow-sm transition-all ${
            operationalStatus.status === 'busy_homecare'
              ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 border-b border-amber-800/20'
              : 'bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 border-b border-rose-800/20'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {operationalStatus.status === 'busy_homecare' ? (
                <Clock className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-200" />
              )}
              <div className="truncate text-[11px] sm:text-xs">
                <strong className="font-bold">
                  {operationalStatus.status === 'busy_homecare'
                    ? 'Bidan Sedang Kunjungan Homecare / Persalinan:'
                    : 'Pemberitahuan Praktik:'}
                </strong>{' '}
                <span>
                  {operationalStatus.note ||
                    (operationalStatus.status === 'busy_homecare'
                      ? 'Reservasi online tetap dibuka, konfirmasi jadwal & kunjungan akan dihubungi via WA.'
                      : 'Klinik hari ini tutup sementara. Bunda tetap dapat membuat reservasi untuk hari berikutnya.')}
                </span>
              </div>
            </div>

            <a
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                operationalStatus.status === 'busy_homecare'
                  ? 'Halo Bidan Indah, saya ingin bertanya terkait jadwal reservasi / homecare hari ini.'
                  : 'Halo Bidan Indah, saya ingin konsultasi terkait jadwal perawatan Si Kecil.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <MessageCircle className="w-3 h-3" />
              <span>Hubungi WA</span>
            </a>
          </div>
        </div>
      )}

      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-primary/10 py-3'
            : 'bg-cream/90 backdrop-blur-sm py-4 border-b border-primary/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Logo & Brand Name */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1 md:flex-initial"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-full overflow-hidden bg-white shadow-md border-2 border-accent/40 p-0.5 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="Logo Indah Mom & Baby Spa Comal"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-serif font-bold text-sm sm:text-lg md:text-xl text-primary tracking-tight leading-tight truncate sm:whitespace-nowrap">
                  Indah Mom & Baby Spa
                </span>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-widest bg-accent/20 text-accent-dark px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                  Comal
                </span>
              </div>
              <p className="text-xs text-charcoal-light font-medium hidden sm:block whitespace-nowrap truncate">
                Perawatan Lembut Bunda & Buah Hati
              </p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-8 whitespace-nowrap">
            <button
              onClick={() => handleScrollTo('layanan')}
              className="text-sm font-semibold text-charcoal hover:text-primary transition-colors whitespace-nowrap"
            >
              Layanan
            </button>
            <button
              onClick={() => handleScrollTo('tentang-bidan')}
              className="text-sm font-semibold text-charcoal hover:text-primary transition-colors whitespace-nowrap"
            >
              Tentang
            </button>
            <button
              onClick={() => handleScrollTo('reservasi')}
              className="text-sm font-semibold text-charcoal hover:text-primary transition-colors whitespace-nowrap"
            >
              Reservasi
            </button>
            <button
              onClick={() => handleScrollTo('ulasan')}
              className="text-sm font-semibold text-charcoal hover:text-primary transition-colors whitespace-nowrap"
            >
              Ulasan
            </button>
            <button
              onClick={() => handleScrollTo('lokasi')}
              className="text-sm font-semibold text-charcoal hover:text-primary transition-colors whitespace-nowrap"
            >
              Lokasi
            </button>
          </nav>

          {/* Desktop Right Action CTA */}
          <div className="hidden md:flex items-center shrink-0">
            <button
              onClick={() => {
                if (onSelectBooking) onSelectBooking();
                handleScrollTo('reservasi');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-dark text-white font-bold text-sm shadow-gold transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Reservasi Sekarang</span>
            </button>
          </div>

          {/* Mobile Action Buttons (< md) */}
          <div className="flex items-center gap-2 md:hidden shrink-0">
            <button
              onClick={() => {
                if (onSelectBooking) onSelectBooking();
                handleScrollTo('reservasi');
              }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-accent hover:bg-accent-dark text-white font-bold shadow-sm shrink-0 whitespace-nowrap transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Booking</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-charcoal hover:text-primary hover:bg-primary/5 focus:outline-none shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-bounce-in">
          <div className="grid gap-2">
            <button
              onClick={() => handleScrollTo('layanan')}
              className="flex items-center justify-between py-2 px-3 rounded-lg text-left font-medium text-charcoal hover:bg-cream hover:text-primary"
            >
              <span>Layanan</span>
              <Sparkles className="w-4 h-4 text-accent" />
            </button>
            <button
              onClick={() => handleScrollTo('tentang-bidan')}
              className="flex items-center justify-between py-2 px-3 rounded-lg text-left font-medium text-charcoal hover:bg-cream hover:text-primary"
            >
              <span>Tentang</span>
            </button>
            <button
              onClick={() => handleScrollTo('reservasi')}
              className="flex items-center justify-between py-2 px-3 rounded-lg text-left font-medium text-charcoal hover:bg-cream hover:text-primary"
            >
              <span>Reservasi</span>
            </button>
            <button
              onClick={() => handleScrollTo('ulasan')}
              className="flex items-center justify-between py-2 px-3 rounded-lg text-left font-medium text-charcoal hover:bg-cream hover:text-primary"
            >
              <span>Ulasan</span>
              <Sparkles className="w-4 h-4 text-accent" />
            </button>
            <button
              onClick={() => handleScrollTo('lokasi')}
              className="flex items-center justify-between py-2 px-3 rounded-lg text-left font-medium text-charcoal hover:bg-cream hover:text-primary"
            >
              <span>Lokasi</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                if (onSelectBooking) onSelectBooking();
                handleScrollTo('reservasi');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-white font-bold text-sm shadow-gold"
            >
              <Calendar className="w-4 h-4" />
              <span>Reservasi Sekarang</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
