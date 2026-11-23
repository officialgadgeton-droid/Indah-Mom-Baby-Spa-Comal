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
  const activeAdminPin = (adminPin && adminPin.trim()) || getAdminSessionPin();

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

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Admin Header */}
      <header className="bg-white border-b border-primary/10 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Admin Tag */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cream p-1 border border-accent/40 flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif font-bold text-base sm:text-lg text-primary leading-none">
                    Indah Mom & Baby Spa
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/20 text-accent-dark px-2 py-0.5 rounded-md">
                    Admin Panel
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
                className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-charcoal text-xs font-semibold"
                title="Buka Landing Page"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lihat Web</span>
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

          {/* Navigation Tabs */}
          <div className="flex space-x-1 sm:space-x-4 border-t border-slate-100 overflow-x-auto no-scrollbar">
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

      {/* Sakelar Cepat Status Operasional Real-Time */}
      <div className="bg-gradient-to-r from-white via-cream/50 to-white border-b border-primary/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Status Current Label & Indicator */}
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    opStatus === 'open'
                      ? 'bg-emerald-400'
                      : opStatus === 'busy_homecare'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    opStatus === 'open'
                      ? 'bg-emerald-500'
                      : opStatus === 'busy_homecare'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              </span>
              <div>
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-accent" />
                  Status Operasional Real-Time:
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      opStatus === 'open'
                        ? 'bg-emerald-100 text-emerald-800'
                        : opStatus === 'busy_homecare'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {opStatus === 'open'
                      ? 'Buka Normal'
                      : opStatus === 'busy_homecare'
                      ? 'Sedang Homecare / Persalinan'
                      : 'Tutup Praktik Hari Ini'}
                  </span>
                </span>
                {opNote && (
                  <p className="text-[11px] text-charcoal-light truncate max-w-md mt-0.5">
                    Catatan Publik: <span className="italic font-medium">"{opNote}"</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick 3 Status Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpStatus('open');
                  handleSaveOperational('open');
                }}
                disabled={isSavingOpStatus}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  opStatus === 'open'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
                title="Atur status operasional klinik: Buka Normal"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Buka Normal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpStatus('busy_homecare');
                  handleSaveOperational('busy_homecare');
                }}
                disabled={isSavingOpStatus}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  opStatus === 'busy_homecare'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300'
                }`}
                title="Atur status operasional: Sedang Homecare / Membantu Persalinan"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Sedang Homecare / Persalinan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpStatus('closed_today');
                  handleSaveOperational('closed_today');
                }}
                disabled={isSavingOpStatus}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  opStatus === 'closed_today'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white hover:bg-rose-50 text-rose-800 border-rose-200'
                }`}
                title="Atur status operasional: Tutup Praktik Hari Ini"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Tutup Hari Ini</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpExpanded(!isOpExpanded)}
                className="px-2.5 py-1.5 text-xs text-primary/80 hover:text-primary font-semibold hover:bg-primary/5 rounded-lg border border-primary/20 transition-colors"
                title="Tulis catatan operasional untuk Bunda di website"
              >
                {isOpExpanded ? 'Tutup Catatan' : '+ Catatan Publik'}
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
    </div>
  );
};
