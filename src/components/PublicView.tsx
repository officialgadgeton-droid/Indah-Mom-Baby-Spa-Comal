import React, { useState, useEffect } from 'react';
import { Service, AppSettings } from '../types';
import { fetchActiveServices, getLocalSettings } from '../lib/supabase';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { ServicesSection } from './ServicesSection';
import { AboutSection } from './AboutSection';
import { HowToBookSection } from './HowToBookSection';
import { BookingWizard } from './BookingWizard';
import { TestimonialsSection } from './TestimonialsSection';
import { LocationSection } from './LocationSection';
import { Footer } from './Footer';

interface PublicViewProps {
  onNavigateToAdmin?: () => void;
}

export const PublicView: React.FC<PublicViewProps> = ({ onNavigateToAdmin }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServicePreset, setSelectedServicePreset] = useState<Service | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => getLocalSettings());

  useEffect(() => {
    fetchActiveServices().then(data => {
      setServices(data);
    });
    setSettings(getLocalSettings());
  }, []);

  const handleSelectServiceFromCatalog = (service: Service) => {
    setSelectedServicePreset(service);
    const element = document.getElementById('reservasi');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal">
      <Navbar
        onSelectBooking={() => {
          const el = document.getElementById('reservasi');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        whatsappNumber={settings.whatsapp_number}
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
        />

        <TestimonialsSection />

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
    </div>
  );
};

export default PublicView;
