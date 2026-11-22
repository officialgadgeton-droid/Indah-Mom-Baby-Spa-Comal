import React, { useState } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

interface AdminPortalProps {
  mode: 'admin' | 'all';
  onBackToHome?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ mode, onBackToHome }) => {
  const [adminPin, setAdminPin] = useState<string | null>(() => {
    return sessionStorage.getItem('imb_admin_pin');
  });

  const handleAdminSuccess = (pin: string) => {
    setAdminPin(pin);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('imb_admin_pin');
    setAdminPin(null);
  };

  const handleBack = () => {
    if (mode === 'admin') {
      window.open('https://indahmombabyspa.com', '_blank');
    } else if (onBackToHome) {
      onBackToHome();
    }
  };

  if (!adminPin) {
    return (
      <AdminLogin
        onSuccess={handleAdminSuccess}
        onBackToHome={handleBack}
      />
    );
  }

  return (
    <AdminDashboard
      adminPin={adminPin}
      onLogout={handleAdminLogout}
      onBackToHome={handleBack}
    />
  );
};

export default AdminPortal;
