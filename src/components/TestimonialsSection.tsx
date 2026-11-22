import React, { useState, useEffect } from 'react';
import {
  Star,
  Quote,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  MessageCircle,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { Testimonial } from '../types';
import { fetchActiveTestimonials } from '../lib/supabase';
import { INITIAL_TESTIMONIALS } from '../data/initialTestimonials';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const TestimonialsSection: React.FC = () => {
  const googleMapsReviewsUrl = 'https://maps.app.goo.gl/c1cY4NA9KrtNzVz57';

  // Testimonials state (combined static initial + uploaded from Supabase / localStorage)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await fetchActiveTestimonials();
        if (data && data.length > 0) {
          setTestimonials(data);
        }
      } catch (err) {
        console.warn('Gagal memuat testimoni, menggunakan data default:', err);
      }
    };

    loadTestimonials();

    // Dengarkan perubahan localStorage jika admin mengupload di tab lain
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'indah_spa_testimonials') {
        loadTestimonials();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Keyboard navigation untuk Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % testimonials.length : null
        );
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + testimonials.length) % testimonials.length : null
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, testimonials.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  // Touch Swipe Handlers untuk HP
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) {
      handleNext();
    } else if (distance < -45) {
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const currentTestimonial = testimonials[currentIndex] || testimonials[0];

  const googleReviews = [
    {
      initial: 'M',
      author: 'Bunda M',
      avatarBg: 'bg-[#5B2C6F] text-[#F4E8C1]',
      badgeColor: 'bg-primary/10 text-primary',
      serviceTag: 'Google Review • Pelayanan Bidan & Treatment Bayi',
      comment: 'Puas dg pelayanan ibu bidan yg ramah, tretmennya jg bkin bdan adek jd enakan 🫶🙌',
      rating: 5,
    },
    {
      initial: 'N',
      author: 'Bunda N',
      avatarBg: 'bg-[#C59B27] text-white',
      badgeColor: 'bg-accent/15 text-accent-dark',
      serviceTag: 'Google Review • Tempat Estetik & Sharing Tumbuh Kembang',
      comment: 'Tempatnya estetik ..juga gampang diajak seringg tumbuh kembang anak 🥰🥰🥰🥰',
      rating: 5,
    },
    {
      initial: 'Z',
      author: 'Bunda Z',
      avatarBg: 'bg-[#2F0B3D] text-[#C59B27]',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      serviceTag: 'Google Review • Pelayanan Bidan Indah Memuaskan',
      comment: 'Masya Allah makasih bidan indah pelayanane bagus memuaskan Alhamdulillah. .',
      rating: 5,
    },
  ];

  return (
    <section id="ulasan" className="py-20 bg-gradient-to-b from-[#FAF4FD] via-[#FDFBF7] to-cream relative overflow-hidden">
      {/* Decorative Floating Orbs */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none animate-float-slow-2" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-float-slow-1" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title with Scroll Reveal */}
        <RevealOnScroll variant="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent/20 text-accent-dark text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Apa Kata Bunda?</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-3">
              Ulasan Asli & Bukti Kasih Bunda
            </h2>
            <p className="text-base text-charcoal-light max-w-2xl mx-auto">
              Kisah nyata penuh kehangatan dari para Bunda di Comal dan sekitarnya yang telah mempercayakan perawatan Si Kecil di Indah Mom & Baby Spa.
            </p>
          </div>
        </RevealOnScroll>

        {/* ======================================================== */}
        {/* FITUR 1: GALERI MOCKUP LAYAR HP TESTIMONI WHATSAPP       */}
        {/* ======================================================== */}
        {testimonials.length > 0 && (
          <RevealOnScroll variant="fade-up" delay={150}>
            <div className="mb-20 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-white via-cream/40 to-white rounded-3xl p-6 sm:p-10 border border-primary/10 shadow-card relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

                {/* Subheader Gallery */}
                <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tangkapan Layar Chat WhatsApp Asli</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
                    Bunda Berbagi Kebahagiaan
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-light mt-1">
                    Geser foto untuk melihat bukti kepuasan Bunda lainnya. Klik layar HP untuk membaca chat dalam resolusi penuh.
                  </p>
                </div>

                {/* Smartphone Mockup Container & Navigation */}
                <div className="relative flex flex-col items-center">
                  <div className="relative w-full max-w-md flex items-center justify-center">
                    {/* Previous Button (Desktop Side) */}
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="hidden sm:flex absolute -left-6 lg:-left-12 z-20 w-12 h-12 rounded-full bg-white shadow-card border border-primary/10 text-primary hover:bg-primary hover:text-white items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                      title="Testimoni Sebelumnya"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Next Button (Desktop Side) */}
                    <button
                      type="button"
                      onClick={handleNext}
                      className="hidden sm:flex absolute -right-6 lg:-right-12 z-20 w-12 h-12 rounded-full bg-white shadow-card border border-primary/10 text-primary hover:bg-primary hover:text-white items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                      title="Testimoni Selanjutnya"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* SMARTPHONE FRAME MOCKUP */}
                    <div
                      className="w-full max-w-[310px] sm:max-w-[340px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-[6px] border-slate-800 ring-1 ring-white/10 relative transition-transform duration-300 hover:shadow-2xl"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      {/* Top Dynamic Island / Notch Mockup */}
                      <div className="w-24 h-5 bg-black rounded-full mx-auto absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/80 mr-3" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                      </div>

                      {/* Phone Screen Area */}
                      <div
                        onClick={() => setLightboxIndex(currentIndex)}
                        className="rounded-[34px] overflow-hidden bg-slate-900 aspect-[9/17.5] relative cursor-pointer select-none group"
                        title="Klik untuk memperbesar foto"
                      >
                        {/* Display Current Testimonial Screenshot */}
                        {currentTestimonial && (
                          <img
                            key={currentTestimonial.id}
                            src={currentTestimonial.image_url}
                            alt={currentTestimonial.caption || 'Testimoni WhatsApp'}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                        )}

                        {/* Gloss glass reflection overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />

                        {/* Hover / Tap Pill: Klik untuk Perbesar */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/95 text-primary text-xs font-bold shadow-lg backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            <ZoomIn className="w-4 h-4 text-accent" />
                            <span>Klik untuk Perbesar</span>
                          </span>
                        </div>
                      </div>

                      {/* Home Indicator Bar (iPhone bottom pill) */}
                      <div className="w-28 h-1 bg-white/30 rounded-full mx-auto mt-2" />
                    </div>
                  </div>

                  {/* Mobile Navigation Controls & Caption */}
                  <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-md">
                    {/* Caption badge */}
                    {currentTestimonial?.caption && (
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-primary text-xs sm:text-sm font-bold text-center">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{currentTestimonial.caption}</span>
                      </div>
                    )}

                    {/* Mobile Prev / Next Arrows */}
                    <div className="flex sm:hidden items-center justify-center gap-4 w-full">
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-primary text-xs font-bold shadow-xs active:scale-95"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Sebelumnya</span>
                      </button>

                      <span className="text-xs font-bold text-charcoal-light">
                        {currentIndex + 1} / {testimonials.length}
                      </span>

                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-primary text-xs font-bold shadow-xs active:scale-95"
                      >
                        <span>Berikutnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Dot indicators & Thumbnail Selector */}
                    <div className="flex items-center gap-2 pt-2">
                      {testimonials.map((t, idx) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setCurrentIndex(idx)}
                          className={`transition-all duration-300 rounded-full ${
                            currentIndex === idx
                              ? 'w-8 h-2.5 bg-accent'
                              : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                          }`}
                          title={`Lihat Testimoni ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        )}

        {/* ======================================================== */}
        {/* FITUR 2: GOOGLE MAPS REVIEWS & 5.0 RATING BANNER         */}
        {/* ======================================================== */}

        {/* Header Ringkasan Rating Google Banner (Zoom-in Reveal) */}
        <RevealOnScroll variant="zoom-in" delay={100}>
          <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-[#2F0B3D] via-[#5B2C6F] to-[#481A5B] rounded-3xl p-6 sm:p-8 text-white shadow-card border border-accent/30 relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            {/* Subtle gold glow overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-center md:text-left">
              {/* Left: Google Brand & Score */}
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white p-3 shadow-lg flex items-center justify-center shrink-0 border border-white/20">
                  <GoogleIcon className="w-10 h-10" />
                </div>

                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <span className="font-serif text-4xl sm:text-5xl font-black text-white tracking-tight">
                      5,0
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[#F4E8C1]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-accent-light font-semibold tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                        <span>Rating Sempurna & Terverifikasi</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-white/90 font-medium mt-1">
                    Berdasarkan <strong className="text-accent underline decoration-accent/40 underline-offset-4">100 Ulasan</strong> di Google Maps
                  </p>
                </div>
              </div>

              {/* Right: CTA Button with Shimmer Effect */}
              <div className="shrink-0 w-full sm:w-auto">
                <a
                  href={googleMapsReviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-accent hover:bg-accent-dark text-white font-bold text-xs sm:text-sm shadow-gold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
                >
                  <span className="relative z-10">Lihat Semua 100 Ulasan di Google</span>
                  <ExternalLink className="w-4 h-4 text-white relative z-10" />
                </a>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* 3 Kartu Testimoni Pilihan dari Google Maps with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {googleReviews.map((rev, idx) => (
            <RevealOnScroll
              key={idx}
              variant="fade-up"
              delay={idx * 150}
              className="h-full"
            >
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-primary/10 shadow-soft hover:shadow-card hover:border-accent/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-full relative group">
                <div>
                  {/* Header card: Star rating & Quote icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                      ))}
                      <span className="text-xs font-bold text-accent-dark ml-1">5,0</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary/30 group-hover:text-accent transition-colors duration-200">
                      <Quote className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-charcoal leading-relaxed italic mb-6">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Author profile & badge */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm shadow-sm ${rev.avatarBg}`}
                  >
                    {rev.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-primary leading-tight">
                      {rev.author}
                    </h4>
                    <p className="text-[11px] text-charcoal-light mt-0.5">
                      {rev.serviceTag}
                    </p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL LIGHTBOX: KLIK UNTUK PERBESAR RESOLUSI PENUH       */}
      {/* ======================================================== */}
      {lightboxIndex !== null && testimonials[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Lightbox Modal Box */}
          <div
            className="relative max-w-lg w-full max-h-[95vh] flex flex-col items-center bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar (Counter, Caption, Close Button) */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                {lightboxIndex + 1} dari {testimonials.length}
              </span>

              {testimonials[lightboxIndex].caption && (
                <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                  {testimonials[lightboxIndex].caption}
                </span>
              )}

              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors shadow-lg"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Lightbox Image with Left & Right Arrow controls */}
            <div className="relative w-full flex items-center justify-center">
              {/* Previous Button inside Lightbox */}
              {testimonials.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex(
                      (lightboxIndex - 1 + testimonials.length) % testimonials.length
                    )
                  }
                  className="absolute left-2 sm:-left-12 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 flex items-center justify-center transition-colors"
                  title="Foto Sebelumnya"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              <img
                src={testimonials[lightboxIndex].image_url}
                alt={testimonials[lightboxIndex].caption || 'Screenshot WhatsApp'}
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
              />

              {/* Next Button inside Lightbox */}
              {testimonials.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((lightboxIndex + 1) % testimonials.length)
                  }
                  className="absolute right-2 sm:-right-12 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/20 flex items-center justify-center transition-colors"
                  title="Foto Berikutnya"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom helper info */}
            <p className="text-[11px] text-white/70 mt-3 text-center">
              Gunakan tombol panah kiri / kanan keyboard atau geser untuk beralih foto. Tekan ESC untuk menutup.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
