import React from 'react';
import { Award, ShieldCheck, Heart, Home, Sparkles, UserCheck } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';

export const AboutSection: React.FC = () => {
  const features = [
    {
      icon: <Award className="w-5 h-5 text-primary" />,
      bg: 'bg-primary/10',
      title: 'Ditangani Bidan Asli',
      desc: 'Bukan terapis sembarangan, melainkan bidan yang paham anatomi bayi, tanda bahaya neonatal, dan fisiologi laktasi.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-accent-dark" />,
      bg: 'bg-accent/20',
      title: '100% Bahan Organik Alami',
      desc: 'Menggunakan virgin coconut oil (VCO), lavender & chamomile food-grade yang ramah untuk kulit bayi paling sensitif.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
      bg: 'bg-emerald-100',
      title: 'Ruangan Higienis & Steril',
      desc: 'Air hangat steril disaring bersih setiap sesi, matras disinfeksi medis berkala, dan suhu ruangan disesuaikan nyaman.',
    },
    {
      icon: <Home className="w-5 h-5 text-primary" />,
      bg: 'bg-purple-100',
      title: 'Homecare Comal & Sekitarnya',
      desc: 'Bidan siap datang ke rumah Bunda di area Comal, Ulujami, Ampelgading, Petarukan & sekitarnya membawa peralatan lengkap.',
    },
  ];

  return (
    <section id="tentang-bidan" className="py-20 bg-cream relative overflow-hidden scroll-mt-20 sm:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Bidan Profile Card with Scroll Reveal (fade-right) */}
          <div className="lg:col-span-5">
            <RevealOnScroll variant="fade-right" delay={100}>
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-primary/10 relative transition-all duration-300 hover:shadow-xl">
                <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-5 p-1 bg-gradient-to-tr from-accent to-primary shadow-md flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="Profil Bidan Indah Mom Baby Spa"
                    className="w-full h-full rounded-full object-cover bg-white"
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
                    Homecare Spesialis Mom & Baby Spa Comal
                  </p>
                </div>

                <div className="space-y-3 text-xs text-charcoal leading-relaxed border-t border-slate-100 pt-5">
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      Lulusan Kebidanan dengan sertifikasi resmi Baby Spa & Pediatric Massage, serta Postnatal Care.
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
            </RevealOnScroll>
          </div>

          {/* Right Column: Keunggulan Klinik */}
          <div className="lg:col-span-7 space-y-6">
            <RevealOnScroll variant="fade-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent-dark text-xs font-bold uppercase tracking-wider mb-2">
                <span>Keunggulan Kami</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary leading-tight mb-4">
                Mengapa Bunda Mempercayakan Buah Hati di Indah Mom & Baby Spa?
              </h2>

              <p className="text-base text-charcoal-light leading-relaxed">
                Kami menyadari bahwa masa awal kehidupan Si Kecil dan masa nifas Bunda membutuhkan perhatian medis yang tepat
                sekaligus sentuhan emosional yang menenangkan. Kami hadir di Comal untuk memberikan pelayanan terbaik tanpa kompromi.
              </p>
            </RevealOnScroll>

            {/* 4 Feature Pillars with Staggered Scroll Reveal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {features.map((feat, index) => (
                <RevealOnScroll
                  key={index}
                  variant="fade-up"
                  delay={100 + index * 100}
                >
                  <div className="bg-white p-5 rounded-2xl border border-primary/10 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-accent/30 h-full flex flex-col">
                    <div className={`w-10 h-10 rounded-xl ${feat.bg} flex items-center justify-center mb-3`}>
                      {feat.icon}
                    </div>
                    <h4 className="font-bold text-base text-primary mb-1">{feat.title}</h4>
                    <p className="text-xs text-charcoal-light leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
