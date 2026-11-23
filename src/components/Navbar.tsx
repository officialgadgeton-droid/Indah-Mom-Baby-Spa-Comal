import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Calendar,
  Sparkles,
  Clock,
  AlertCircle,
  MessageCircle,
  Home,
  UserCheck,
  HelpCircle,
  MessageSquareHeart,
  MapPin,
  Smartphone,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { ClinicOperationalStatus } from '../types';
import { usePwaInstall } from '../lib/usePwaInstall';
import { PwaInstallModal } from './PwaInstallModal';
import { TikTokIcon } from './TikTokSection';

interface NavbarProps {
  onNavigateToAdmin?: () => void;
  onSelectBooking?: () => void;
  whatsappNumber?: string;
  operationalStatus?: ClinicOperationalStatus;
  isDrawerOpen?: boolean;
  setIsDrawerOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectBooking,
  whatsappNumber = '6287856960422',
  operationalStatus,
  isDrawerOpen: controlledDrawerOpen,
  setIsDrawerOpen: setControlledDrawerOpen,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);

  // PWA Installation Hook
  const { isInstallable, isInstalled, isIos, installApp, showGuideModal, setShowGuideModal } =
    usePwaInstall();

  // Dukungan controlled atau uncontrolled drawer state
  const isDrawerOpen =
    controlledDrawerOpen !== undefined ? controlledDrawerOpen : internalDrawerOpen;
  const setDrawerOpen = (open: boolean) => {
    if (setControlledDrawerOpen) {
      setControlledDrawerOpen(open);
    } else {
      setInternalDrawerOpen(open);
    }
  };

  const cleanDigits = whatsappNumber.replace(/[^0-9]/g, '');
  const cleanWa = cleanDigits.startsWith('0') ? '62' + cleanDigits.slice(1) : cleanDigits;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll background saat drawer terbuka
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleScrollTo = (id?: string) => {
    setDrawerOpen(false);
    if (!id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getStatusBadge = () => {
    if (!operationalStatus || operationalStatus.status === 'open') {
      return {
        label: 'Buka Normal',
        title: 'Klinik Buka Normal Hari Ini',
        color: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        dot: 'bg-emerald-500',
        note: 'Praktik klinik & kunjungan homecare beroperasi normal hari ini.',
      };
    }
    if (operationalStatus.status === 'busy_homecare') {
      return {
        label: 'Sedang Homecare / Persalinan',
        title: 'Info Praktik Hari Ini: Bidan Sedang Bertugas Homecare / Persalinan',
        color: 'bg-amber-50 text-amber-950 border-amber-300',
        dot: 'bg-amber-500 animate-ping',
        note:
          operationalStatus.note ||
          'Bidan sedang bertugas di luar/persalinan, reservasi online tetap berjalan & akan segera dikonfirmasi via WhatsApp.',
      };
    }
    return {
      label: 'Klinik Tutup Sementara',
      title: 'Info Praktik Hari Ini: Klinik Tutup Sementara',
      color: 'bg-rose-50 text-rose-950 border-rose-300',
      dot: 'bg-rose-500',
      note:
        operationalStatus.note ||
        'Praktik klinik hari ini tutup/libur. Bunda tetap dapat memilih jadwal reservasi untuk hari berikutnya.',
    };
  };

  const statusInfo = getStatusBadge();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
        {/* Banner Status Operasional Real-Time (Homecare / Tutup Hari Ini) */}
        {operationalStatus && operationalStatus.status !== 'open' && (
          <div
            className={`py-2 px-3 sm:px-6 text-xs font-medium text-white shadow-sm transition-all ${
              operationalStatus.status === 'busy_homecare'
                ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 border-b border-amber-700/20'
                : 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 border-b border-rose-700/20'
            }`}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {operationalStatus.status === 'busy_homecare' ? (
                  <Clock className="w-4 h-4 shrink-0 animate-pulse text-amber-100" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-100" />
                )}
                <div className="truncate text-[11px] sm:text-xs">
                  <strong className="font-bold">
                    {operationalStatus.status === 'busy_homecare'
                      ? 'Info Praktik Hari Ini: Bidan Sedang Bertugas Homecare / Persalinan'
                      : 'Info Praktik Hari Ini: Klinik Tutup Sementara'}
                  </strong>{' '}
                  <span className="opacity-95">
                    —{' '}
                    {operationalStatus.note ||
                      (operationalStatus.status === 'busy_homecare'
                        ? 'Bidan sedang bertugas di luar/persalinan, reservasi online tetap berjalan & akan segera dikonfirmasi via WhatsApp.'
                        : 'Praktik klinik hari ini tutup/libur. Bunda tetap dapat memilih jadwal reservasi untuk hari berikutnya.')}
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

        {/* Main Navbar Bar */}
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
                    className="w-full h-full rounded-full object-cover"
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
                  onClick={() => handleScrollTo('cara-reservasi')}
                  className="text-sm font-semibold text-charcoal hover:text-primary transition-colors whitespace-nowrap"
                >
                  Cara Reservasi
                </button>
                <button
                  onClick={() => handleScrollTo('ulasan')}
                  className="text-sm font-semibold text-charcoal hover:text-primary transition-colors whitespace-nowrap"
                >
                  Ulasan
                </button>
                <button
                  onClick={() => handleScrollTo('tiktok')}
                  className="text-sm font-semibold text-charcoal hover:text-primary transition-colors whitespace-nowrap"
                >
                  TikTok
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

                {/* Mobile Hamburger Drawer Trigger */}
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="p-1.5 rounded-lg text-charcoal hover:text-primary hover:bg-primary/5 focus:outline-none shrink-0"
                  aria-label="Buka menu navigasi"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MOBILE LEFT SIDEBAR DRAWER (Slide-over Dari Kiri ke Kanan) */}
      {/* ========================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop Gelap Transparan */}
          <div
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel Container */}
          <div className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-r border-purple-100 animate-slide-right pb-[env(safe-area-inset-bottom)]">
            {/* 1. Header Drawer */}
            <div className="p-4 bg-gradient-to-b from-primary/5 via-cream to-white border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.5 shadow-sm border border-accent/40 shrink-0 flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-serif font-bold text-sm text-primary tracking-tight truncate">
                      Indah Mom & Baby Spa
                    </h2>
                    <span className="text-[9px] uppercase font-bold tracking-wider bg-accent/20 text-accent-dark px-1 py-0.5 rounded shrink-0">
                      Comal
                    </span>
                  </div>
                  <p className="text-[10px] text-charcoal-light truncate font-medium">
                    Bidan Indah Rahayu, S.Tr.Keb.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-charcoal-light hover:text-charcoal hover:bg-slate-100 transition-colors"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Card Status Operasional Hari Ini (Sidebar Mobile) */}
              <div
                className={`p-3.5 rounded-2xl border text-xs ${statusInfo.color} transition-all shadow-xs space-y-2`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="font-bold text-[10px] tracking-wider uppercase opacity-75">
                    Status Operasional
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/80 border border-current shadow-2xs">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${statusInfo.dot}`}
                    />
                    {statusInfo.label}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-snug">
                    {statusInfo.title}
                  </h4>
                  <p className="text-[11px] leading-relaxed mt-1 opacity-90">
                    {statusInfo.note}
                  </p>
                </div>
                {operationalStatus && operationalStatus.status !== 'open' && (
                  <a
                    href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                      operationalStatus.status === 'busy_homecare'
                        ? 'Halo Bidan Indah, saya ingin bertanya terkait jadwal reservasi / homecare hari ini.'
                        : 'Halo Bidan Indah, saya ingin konsultasi terkait jadwal perawatan Si Kecil.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl text-[11px] font-bold text-white bg-primary hover:bg-primary-dark transition-colors shadow-2xs mt-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Konsultasi WA Langsung</span>
                  </a>
                )}
              </div>

              {/* Daftar Navigasi Lengkap */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-light/70 px-2 pt-1 pb-1">
                  Menu Utama
                </p>

                <button
                  onClick={() => handleScrollTo()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-charcoal hover:bg-primary/5 hover:text-primary active:bg-primary/10 transition-colors"
                >
                  <Home className="w-4 h-4 text-accent-dark shrink-0" />
                  <span className="flex-1">Beranda</span>
                </button>

                <button
                  onClick={() => handleScrollTo('layanan')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-charcoal hover:bg-primary/5 hover:text-primary active:bg-primary/10 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-accent-dark shrink-0" />
                  <span className="flex-1">Layanan Treatment</span>
                </button>

                <button
                  onClick={() => handleScrollTo('tentang-bidan')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-charcoal hover:bg-primary/5 hover:text-primary active:bg-primary/10 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-accent-dark shrink-0" />
                  <span className="flex-1">Tentang Bidan</span>
                </button>

                <button
                  onClick={() => handleScrollTo('cara-reservasi')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-charcoal hover:bg-primary/5 hover:text-primary active:bg-primary/10 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-accent-dark shrink-0" />
                  <span className="flex-1">Cara Reservasi</span>
                </button>

                <button
                  onClick={() => handleScrollTo('ulasan')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-charcoal hover:bg-primary/5 hover:text-primary active:bg-primary/10 transition-colors"
                >
                  <MessageSquareHeart className="w-4 h-4 text-accent-dark shrink-0" />
                  <span className="flex-1">Ulasan Bunda</span>
                </button>

                <button
                  onClick={() => handleScrollTo('tiktok')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-charcoal hover:bg-primary/5 hover:text-primary active:bg-primary/10 transition-colors"
                >
                  <TikTokIcon className="w-4 h-4 text-accent-dark shrink-0" />
                  <span className="flex-1">Galeri Video TikTok</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#FE2C55]/10 text-[#FE2C55]">
                    10,9k+
                  </span>
                </button>

                <button
                  onClick={() => handleScrollTo('lokasi')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-charcoal hover:bg-primary/5 hover:text-primary active:bg-primary/10 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-accent-dark shrink-0" />
                  <span className="flex-1">Lokasi Klinik</span>
                </button>
              </div>

              {/* Tombol Aksi Cepat */}
              <div className="pt-2 space-y-2 border-t border-slate-100">
                {/* 1. Tombol Booking Sekarang */}
                <button
                  onClick={() => {
                    if (onSelectBooking) onSelectBooking();
                    handleScrollTo('reservasi');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-accent via-accent-dark to-accent text-white font-bold text-xs shadow-gold hover:opacity-95 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Booking Sekarang</span>
                </button>

                {/* 2. Tombol Chat WhatsApp Bidan */}
                <a
                  href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                    'Halo Bidan Indah, saya ingin tanya informasi jadwal & konsultasi perawatan Mom & Baby Spa Comal.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat WhatsApp Bidan</span>
                </a>

                {/* 3. Tautan Profil TikTok Resmi */}
                <a
                  href="https://www.tiktok.com/@indah_mom.baby_spa_comal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#121212] hover:bg-black text-white font-bold text-xs shadow-xs transition-colors border border-white/10"
                >
                  <TikTokIcon className="w-4 h-4 text-[#FE2C55]" />
                  <span>TikTok @indah_mom.baby_spa_comal</span>
                </a>

                {/* 3. Tombol Install PWA ke HP */}
                <button
                  onClick={() => {
                    if (isInstalled) {
                      return;
                    }
                    installApp();
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                    isInstalled
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 cursor-default'
                      : 'bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 shadow-xs'
                  }`}
                >
                  {isInstalled ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Aplikasi Terpasang di HP ✓</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 text-primary" />
                      <span>Install Aplikasi ke HP (PWA)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 3. Footer Drawer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-charcoal-light">
              <p className="font-semibold text-primary">Indah Mom & Baby Spa Comal</p>
              <p className="text-slate-400 mt-0.5">Versi Web & Mobile PWA 1.0.0</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Panduan PWA Install */}
      <PwaInstallModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        isIos={isIos}
        onDirectInstall={installApp}
        hasDirectPrompt={isInstallable}
      />
    </>
  );
};
