import React, { useState, useEffect } from 'react';
import { Service, AppSettings, ClinicOperationalStatus } from '../types';
import {
  fetchActiveServices,
  getLocalSettings,
  fetchClinicOperationalStatus,
  supabase,
} from '../lib/supabase';
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
  const [operationalStatus, setOperationalStatus] = useState<ClinicOperationalStatus>({
    status: 'open',
    note: '',
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const loadServices = () => {
      fetchActiveServices().then((data) => {
        if (data && data.length > 0) setServices(data);
      });
    };

    const loadOpStatus = () => {
      fetchClinicOperationalStatus().then((data) => {
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

    window.addEventListener('indah_spa_services_updated', handleUpdate);
    window.addEventListener('indah_spa_operational_status_updated', handleOpUpdate);
    window.addEventListener('storage', () => {
      handleUpdate();
      loadOpStatus();
    });

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
          () => {
            loadOpStatus();
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener('indah_spa_services_updated', handleUpdate);
      window.removeEventListener('indah_spa_operational_status_updated', handleOpUpdate);
      window.removeEventListener('storage', loadOpStatus);
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
