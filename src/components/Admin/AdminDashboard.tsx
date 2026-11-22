import React, { useState } from 'react';
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
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { BookingsTab } from './BookingsTab';
import { ServicesTab } from './ServicesTab';
import { BlockedSlotsTab } from './BlockedSlotsTab';
import { SettingsTab } from './SettingsTab';
import { TestimonialsTab } from './TestimonialsTab';

interface AdminDashboardProps {
  adminPin: string;
  onLogout: () => void;
  onBackToHome: () => void;
}

export type AdminTab = 'bookings' | 'services' | 'testimonials' | 'blocked' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminPin,
  onLogout,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');

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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'bookings' && <BookingsTab adminPin={adminPin} />}
        {activeTab === 'services' && <ServicesTab adminPin={adminPin} />}
        {activeTab === 'testimonials' && <TestimonialsTab adminPin={adminPin} />}
        {activeTab === 'blocked' && <BlockedSlotsTab adminPin={adminPin} />}
        {activeTab === 'settings' && <SettingsTab adminPin={adminPin} />}
      </main>
    </div>
  );
};
