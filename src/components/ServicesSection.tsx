import React, { useState, useEffect, useCallback } from 'react';
import { Service, ServiceCategory } from '../types';
import { Clock, Users, ArrowRight, Baby, Sparkles, Heart } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { SpaBubbles } from './SpaBubbles';
import { fetchActiveServices, supabase } from '../lib/supabase';

interface ServicesSectionProps {
  services?: Service[];
  onSelectService: (service: Service) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services = [],
  onSelectService,
}) => {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('Baby & Kids Treatment');
  const [activeServicesList, setActiveServicesList] = useState<Service[]>(services);

  const reloadActiveServices = useCallback(async () => {
    try {
      const data = await fetchActiveServices();
      if (data && data.length > 0) {
        setActiveServicesList(data);
      }
    } catch (err) {
      console.warn('Gagal memuat layanan aktif di ServicesSection:', err);
    }
  }, []);

  // Sinkronisasi saat props services dari induk berubah
  useEffect(() => {
    if (services && services.length > 0) {
      setActiveServicesList(services);
    }
  }, [services]);

  // Sinkronisasi real-time langsung ke tabel public.services Supabase
  useEffect(() => {
    reloadActiveServices();

    // Event listener lokal (untuk preview dan tab yang sama)
    const handleLocalUpdate = () => reloadActiveServices();
    window.addEventListener('indah_spa_services_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    // Supabase Realtime Postgres Changes
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel('public_services_section_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'services' },
          () => {
            reloadActiveServices();
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener('indah_spa_services_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [reloadActiveServices]);

  const categories: { key: ServiceCategory; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      key: 'Baby & Kids Treatment',
      label: 'Baby & Kids Treatment',
      icon: <Baby className="w-5 h-5" />,
      desc: 'Pijat relaksasi, baby spa, stimulasi tumbuh kembang, perawatan newborn, tindik steril, hingga cukur gundul oleh Bidan.',
    },
    {
      key: 'Terapi & Paket Spesial',
      label: 'Terapi & Paket Spesial',
      icon: <Sparkles className="w-5 h-5" />,
      desc: 'Terapi pediatrik flu batuk pilek (sinar inframerah, pijat, uap nebulizer) dan paket pemulihan terpadu pasca persalinan.',
    },
    {
      key: 'Mom Treatment',
      label: 'Mom Treatment',
      icon: <Heart className="w-5 h-5" />,
      desc: 'Rangkaian pemulihan ibu: pijat hamil, nifas, laktasi & oksitosin pelancar ASI, serta relaksasi facial & totok wajah.',
    },
  ];

  const filteredServices = activeServicesList
    .filter(s => s.category === activeCategory && s.is_active)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <section id="layanan" className="py-20 bg-white relative overflow-hidden">
      {/* Decorative Floating Spa Bubbles */}
      <SpaBubbles count={6} className="opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Scroll Reveal */}
        <RevealOnScroll variant="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <span>Katalog Resmi</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-4">
              Pilihan Layanan Treatment
            </h2>
            <p className="text-base text-charcoal-light">
              Setiap treatment dilakukan secara personal, higienis, dan terstandar medis oleh Bidan 
              menggunakan bahan organik yang 100% aman bagi Bunda dan buah hati.
            </p>
          </div>
        </RevealOnScroll>

        {/* Category Tabs */}
        <RevealOnScroll variant="fade-up" delay={100}>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {categories.map(cat => {
              const isSelected = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-sm ${
                    isSelected
                      ? 'bg-primary text-white shadow-primary/20 scale-105'
                      : 'bg-cream text-charcoal hover:bg-cream-200 hover:-translate-y-0.5 border border-slate-200'
                  }`}
                >
                  <span className={isSelected ? 'text-accent' : 'text-primary'}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-charcoal-light'
                    }`}
                  >
                    {services.filter(s => s.category === cat.key && s.is_active).length}
                  </span>
                </button>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* Category Description Banner */}
        <RevealOnScroll variant="fade-up" delay={150}>
          <div className="bg-cream/60 border border-primary/10 rounded-2xl p-4 text-center mb-10 max-w-2xl mx-auto text-sm text-charcoal-light">
            {categories.find(c => c.key === activeCategory)?.desc}
          </div>
        </RevealOnScroll>

        {/* Services Grid with Staggered Scroll Reveal (100ms, 200ms, 300ms) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => {
            const staggerDelay = (index % 3) * 100;
            return (
              <RevealOnScroll
                key={service.id}
                variant="fade-up"
                delay={staggerDelay}
                className="h-full"
              >
                <div className="bg-white rounded-3xl p-6 border border-primary/10 shadow-soft hover:shadow-card hover:border-accent/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-full group">
                  <div>
                    {/* Header Tag Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        {service.category}
                      </span>
                    </div>

                    {/* Treatment Name */}
                    <h3 className="font-serif font-bold text-xl text-primary mb-2 group-hover:text-accent-dark transition-colors duration-200">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-charcoal-light leading-relaxed mb-6">
                      {service.description}
                    </p>
                  </div>

                  <div>
                    {/* Metadata badges (Duration & Age) */}
                    <div className="flex flex-wrap items-center gap-2 py-3 border-y border-slate-100 text-xs text-charcoal mb-4">
                      {service.duration_minutes ? (
                        <div className="flex items-center gap-1.5 bg-cream px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-accent" />
                          <span className="font-semibold">{service.duration_minutes} Menit</span>
                        </div>
                      ) : null}
                      {service.target_age || service.age_range ? (
                        <div className="flex items-center gap-1.5 bg-cream px-2.5 py-1 rounded-lg">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>{service.target_age || service.age_range}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => onSelectService(service)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-700 text-white font-bold text-sm transition-all duration-300 group-hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span>Pilih Layanan Ini</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12 text-charcoal-light">
            <p>Belum ada layanan aktif di kategori ini.</p>
          </div>
        )}
      </div>
    </section>
  );
};
