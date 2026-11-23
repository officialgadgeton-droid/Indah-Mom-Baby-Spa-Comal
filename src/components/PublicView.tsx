import React, { useState, useEffect } from 'react';
import { Service, AppSettings, ClinicOperationalStatus } from '../types';
import {
  fetchActiveServices,
  getLocalSettings,
  fetchClinicSettings,
  fetchClinicOperationalStatus,
  supabase,
} from '../lib/supabase';
import { Clock, AlertCircle, MessageCircle } from 'lucide-react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { ServicesSection } from './ServicesSection';
import { AboutSection } from './AboutSection';
import { HowToBookSection } from './HowToBookSection';
import { BookingWizard } from './BookingWizard';
import { TestimonialsSection } from './TestimonialsSection';
import { TikTokSection } from './TikTokSection';
import { LocationSection } from './LocationSection';
import { Footer } from './Footer';
import { PublicMobileBottomNav } from './MobileBottomNav';

interface PublicViewProps {
  onNavigateToAdmin?: () => void;
}

export const PublicView: React.FC<PublicViewProps> = ({ onNavigateToAdmin }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServicePreset, setSelectedServicePreset] = useState<Service | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => getLocalSettings());
  const [operationalStatus, setOperationalStatus] = useState<ClinicOperationalStatus>(() => {
    try {
      const raw = localStorage.getItem('indah_spa_operational_status');
      if (raw) return JSON.parse(raw);
    } catch {}
    return { status: 'open', note: '' };
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const loadServices = () => {
      fetchActiveServices().then((data) => {
        if (data && data.length > 0) setServices(data);
      });
    };

    const loadOpStatus = () => {
      fetchClinicSettings().then((data) => {
        if (data) setOperationalStatus(data);
      });
    };

    loadServices();
    loadOpStatus();
    setSettings(getLocalSettings());

    const handleUpdate = () => loadServices();
    const handleOpUpdate = (e: any) => {
      if (e.detail) {
        setOperationalStatus(e.detail);
      } else {
        loadOpStatus();
      }
    };

    const handleFocus = () => {
      loadOpStatus();
      loadServices();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadOpStatus();
        loadServices();
      }
    };

    window.addEventListener('indah_spa_services_updated', handleUpdate);
    window.addEventListener('indah_spa_operational_status_updated', handleOpUpdate);
    window.addEventListener('storage', () => {
      handleUpdate();
      loadOpStatus();
    });
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let serviceChannel: any = null;
    let settingsChannel: any = null;

    if (supabase) {
      serviceChannel = supabase
        .channel('public_view_services_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'services' },
          () => {
            loadServices();
          }
        )
        .subscribe();

      settingsChannel = supabase
        .channel('public_view_clinic_settings_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'clinic_settings' },
          (payload: any) => {
            if (payload.new && payload.new.operational_status) {
              const updatedStatus: ClinicOperationalStatus = {
                status: payload.new.operational_status,
                note: payload.new.operational_note || '',
                updated_at: payload.new.updated_at,
              };
              setOperationalStatus(updatedStatus);
              localStorage.setItem('indah_spa_operational_status', JSON.stringify(updatedStatus));
            } else {
              loadOpStatus();
            }
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener('indah_spa_services_updated', handleUpdate);
      window.removeEventListener('indah_spa_operational_status_updated', handleOpUpdate);
      window.removeEventListener('storage', loadOpStatus);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (serviceChannel && supabase) {
        supabase.removeChannel(serviceChannel);
      }
      if (settingsChannel && supabase) {
        supabase.removeChannel(settingsChannel);
      }
    };
  }, []);

  const handleSelectServiceFromCatalog = (service: Service) => {
    setSelectedServicePreset(service);
    const element = document.getElementById('reservasi');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cleanDigits = (settings.whatsapp_number || '6287856960422').replace(/[^0-9]/g, '');
  const cleanWa = cleanDigits.startsWith('0') ? '62' + cleanDigits.slice(1) : cleanDigits;
  const hasActiveBanner = Boolean(operationalStatus && operationalStatus.status !== 'open');

  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal pb-24 md:pb-0">
      <Navbar
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        onSelectBooking={() => {
          const el = document.getElementById('reservasi');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        whatsappNumber={settings.whatsapp_number}
        operationalStatus={operationalStatus}
      />

      <main className="flex-1">
        {/* Banner Status Operasional Menonjol di Bagian Atas Web Utama (Tepat di Bawah Navbar) */}
        {hasActiveBanner && (
          <div className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-30">
            <div
              className={`p-4 sm:p-5 rounded-2xl border shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 animate-fade-in ${
                operationalStatus.status === 'busy_homecare'
                  ? 'bg-amber-50/95 border-amber-300 text-amber-950 shadow-amber-900/5'
                  : 'bg-rose-50/95 border-rose-300 text-rose-950 shadow-rose-900/5'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    operationalStatus.status === 'busy_homecare'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {operationalStatus.status === 'busy_homecare' ? (
                    <Clock className="w-5 h-5 animate-pulse" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-snug">
                    {operationalStatus.status === 'busy_homecare'
                      ? 'Sedang Homecare / Persalinan'
                      : 'Klinik Tutup Hari Ini'}
                  </h3>
                  <p className="text-xs sm:text-sm mt-1 leading-relaxed opacity-90">
                    {operationalStatus.note ? (
                      <span className="font-medium">{operationalStatus.note}</span>
                    ) : operationalStatus.status === 'busy_homecare' ? (
                      'Bidan sedang bertugas di luar/persalinan, reservasi online tetap berjalan & akan segera dikonfirmasi via WhatsApp.'
                    ) : (
                      'Praktik klinik hari ini sedang tutup. Bunda tetap dapat melakukan reservasi online untuk jadwal hari berikutnya.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <a
                  href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                    operationalStatus.status === 'busy_homecare'
                      ? 'Halo Bidan Indah, saya ingin bertanya terkait jadwal reservasi / homecare hari ini.'
                      : 'Halo Bidan Indah, saya ingin konsultasi terkait jadwal perawatan Si Kecil.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors ${
                    operationalStatus.status === 'busy_homecare'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Hubungi WA Bidan</span>
                </a>
              </div>
            </div>
          </div>
        )}

        <Hero
          onBookClick={() => {
            const el = document.getElementById('reservasi');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          whatsappNumber={settings.whatsapp_number}
          hasTopBanner={hasActiveBanner}
        />

        <ServicesSection
          services={services}
          onSelectService={handleSelectServiceFromCatalog}
        />

        <AboutSection />

        <HowToBookSection />

        <BookingWizard
          services={services}
          selectedServicePreset={selectedServicePreset}
          onClearPreset={() => setSelectedServicePreset(null)}
          whatsappNumber={settings.whatsapp_number}
          clinicAddress={settings.clinic_address}
          operationalStatus={operationalStatus}
        />

        <TestimonialsSection />

        <TikTokSection />

        <LocationSection
          clinicAddress={settings.clinic_address}
          whatsappNumber={settings.whatsapp_number}
          operatingHours={settings.operating_hours}
        />
      </main>

      <Footer
        onNavigateToAdmin={onNavigateToAdmin}
        clinicAddress={settings.clinic_address}
        whatsappNumber={settings.whatsapp_number}
        operatingHours={settings.operating_hours}
        instagramHandle={settings.clinic_instagram}
      />

      {/* Mobile Bottom Navigation Bar (Khusus Layar Mobile) */}
      <PublicMobileBottomNav
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onSelectBooking={() => {
          const el = document.getElementById('reservasi');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
};

export default PublicView;
