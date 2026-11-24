import React from 'react';
import { Smartphone, BellRing, Sparkles, Download, CheckCircle, ShieldCheck, Info } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { ANDROID_APK_URL, useIsAndroidApp } from '../lib/appDetection';

export const AndroidAppSection: React.FC = () => {
  const isInsideApp = useIsAndroidApp();

  // Jika pengguna sedang membuka halaman dari dalam aplikasi Android resmi, sembunyikan section ini (Anti-Duplikasi)
  if (isInsideApp) {
    return null;
  }

  const features = [
    {
      icon: <Smartphone className="w-6 h-6 text-[#D4AF37]" />,
      title: 'Akses Satu Sentuhan',
      desc: 'Reservasi & cek jadwal praktik lebih cepat dalam satu sentuhan',
    },
    {
      icon: <BellRing className="w-6 h-6 text-[#4A154B]" />,
      title: 'Update & Notifikasi',
      desc: 'Notifikasi otomatis jadwal libur, homecare & tips kesehatan Bunda & Si Kecil',
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#D4AF37]" />,
      title: 'Super Ringan & Cepat',
      desc: 'Ukuran ringan (5 MB) tanpa membebani memori HP',
    },
  ];

  return (
    <section id="download-app" className="py-16 sm:py-20 bg-cream relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-accent/10 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <RevealOnScroll variant="fade-up">
          <div className="bg-[#FAF6F0] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-card border border-[#D4AF37]/35 relative overflow-hidden">
            {/* Soft decorative badge in corner */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-gradient-to-br from-accent/20 to-primary/10 rounded-full blur-2xl pointer-events-none" />

            <div className="max-w-4xl mx-auto text-center">
              {/* Badge Identitas */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D4AF37]/40 shadow-xs mb-5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] sm:text-xs font-bold text-[#4A154B] tracking-wide uppercase">
                  Aplikasi Android Resmi • Versi 1.0.0
                </span>
              </div>

              {/* Judul Utama Brand */}
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#4A154B] tracking-tight leading-tight mb-4">
                Lebih Praktis dengan Aplikasi Android Indah Mom & Baby Spa
              </h2>

              <p className="text-sm sm:text-base text-charcoal-light max-w-2xl mx-auto mb-10 leading-relaxed">
                Pasang aplikasi resmi di smartphone Android Bunda untuk kemudahan booking spa, konsultasi bersama Bidan Indah, dan pantau jadwal praktik harian kapan saja.
              </p>

              {/* 3 Keunggulan Utama */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 text-left mb-10">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D4AF37]/20 shadow-xs hover:shadow-md hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/30 flex items-center justify-center mb-4 shadow-2xs">
                        {feature.icon}
                      </div>
                      <h3 className="font-bold text-sm text-[#4A154B] mb-1.5">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-[13px] text-charcoal leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Tersedia di APK Resmi</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Area CTA Download & Bantuan */}
              <div className="flex flex-col items-center justify-center space-y-3 pt-2">
                <a
                  href={ANDROID_APK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-7 sm:px-9 py-4 rounded-full bg-gradient-to-r from-[#4A154B] via-[#5B2C6F] to-[#4A154B] hover:from-[#370e38] hover:to-[#370e38] text-white font-bold text-sm sm:text-base shadow-gold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 border border-[#D4AF37]/50 group"
                >
                  <Download className="w-5 h-5 text-[#D4AF37] group-hover:animate-bounce" />
                  <span>Download Aplikasi Android (APK)</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-[#FAF6F0] ml-1">
                    5 MB
                  </span>
                </a>

                {/* Teks Bantuan Kecil di Bawah Tombol */}
                <p className="text-xs text-charcoal-light/90 flex items-center justify-center gap-1.5 text-center px-4 max-w-xl">
                  <Info className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>Pilih &lsquo;Tetap Download&rsquo; &amp; izinkan instalasi dari sumber ini saat memasang di HP Android.</span>
                </p>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};
export default AndroidAppSection;
