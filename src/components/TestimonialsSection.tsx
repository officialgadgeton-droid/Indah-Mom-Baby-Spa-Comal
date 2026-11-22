import React from 'react';
import { Star, Quote, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

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

  const reviews = [
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
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent/20 text-accent-dark text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Apa Kata Bunda?</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-3">
            Ulasan Asli Bunda di Google Maps
          </h2>
          <p className="text-base text-charcoal-light">
            Pengalaman nyata penuh cinta dan kepuasan dari Bunda yang telah mempercayakan perawatan Si Kecil di Indah Mom & Baby Spa Comal.
          </p>
        </div>

        {/* Header Ringkasan Rating Google (Deep Plum & Warm Gold Banner) */}
        <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-[#2F0B3D] via-[#5B2C6F] to-[#481A5B] rounded-3xl p-6 sm:p-8 text-white shadow-card border border-accent/30 relative overflow-hidden">
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

            {/* Right: CTA Button */}
            <div className="shrink-0 w-full sm:w-auto">
              <a
                href={googleMapsReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-accent hover:bg-accent-dark text-white font-bold text-xs sm:text-sm shadow-gold transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Lihat Semua 100 Ulasan di Google</span>
                <ExternalLink className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* 3 Kartu Testimoni Pilihan dari Google Maps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-primary/10 shadow-soft hover:shadow-card hover:border-accent/40 transition-all flex flex-col justify-between relative group"
            >
              <div>
                {/* Header card: Star rating & Quote icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                    <span className="text-xs font-bold text-accent-dark ml-1">5,0</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary/30 group-hover:text-accent transition-colors">
                    <Quote className="w-4 h-4" />
                  </div>
                </div>

                {/* Testimonial Quote */}
                <p className="text-sm text-charcoal leading-relaxed italic mb-6">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Verification Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm shrink-0 ${rev.avatarBg}`}
                >
                  {rev.initial}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-serif font-bold text-sm text-primary truncate">
                      {rev.author}
                    </h4>
                    <span title="Terverifikasi Google Maps">
                      <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                    </span>
                  </div>
                  <span className="text-[11px] text-charcoal-light block truncate">
                    Ulasan Terverifikasi di Google Maps
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Social Proof Tagline */}
        <div className="mt-12 text-center">
          <p className="text-xs text-charcoal-light flex items-center justify-center gap-2">
            <span>⭐️ 100% Bunda merekomendasikan Indah Mom & Baby Spa Comal untuk perawatan buah hati.</span>
          </p>
        </div>
      </div>
    </section>
  );
};