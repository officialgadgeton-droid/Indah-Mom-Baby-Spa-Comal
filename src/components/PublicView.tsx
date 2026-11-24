import React, { useState, useEffect } from 'react';
import { Service, AppSettings, ClinicOperationalStatus } from '../types';
import {
  fetchActiveServices,
  getLocalSettings,
  fetchClinicSettings,
  fetchClinicOperationalStatus,
  supabase,
} from '../lib/supabase';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { ClinicAnnouncementsSection } from './ClinicAnnouncementsSection';
import { ServicesSection } from './ServicesSection';
import { AboutSection } from './AboutSection';
import { HowToBookSection } from './HowToBookSection';
import { BookingWizard } from './BookingWizard';
import { TestimonialsSection } from './TestimonialsSection';
import { TikTokSection } from './TikTokSection';
import { LocationSection } from './LocationSection';
import { AndroidAppSection } from './AndroidAppSection';
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
        <Hero
          onBookClick={() => {
            const el = document.getElementById('reservasi');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          whatsappNumber={settings.whatsapp_number}
          hasTopBanner={false}
        />

        {/* Broadcast Info Bidan & Tips Kesehatan */}
        <ClinicAnnouncementsSection whatsappNumber={settings.whatsapp_number} />

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

        {/* Promo Download Aplikasi Android Resmi (di atas Footer) */}
        <AndroidAppSection />
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
