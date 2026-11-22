import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Sparkles } from 'lucide-react';

interface NavbarProps {
  onNavigateToAdmin?: () => void;
  onSelectBooking?: () => void;
  whatsappNumber?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectBooking,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-primary/10 py-3'
          : 'bg-cream/90 backdrop-blur-sm py-4 border-b border-primary/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand Name (Single Line, No Wrap) */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 group shrink-0 whitespace-nowrap"
          >
            <div className="w-11 h-11 shrink-0 rounded-full overflow-hidden bg-white shadow-md border-2 border-accent/40 p-0.5 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="Logo Indah Mom & Baby Spa Comal"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="whitespace-nowrap">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-serif font-bold text-lg sm:text-xl text-primary tracking-tight leading-tight whitespace-nowrap">
                  Indah Mom & Baby Spa
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-accent/20 text-accent-dark px-1.5 py-0.5 rounded whitespace-nowrap">
                  Comal
                </span>
              </div>
              <p className="text-xs text-charcoal-light font-medium hidden sm:block whitespace-nowrap">
                Perawatan Lembut Bunda & Buah Hati
              </p>
            </div>
          </a>

          {/* Desktop Navigation (Concise 1-word labels, 1 line) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 whitespace-nowrap">
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

          {/* Right Action CTA (Single Primary Button, 1 line) */}
          <div className="hidden sm:flex items-center shrink-0">
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

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => {
                if (onSelectBooking) onSelectBooking();
                handleScrollTo('reservasi');
              }}
              className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-white font-bold text-xs shadow-sm whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reservasi</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal hover:text-primary hover:bg-primary/5 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-bounce-in">
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
