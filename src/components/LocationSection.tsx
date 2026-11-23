import React from 'react';
import { MapPin, Clock, Phone, Navigation, Home, ExternalLink } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';

interface LocationSectionProps {
  clinicAddress?: string;
  whatsappNumber?: string;
  operatingHours?: string;
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  clinicAddress = 'Ds. Purwosari Dusun VI 47 RT 001/017, Dusun III, Pecangakan, Kec. Comal, Kabupaten Pemalang, Jawa Tengah 52363',
  whatsappNumber = '0878-5696-0422',
  operatingHours = 'Buka setiap hari hingga pukul 18.00 WIB',
}) => {
  const cleanDigits = whatsappNumber.replace(/[^0-9]/g, '');
  const waLink = cleanDigits.startsWith('0') ? '62' + cleanDigits.slice(1) : cleanDigits;
  const googleMapsUrl = 'https://maps.app.goo.gl/c1cY4NA9KrtNzVz57';
  const embedMapsUrl = 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3960.7995244171807!2d109.54086200437719!3d-6.914556701893944!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6fd93a5b19b44d%3A0x9e3c11b9cf3638a4!2sIndah%20Mom%20%26%20Baby%20Spa%20Comal!5e0!3m2!1sid!2sid!4v1795329320258!5m2!1sid!2sid';

  return (
    <section id="lokasi" className="py-20 bg-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll variant="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <span>Lokasi & Kontak</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-4">
              Kunjungi Klinik Kami di Comal
            </h2>
            <p className="text-base text-charcoal-light">
              Tempat yang tenang, mudah dijangkau, dan siap menyambut kehadiran Bunda dan Si Kecil dengan kehangatan.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Information Card with Scroll Reveal (fade-right) */}
          <div className="lg:col-span-5">
            <RevealOnScroll variant="fade-right" delay={100}>
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-primary/10 space-y-6 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-primary mb-1">Alamat Klinik</h4>
                    <p className="text-xs sm:text-sm text-charcoal leading-relaxed">
                      {clinicAddress}
                    </p>
                    <div className="mt-2 text-xs font-semibold text-accent-dark flex items-center gap-1">
                      <span>Dekat Pusat Keramaian Comal - Akses Mudah & Parkir Nyaman</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-accent-dark" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-primary mb-1">Jam Operasional</h4>
                    <p className="text-xs sm:text-sm font-semibold text-charcoal">
                      {operatingHours}
                    </p>
                    <p className="text-[11px] text-charcoal-light mt-1">
                      Slot reservasi: 08:30, 10:00, 11:30, 13:30, 15:00, 16:30, 18:00 WIB
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-primary mb-1">Jangkauan Layanan Homecare</h4>
                    <p className="text-xs text-charcoal-light leading-relaxed">
                      Melayani kunjungan Bidan ke rumah Bunda untuk seluruh area:
                    </p>
                    <p className="text-xs font-semibold text-primary mt-1">
                      Kec. Comal, Ulujami, Ampelgading, Bodeh, Petarukan, dan Sragi (Kab. Pekalongan).
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/${waLink}?text=Halo%20Bidan%20Indah,%20saya%20ingin%20tanya%20arah%20lokasi%20klinik`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-shimmer flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold text-xs shadow-gold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Phone className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Chat WhatsApp</span>
                  </a>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cream border border-primary/20 text-primary font-bold text-xs hover:bg-primary/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <Navigation className="w-4 h-4 text-primary" />
                    <span>Buka Google Maps</span>
                  </a>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Map Display & Preview Card with Scroll Reveal (fade-left) */}
          <div className="lg:col-span-7">
            <RevealOnScroll variant="fade-left" delay={200}>
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-card border border-primary/10 overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="relative w-full h-[400px] sm:h-[450px] min-h-[350px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <iframe
                    title="Peta Lokasi Indah Mom Baby Spa Comal"
                    src={embedMapsUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full min-h-[350px]"
                  />

                  {/* Floating Overlay Card on Map */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-primary/15 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                        <img src="/logo.png" alt="Logo" className="w-full h-full rounded-full object-cover" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-primary leading-none">
                          Indah Mom & Baby Spa Comal
                        </h5>
                        <p className="text-[11px] text-charcoal-light mt-0.5">
                          Rating 5,0 ★★★★★ (100 Ulasan Google)
                        </p>
                      </div>
                    </div>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold shrink-0 hover:bg-primary-700 flex items-center gap-1 shadow-sm transition-all duration-300 hover:scale-105"
                    >
                      <span>Buka Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};
