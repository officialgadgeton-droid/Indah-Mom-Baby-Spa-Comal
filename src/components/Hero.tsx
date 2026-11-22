import React from 'react';
import { Calendar, Phone, Award, Sparkles, HeartHandshake, CheckCircle2, Home } from 'lucide-react';
import { SpaBubbles } from './SpaBubbles';

interface HeroProps {
  onBookClick: () => void;
  whatsappNumber?: string;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick, whatsappNumber = '6287856960422' }) => {
  const cleanDigits = whatsappNumber.replace(/[^0-9]/g, '');
  const cleanWa = cleanDigits.startsWith('0') ? '62' + cleanDigits.slice(1) : cleanDigits;

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-[#FAF4FD] via-[#FDFBF7] to-cream">
      {/* 1. Ambient Gradient Blobs (Deep Plum #4A154B/10 & Warm Gold #D4AF37/15) - Floating Smoothly */}
      <div
        className="absolute -top-12 left-1/4 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none z-0 animate-float-slow-1 opacity-90"
        style={{
          background: 'radial-gradient(circle, rgba(74, 21, 75, 0.12) 0%, rgba(91, 44, 111, 0.04) 60%, transparent 80%)',
        }}
      />
      <div
        className="absolute top-1/3 -right-24 w-[380px] h-[380px] rounded-full blur-3xl pointer-events-none z-0 animate-float-slow-2 opacity-85"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.16) 0%, rgba(197, 155, 39, 0.05) 60%, transparent 80%)',
        }}
      />
      <div
        className="absolute -bottom-10 left-10 w-[320px] h-[320px] rounded-full blur-3xl pointer-events-none z-0 animate-float-slow-1 opacity-70"
        style={{
          background: 'radial-gradient(circle, rgba(74, 21, 75, 0.08) 0%, rgba(212, 175, 55, 0.06) 50%, transparent 75%)',
        }}
      />

      {/* 2. Floating Spa Bubbles Particles */}
      <SpaBubbles count={7} className="opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-primary/15 shadow-sm text-xs font-semibold text-primary transition-all duration-300 hover:shadow-md">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Klinik Mom & Baby Spa Terpercaya di Comal</span>
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-primary tracking-tight leading-[1.18]">
              Perawatan Penuh Kelembutan untuk{' '}
              <span className="text-primary italic font-serif relative">
                Bunda & Buah Hati
                <svg
                  className="absolute left-0 -bottom-1.5 w-full h-2 text-accent"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                >
                  <path d="M0,15 Q50,0 100,15" />
                </svg>
              </span>{' '}
              di Comal
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-charcoal-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Ditangani langsung oleh <strong className="text-primary font-bold">Bidan bersertifikat resmi</strong>. 
              Membantu tumbuh kembang optimal Si Kecil, meredakan rewel & flu, serta menghadirkan relaksasi pemulihan 
              paripurna bagi Bunda tercinta.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onBookClick}
                className="btn-shimmer w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-accent hover:bg-accent-dark text-white font-bold text-base shadow-gold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
              >
                <Calendar className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Booking Jadwal Sekarang</span>
              </button>

              <a
                href={`https://wa.me/${cleanWa}?text=Halo%20Bidan%20Indah,%20saya%20ingin%20konsultasi%20layanan%20treatment%20spa%20di%20Comal`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-white hover:bg-primary/5 text-primary font-semibold text-base border-2 border-primary/20 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md active:translate-y-0"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Konsultasi WA</span>
              </a>
            </div>

            {/* Value Highlights Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-primary/10 text-xs">
              <div className="flex items-center gap-2 text-charcoal">
                <Award className="w-4 h-4 text-accent shrink-0" />
                <span className="font-semibold">Bidan Resmi</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span className="font-semibold">Bahan Alami 100%</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal">
                <HeartHandshake className="w-4 h-4 text-accent shrink-0" />
                <span className="font-semibold">Ruang Steril</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal">
                <Home className="w-4 h-4 text-accent shrink-0" />
                <span className="font-semibold">Layanan Homecare</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Card Presentation */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md">
              {/* Outer decorative card */}
              <div className="relative rounded-3xl bg-white p-4 sm:p-5 shadow-card border border-primary/10 overflow-hidden transition-all duration-300 hover:shadow-xl">
                {/* Banner Suasana Treatment / Klinik */}
                <div className="relative h-44 sm:h-48 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-[#7A288A] via-[#9438A5] to-[#B3782E] shadow-inner group">
                  {/* Fallback ambient styling */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/40 pointer-events-none" />
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-accent/30 rounded-full blur-xl pointer-events-none" />
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/20 rounded-full blur-lg pointer-events-none" />

                  {/* Badges & Text Overlay */}
                  <div className="relative z-10 h-full flex flex-col justify-between p-3.5 sm:p-4 text-white">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-primary shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        <span>Suasana Nyaman & Hangat</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/90 backdrop-blur-md text-[10px] font-bold text-white shadow-sm">
                        100% Higienis
                      </span>
                    </div>

                    <div className="bg-black/35 backdrop-blur-sm rounded-xl p-2.5 border border-white/15">
                      <p className="text-[11px] font-medium text-white/90">Klinik Mom & Baby Spa Comal</p>
                      <p className="text-xs sm:text-sm font-bold font-serif text-white">Ruang Treatment Tenang & Ramah Bayi</p>
                    </div>
                  </div>

                  {/* Photo with Graceful Fallback */}
                  <img
                    src="/hero-spa.jpg"
                    alt="Suasana Klinik Indah Mom & Baby Spa Comal"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Brand Showcase Area */}
                <div className="relative rounded-2xl bg-gradient-to-br from-[#F5E8FB] to-[#FDFBF7] p-3.5 sm:p-4 text-center border border-primary/10">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm p-1 border-2 border-accent/40 flex items-center justify-center shrink-0">
                      <img
                        src="/logo.png"
                        alt="Logo Indah Mom & Baby Spa"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-primary leading-tight">
                        Indah Mom & Baby Spa
                      </h3>
                      <p className="text-[11px] text-charcoal-light font-medium">
                        Kecamatan Comal, Kabupaten Pemalang
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-primary/10 flex items-center justify-center gap-1 text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-sm">★</span>
                    ))}
                    <span className="text-xs font-bold text-charcoal ml-1">5.0 (Rating 5,0 di Google Maps)</span>
                  </div>
                </div>

                {/* Floating Features List */}
                <div className="mt-3.5 space-y-2">
                  <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-cream/70 border border-primary/5 text-xs text-charcoal transition-colors hover:bg-cream">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <strong className="block font-semibold text-primary">Baby Treatment Terlengkap</strong>
                      <span>Swim hangat, pijat bayi sehat, & pijat terapi bapil/kolik</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-cream/70 border border-primary/5 text-xs text-charcoal transition-colors hover:bg-cream">
                    <div className="w-7 h-7 rounded-lg bg-accent/20 text-accent-dark flex items-center justify-center font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <strong className="block font-semibold text-primary">Mom Treatment Spesialis</strong>
                      <span>Pijat laktasi melancarkan ASI & oksitosin menenangkan.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-cream/70 border border-primary/5 text-xs text-charcoal transition-colors hover:bg-cream">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <strong className="block font-semibold text-primary">Bidan Datang ke Rumah (Homecare)</strong>
                      <span>Kenyamanan maksimal tanpa Bunda & bayi harus keluar rumah.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge with Soft Bobbing Animation */}
              <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-accent/30 flex items-center gap-3 animate-float-badge z-20">
                <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-charcoal-light">Slot Terbatas Harian</div>
                  <div className="text-xs font-bold text-primary">Jadwal Real-Time Bebas Antre</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
