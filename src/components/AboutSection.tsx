import React from 'react';
import { Award, ShieldCheck, Heart, Home, Sparkles, UserCheck } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="tentang-bidan" className="py-20 bg-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Bidan Profile Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-primary/10 relative">
              <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-5 p-1 bg-gradient-to-tr from-accent to-primary shadow-md flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Profil Bidan Indah Mom Baby Spa"
                  className="w-full h-full object-contain bg-white rounded-full p-2"
                />
              </div>

              <div className="text-center mb-6">
                <span className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/15 px-3 py-1 rounded-full">
                  Tenaga Medis Bersertifikat
                </span>
                <h3 className="font-serif text-2xl font-bold text-primary mt-2">
                  Bidan Indah & Tim Profesional
                </h3>
                <p className="text-xs text-charcoal-light font-medium mt-1">
                  Praktik Mandiri & Homecare Spesialis Mom & Baby Spa Comal
                </p>
              </div>

              <div className="space-y-3 text-xs text-charcoal leading-relaxed border-t border-slate-100 pt-5">
                <div className="flex items-start gap-3">
                  <UserCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Lulusan Kebidanan dengan sertifikasi resmi Baby Spa & Pediatric Massage, Lactation Counselor, serta Postnatal Care.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>
                    Pendekatan penuh kasih sayang (gentle care), memahami karakter bayi yang sensitif, dan mengedepankan kenyamanan Bunda.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Mengutamakan standar sanitasi ketat: air steril, minyak pijat organik bersertifikasi BPOM, dan alat sekali pakai.
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-[#F5E8FB] border border-primary/15 text-center">
                <p className="font-serif italic text-primary text-sm font-semibold">
                  "Kesehatan buah hati dan ketenangan hati Bunda adalah prioritas utama setiap sentuhan kami."
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Keunggulan Klinik */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent-dark text-xs font-bold uppercase tracking-wider">
              <span>Keunggulan Kami</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary leading-tight">
              Mengapa Bunda Mempercayakan Buah Hati di Indah Mom & Baby Spa?
            </h2>

            <p className="text-base text-charcoal-light leading-relaxed">
              Kami menyadari bahwa masa awal kehidupan Si Kecil dan masa nifas Bunda membutuhkan perhatian medis yang tepat 
              sekaligus sentuhan emosional yang menenangkan. Kami hadir di Comal untuk memberikan pelayanan terbaik tanpa kompromi.
            </p>

            {/* 4 Feature Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-5 rounded-2xl border border-primary/10 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-bold text-base text-primary mb-1">Ditangani Bidan Asli</h4>
                <p className="text-xs text-charcoal-light leading-relaxed">
                  Bukan terapis sembarangan, melainkan bidan yang paham anatomi bayi, tanda bahaya neonatal, dan fisiologi laktasi.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-primary/10 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5 text-accent-dark" />
                </div>
                <h4 className="font-bold text-base text-primary mb-1">100% Bahan Organik Alami</h4>
                <p className="text-xs text-charcoal-light leading-relaxed">
                  Menggunakan virgin coconut oil (VCO), lavender & chamomile food-grade yang ramah untuk kulit bayi paling sensitif.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-primary/10 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-primary mb-1">Ruangan Higienis & Steril</h4>
                <p className="text-xs text-charcoal-light leading-relaxed">
                  Air hangat steril disaring bersih setiap sesi, matras disinfeksi medis berkala, dan suhu ruangan disesuaikan nyaman.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-primary/10 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-primary flex items-center justify-center mb-3">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-bold text-base text-primary mb-1">Homecare Comal & Sekitarnya</h4>
                <p className="text-xs text-charcoal-light leading-relaxed">
                  Bidan siap datang ke rumah Bunda di area Comal, Ulujami, Ampelgading, Petarukan & sekitarnya membawa peralatan lengkap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
