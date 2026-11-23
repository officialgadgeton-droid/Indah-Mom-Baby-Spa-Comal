import React from 'react';
import {
  Home,
  Sparkles,
  Calendar,
  MessageSquareHeart,
  Menu,
  Users,
  Settings,
  CalendarOff,
} from 'lucide-react';
import { AdminTab } from './Admin/AdminDashboard';

// ==========================================
// 1. PUBLIC MOBILE BOTTOM NAVIGATION BAR
// ==========================================
interface PublicMobileBottomNavProps {
  onOpenDrawer: () => void;
  onSelectBooking?: () => void;
}

export const PublicMobileBottomNav: React.FC<PublicMobileBottomNavProps> = ({
  onOpenDrawer,
  onSelectBooking,
}) => {
  const scrollTo = (id?: string) => {
    if (!id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBooking = () => {
    if (onSelectBooking) onSelectBooking();
    scrollTo('reservasi');
  };

  return (
    <nav
      aria-label="Navigasi Menu Bawah"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-purple-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around relative">
        {/* 1. Beranda */}
        <button
          onClick={() => scrollTo()}
          className="flex flex-col items-center justify-center flex-1 py-1 text-charcoal hover:text-primary active:scale-95 transition-all"
        >
          <Home className="w-5 h-5 text-charcoal-light group-hover:text-primary transition-colors" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight text-charcoal-light">
            Beranda
          </span>
        </button>

        {/* 2. Layanan */}
        <button
          onClick={() => scrollTo('layanan')}
          className="flex flex-col items-center justify-center flex-1 py-1 text-charcoal hover:text-primary active:scale-95 transition-all"
        >
          <Sparkles className="w-5 h-5 text-charcoal-light group-hover:text-primary transition-colors" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight text-charcoal-light">
            Layanan
          </span>
        </button>

        {/* 3. Booking (Tombol Tengah Menonjol Emas / Ungu) */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={handleBooking}
            className="flex flex-col items-center group focus:outline-none"
            aria-label="Reservasi Sekarang"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-accent-dark via-accent to-amber-300 text-white shadow-gold flex items-center justify-center border-4 border-white transition-all transform group-active:scale-95 group-hover:scale-105">
              <Calendar className="w-6 h-6 drop-shadow-xs" />
            </div>
            <span className="text-[10px] font-bold text-accent-dark mt-0.5 tracking-tight">
              Booking
            </span>
          </button>
        </div>

        {/* 4. Ulasan */}
        <button
          onClick={() => scrollTo('ulasan')}
          className="flex flex-col items-center justify-center flex-1 py-1 text-charcoal hover:text-primary active:scale-95 transition-all"
        >
          <MessageSquareHeart className="w-5 h-5 text-charcoal-light group-hover:text-primary transition-colors" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight text-charcoal-light">
            Ulasan
          </span>
        </button>

        {/* 5. Menu / Buka Sidebar Drawer */}
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center flex-1 py-1 text-charcoal hover:text-primary active:scale-95 transition-all"
        >
          <Menu className="w-5 h-5 text-charcoal-light group-hover:text-primary transition-colors" />
          <span className="text-[10px] font-semibold mt-1 tracking-tight text-charcoal-light">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};

// ==========================================
// 2. ADMIN MOBILE BOTTOM NAVIGATION BAR
// ==========================================
interface AdminMobileBottomNavProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onOpenMoreMenu?: () => void;
}

export const AdminMobileBottomNav: React.FC<AdminMobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenMoreMenu,
}) => {
  const isMoreTabActive = activeTab === 'blocked' || activeTab === 'settings';

  return (
    <nav
      aria-label="Navigasi Admin Bawah"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-purple-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-md mx-auto px-1 h-16 flex items-center justify-around">
        {/* 1. Reservasi */}
        <button
          onClick={() => onTabChange('bookings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'bookings'
              ? 'text-primary font-bold'
              : 'text-charcoal-light hover:text-primary font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'bookings' ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
            Reservasi
          </span>
        </button>

        {/* 2. Pelanggan */}
        <button
          onClick={() => onTabChange('customers')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'customers'
              ? 'text-primary font-bold'
              : 'text-charcoal-light hover:text-primary font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'customers' ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
            Pelanggan
          </span>
        </button>

        {/* 3. Layanan */}
        <button
          onClick={() => onTabChange('services')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'services'
              ? 'text-primary font-bold'
              : 'text-charcoal-light hover:text-primary font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'services' ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
            Layanan
          </span>
        </button>

        {/* 4. Testimoni */}
        <button
          onClick={() => onTabChange('testimonials')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'testimonials'
              ? 'text-primary font-bold'
              : 'text-charcoal-light hover:text-primary font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              activeTab === 'testimonials' ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
            Testimoni
          </span>
        </button>

        {/* 5. Lainnya / Pengaturan */}
        <button
          onClick={() => {
            if (onOpenMoreMenu) {
              onOpenMoreMenu();
            } else {
              onTabChange(activeTab === 'settings' ? 'blocked' : 'settings');
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isMoreTabActive
              ? 'text-primary font-bold'
              : 'text-charcoal-light hover:text-primary font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              isMoreTabActive ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            {activeTab === 'blocked' ? (
              <CalendarOff className="w-5 h-5" />
            ) : (
              <Settings className="w-5 h-5" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
            {activeTab === 'blocked' ? 'Libur' : 'Lainnya'}
          </span>
        </button>
      </div>
    </nav>
  );
};
