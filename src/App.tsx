import React, { useState, useEffect } from 'react';
import { Service, AppSettings } from './types';
import { fetchActiveServices, getLocalSettings } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { HowToBookSection } from './components/HowToBookSection';
import { BookingWizard } from './components/BookingWizard';
import { TestimonialsSection } from './components/TestimonialsSection';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/Admin/AdminLogin';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ToastProvider } from './context/ToastContext';

export const AppContent: React.FC = () => {
  // Simple client-side routing: '/' vs '/admin'
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [adminPin, setAdminPin] = useState<string | null>(() => {
    return sessionStorage.getItem('imb_admin_pin');
  });

  // Services data for landing page
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServicePreset, setSelectedServicePreset] = useState<Service | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => getLocalSettings());

  useEffect(() => {
    // Sync browser back/forward buttons
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    fetchActiveServices().then(data => {
      setServices(data);
    });
    setSettings(getLocalSettings());
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectServiceFromCatalog = (service: Service) => {
    setSelectedServicePreset(service);
    const element = document.getElementById('reservasi');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAdminSuccess = (pin: string) => {
    setAdminPin(pin);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('imb_admin_pin');
    setAdminPin(null);
  };

  // If user navigates to /admin
  const isAdminRoute = currentPath === '/admin' || currentPath.startsWith('/admin');

  if (isAdminRoute) {
    if (!adminPin) {
      return (
        <AdminLogin
          onSuccess={handleAdminSuccess}
          onBackToHome={() => navigateTo('/')}
        />
      );
    }
    return (
      <AdminDashboard
        adminPin={adminPin}
        onLogout={handleAdminLogout}
        onBackToHome={() => navigateTo('/')}
      />
    );
  }

  // Landing Page View
  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal">
      <Navbar
        onNavigateToAdmin={() => navigateTo('/admin')}
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
        onNavigateToAdmin={() => navigateTo('/admin')}
        clinicAddress={settings.clinic_address}
        whatsappNumber={settings.whatsapp_number}
        operatingHours={settings.operating_hours}
        instagramHandle={settings.clinic_instagram}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
