import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  CalendarOff,
  Settings,
  LogOut,
  Home,
  CheckCircle,
  Database,
  ExternalLink,
  MessageSquareHeart,
  Users,
  Activity,
  AlertCircle,
  XCircle,
  Save,
  Clock,
  Menu,
  X,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  getAdminSessionPin,
  fetchClinicOperationalStatus,
  updateClinicOperationalStatus,
} from '../../lib/supabase';
import { OperationalStatus, ClinicOperationalStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import { BookingsTab } from './BookingsTab';
import { CustomersTab } from './CustomersTab';
import { ServicesTab } from './ServicesTab';
import { BlockedSlotsTab } from './BlockedSlotsTab';
import { SettingsTab } from './SettingsTab';
import { TestimonialsTab } from './TestimonialsTab';
import { AdminMobileBottomNav } from '../MobileBottomNav';
import { usePwaInstall } from '../../lib/usePwaInstall';
import { PwaInstallModal } from '../PwaInstallModal';

interface AdminDashboardProps {
  adminPin: string;
  onLogout: () => void;
  onBackToHome: () => void;
}

export type AdminTab =
  | 'bookings'
  | 'customers'
  | 'services'
  | 'testimonials'
  | 'blocked'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminPin,
  onLogout,
  onBackToHome,
}) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const activeAdminPin = (adminPin && adminPin.trim()) || getAdminSessionPin();

  // PWA Install Hook
  const { isInstallable, isInstalled, isIos, installApp, showGuideModal, setShowGuideModal } =
    usePwaInstall();

  // Sakelar Status Operasional Real-Time
  const [opStatus, setOpStatus] = useState<OperationalStatus>('open');
  const [opNote, setOpNote] = useState<string>('');
  const [isSavingOpStatus, setIsSavingOpStatus] = useState<boolean>(false);
  const [isOpExpanded, setIsOpExpanded] = useState<boolean>(false);

  useEffect(() => {
    const loadOpStatus = async () => {
      try {
        const res = await fetchClinicOperationalStatus();
        setOpStatus(res.status);
        setOpNote(res.note || '');
      } catch (e) {
        console.warn('Gagal memuat status operasional:', e);
      }
    };

    loadOpStatus();

    const handleOpUpdate = (e: any) => {
      if (e.detail) {
        setOpStatus(e.detail.status);
        setOpNote(e.detail.note || '');
      }
    };
    window.addEventListener('indah_spa_operational_status_updated', handleOpUpdate);
    return () => {
      window.removeEventListener('indah_spa_operational_status_updated', handleOpUpdate);
    };
  }, []);

  // Prevent background scroll saat drawer aktif
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

  const handleSaveOperational = async (targetStatus?: OperationalStatus) => {
    const statusToSave = targetStatus || opStatus;
    setIsSavingOpStatus(true);
    try {
      const ok = await updateClinicOperationalStatus(
        activeAdminPin,
        statusToSave,
        opNote
      );
      if (ok) {
        setOpStatus(statusToSave);
        success(
          `Status operasional berhasil diubah menjadi "${
            statusToSave === 'open'
              ? 'Buka Normal'
              : statusToSave === 'busy_homecare'
              ? 'Sedang Homecare / Persalinan'
              : 'Tutup Praktik Hari Ini'
          }" dan langsung tersinkronkan ke website publik.`
        );
      } else {
        error('Gagal memperbarui status operasional.');
      }
    } catch (err: any) {
      console.error(err);
      error(err.message || 'Terjadi kesalahan saat menyimpan status operasional.');
    } finally {
      setIsSavingOpStatus(false);
    }
  };

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col pb-24 md:pb-0">
      {/* Admin Header */}
      <header className="bg-white border-b border-primary/10 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Admin Tag */}
            <div className="flex items-center gap-3">
              {/* Mobile Drawer Hamburger Trigger */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="md:hidden p-1.5 rounded-lg text-charcoal hover:text-primary hover:bg-primary/5 focus:outline-none shrink-0"
                aria-label="Buka navigasi admin"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="w-10 h-10 rounded-full overflow-hidden bg-cream p-0.5 border border-accent/40 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="Logo" className="w-full h-full rounded-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif font-bold text-base sm:text-lg text-primary leading-none">
                    Indah Mom & Baby Spa
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/20 text-accent-dark px-2 py-0.5 rounded-md">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-light hidden sm:block mt-0.5">
                  Pengelolaan Operasional Klinik Bidan Indah Comal
                </p>
              </div>
            </div>

            {/* Right: Quick actions (View Site & Logout) */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                  isSupabaseConfigured
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
                title={
                  isSupabaseConfigured
                    ? 'Terhubung dengan Database Supabase Cloud'
                    : 'Mode Offline Local Storage aktif (Koneksi Supabase belum diset)'
                }
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Mode'}</span>
              </div>

              <button
                onClick={onBackToHome}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-charcoal text-xs font-semibold"
                title="Buka Landing Page"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Lihat Web</span>
              </button>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200"
                title="Keluar dari Panel Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex space-x-1 sm:space-x-4 border-t border-slate-100 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'bookings'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-charcoal-light hover:text-primary hover:border-slate-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Daftar Reservasi & Jadwal</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'customers'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-charcoal-light hover:text-primary hover:border-slate-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Data Pelanggan</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'services'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-charcoal-light hover:text-primary hover:border-slate-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Kelola Layanan & Harga</span>
            </button>

            <button
              onClick={() => setActiveTab('testimonials')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'testimonials'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-charcoal-light hover:text-primary hover:border-slate-300'
              }`}
            >
              <MessageSquareHeart className="w-4 h-4" />
              <span>Testimoni WA</span>
            </button>

            <button
              onClick={() => setActiveTab('blocked')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'blocked'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-charcoal-light hover:text-primary hover:border-slate-300'
              }`}
            >
              <CalendarOff className="w-4 h-4" />
              <span>Tutup Jadwal / Libur</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'settings'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-charcoal-light hover:text-primary hover:border-slate-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan Klinik</span>
            </button>
          </div>
        </div>
      </header>

      {/* Control Banner Status Operasional Real-Time */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl text-white shadow-xs shrink-0 ${
                  opStatus === 'open'
                    ? 'bg-emerald-600'
                    : opStatus === 'busy_homecare'
                    ? 'bg-amber-600 animate-pulse'
                    : 'bg-rose-600'
                }`}
              >
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                    Status Operasional Hari Ini:
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                      opStatus === 'open'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : opStatus === 'busy_homecare'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        opStatus === 'open'
                          ? 'bg-emerald-500'
                          : opStatus === 'busy_homecare'
                          ? 'bg-amber-500 animate-ping'
                          : 'bg-rose-500'
                      }`}
                    />
                    {opStatus === 'open'
                      ? 'Buka Normal'
                      : opStatus === 'busy_homecare'
                      ? 'Sedang Homecare / Persalinan'
                      : 'Tutup Praktik Hari Ini'}
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-light mt-0.5">
                  {opNote ||
                    (opStatus === 'open'
                      ? 'Klinik beroperasi normal sesuai jadwal reservasi.'
                      : opStatus === 'busy_homecare'
                      ? 'Bidan sedang bertugas di luar/persalinan, reservasi online tetap berjalan.'
                      : 'Klinik hari ini tidak menerima kunjungan tatap muka.')}
                </p>
              </div>
            </div>

            {/* Quick Action Pill Buttons */}
            <div className="flex items-center flex-wrap gap-1.5 shrink-0">
              <button
                type="button"
                disabled={isSavingOpStatus}
                onClick={() => handleSaveOperational('open')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  opStatus === 'open'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Buka Normal</span>
              </button>

              <button
                type="button"
                disabled={isSavingOpStatus}
                onClick={() => handleSaveOperational('busy_homecare')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  opStatus === 'busy_homecare'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Sedang Homecare</span>
              </button>

              <button
                type="button"
                disabled={isSavingOpStatus}
                onClick={() => handleSaveOperational('closed_today')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  opStatus === 'closed_today'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Tutup Hari Ini</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpExpanded(!isOpExpanded)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-charcoal hover:bg-slate-100 text-xs font-semibold"
                title="Tambahkan catatan khusus ke website publik"
              >
                {isOpExpanded ? 'Tutup Catatan' : 'Ubah Catatan'}
              </button>
            </div>
          </div>

          {/* Expanded note input */}
          {isOpExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-fade-in">
              <input
                type="text"
                value={opNote}
                onChange={(e) => setOpNote(e.target.value)}
                placeholder="Contoh: Bidan sedang kunjungan homecare hingga pukul 14.00 WIB, reservasi tetap dibuka"
                className="flex-1 px-3.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-charcoal bg-white"
              />
              <button
                type="button"
                onClick={() => handleSaveOperational()}
                disabled={isSavingOpStatus}
                className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingOpStatus ? 'Menyimpan...' : 'Simpan & Tayangkan Catatan'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'bookings' && <BookingsTab adminPin={activeAdminPin} />}
        {activeTab === 'customers' && <CustomersTab adminPin={activeAdminPin} />}
        {activeTab === 'services' && <ServicesTab adminPin={activeAdminPin} />}
        {activeTab === 'testimonials' && <TestimonialsTab adminPin={activeAdminPin} />}
        {activeTab === 'blocked' && <BlockedSlotsTab adminPin={activeAdminPin} />}
        {activeTab === 'settings' && <SettingsTab adminPin={activeAdminPin} />}
      </main>

      {/* ========================================================= */}
      {/* MOBILE LEFT SIDEBAR DRAWER ADMIN (Slide-over Khusus Mobile) */}
      {/* ========================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop Gelap Transparan */}
          <div
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel Container */}
          <div className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-r border-purple-100 pb-[env(safe-area-inset-bottom)]">
            {/* Header Drawer */}
            <div className="p-4 bg-gradient-to-b from-primary/5 via-cream to-white border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.5 shadow-sm border border-accent/40 shrink-0 flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-serif font-bold text-sm text-primary tracking-tight truncate">
                      Indah Mom & Baby Spa
                    </h2>
                    <span className="text-[9px] uppercase font-bold tracking-wider bg-accent/20 text-accent-dark px-1 py-0.5 rounded shrink-0">
                      Admin
                    </span>
                  </div>
                  <p className="text-[10px] text-charcoal-light truncate font-medium">
                    Panel Kontrol Bidan Indah Comal
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-charcoal-light hover:text-charcoal hover:bg-slate-100 transition-colors"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Tab Menu List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Database Status Indicator */}
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  isSupabaseConfigured
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <Database className="w-4 h-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[11px] leading-tight">
                    {isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Mode'}
                  </p>
                  <p className="text-[10px] opacity-80 mt-0.5 truncate">
                    {isSupabaseConfigured
                      ? 'Tersinkronisasi Cloud DB'
                      : 'Data tersimpan di browser'}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-light/70 px-2 pt-1 pb-1">
                  Navigasi Panel Admin
                </p>

                <button
                  onClick={() => handleSelectTab('bookings')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors ${
                    activeTab === 'bookings'
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-charcoal hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Daftar Reservasi & Jadwal</span>
                </button>

                <button
                  onClick={() => handleSelectTab('customers')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors ${
                    activeTab === 'customers'
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-charcoal hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Data Pelanggan</span>
                </button>

                <button
                  onClick={() => handleSelectTab('services')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors ${
                    activeTab === 'services'
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-charcoal hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Kelola Layanan & Harga</span>
                </button>

                <button
                  onClick={() => handleSelectTab('testimonials')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors ${
                    activeTab === 'testimonials'
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-charcoal hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <MessageSquareHeart className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Testimoni WA</span>
                </button>

                <button
                  onClick={() => handleSelectTab('blocked')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors ${
                    activeTab === 'blocked'
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-charcoal hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <CalendarOff className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Tutup Jadwal / Libur</span>
                </button>

                <button
                  onClick={() => handleSelectTab('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-charcoal hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Pengaturan Klinik</span>
                </button>
              </div>

              {/* Action Buttons in Drawer */}
              <div className="pt-2 space-y-2 border-t border-slate-100">
                {/* 1. Lihat Web Publik */}
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onBackToHome();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-charcoal font-semibold text-xs transition-colors"
                >
                  <Home className="w-4 h-4 text-charcoal-light" />
                  <span>Buka Website Publik</span>
                </button>

                {/* 2. Install Aplikasi Admin PWA */}
                <button
                  onClick={() => {
                    if (isInstalled) return;
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
                      <span>Admin PWA Terpasang ✓</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 text-primary" />
                      <span>Install Aplikasi Admin ke HP</span>
                    </>
                  )}
                </button>

                {/* 3. Keluar / Logout */}
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Keluar dari Panel Admin</span>
                </button>
              </div>
            </div>

            {/* Footer Drawer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-charcoal-light">
              <p className="font-semibold text-primary">Indah Mom & Baby Spa Comal</p>
              <p className="text-slate-400 mt-0.5">Admin Fullscreen PWA Portal</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Mobile Bottom Navigation Bar (Khusus Layar Mobile) */}
      <AdminMobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenMoreMenu={() => setIsDrawerOpen(true)}
      />

      {/* Modal Panduan PWA Install */}
      <PwaInstallModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        isIos={isIos}
        onDirectInstall={installApp}
        hasDirectPrompt={isInstallable}
      />
    </div>
  );
};
