import React from 'react';
import { MapPin, Phone, Heart, Sparkles } from 'lucide-react';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface FooterProps {
  onNavigateToAdmin?: () => void;
  clinicAddress?: string;
  whatsappNumber?: string;
  operatingHours?: string;
  instagramHandle?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateToAdmin,
  clinicAddress = 'Ds. Purwosari Dusun VI 47 RT 001/017, Dusun III, Pecangakan, Kec. Comal, Kabupaten Pemalang, Jawa Tengah 52363',
  whatsappNumber = '0878-5696-0422',
  operatingHours = 'Buka setiap hari hingga pukul 18.00 WIB',
  instagramHandle = '@indahmombabyspa_comal',
}) => {
  const cleanDigits = whatsappNumber.replace(/[^0-9]/g, '');
  const waLink = cleanDigits.startsWith('0') ? '62' + cleanDigits.slice(1) : cleanDigits;

  return (
    <footer className="bg-[#2F0B3D] text-white pt-16 pb-10 border-t border-accent/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-white p-0.5 shadow-md border-2 border-accent/50 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Logo Indah Mom Baby Spa Comal"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-white block leading-tight">
                  Indah Mom & Baby Spa
                </span>
                <span className="text-[11px] text-accent font-semibold tracking-wider uppercase">
                  Comal - Pemalang
                </span>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Pusat perawatan spa profesional dan ramah untuk Bunda, bayi, dan anak-anak di Comal.
              Ditangani langsung oleh Bidan bersertifikat resmi demi tumbuh kembang optimal dan kehangatan keluarga.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${waLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent text-white flex items-center justify-center transition-colors"
                title="WhatsApp Bidan"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={`https://instagram.com/${instagramHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent text-white flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Treatment (Updated to New 12 Services) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif font-bold text-sm text-accent tracking-wide uppercase">
              Layanan Treatment Pilihan
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>
                <a href="#layanan" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-accent" />
                  <span>Baby Spa (Gymball, Swim, Massage)</span>
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-accent" />
                  <span>Pijat Terapi (Bapil, Kolik, Diare, Sembelit)</span>
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-accent" />
                  <span>Paket Bapil (Sinar, Massage, Uap)</span>
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-accent" />
                  <span>Perawatan Newborn & Tindik Steril</span>
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-accent" />
                  <span>Mom Treatment (Hamil, Nifas, Laktasi, Oksitosin)</span>
                </a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-accent" />
                  <span>Facial, Totok Wajah & Masker</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif font-bold text-sm text-accent tracking-wide uppercase">
              Kontak & Operasional
            </h4>
            <div className="space-y-2.5 text-xs text-white/75">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span className="leading-relaxed">{clinicAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <span>WhatsApp / Telepon: {whatsappNumber}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <InstagramIcon className="w-4 h-4 text-accent shrink-0" />
                <span>Instagram: {instagramHandle}</span>
              </div>
              <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 text-[11px]">
                <strong className="text-white block font-semibold mb-0.5">Jam Operasional:</strong>
                <span className="text-white/80">{operatingHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} Indah Mom & Baby Spa Comal. Hak Cipta Dilindungi.</span>
          </p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-white/70">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-accent fill-accent" />
              <span>for Bunda & Si Kecil</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
