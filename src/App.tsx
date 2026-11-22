import React, { useState, useEffect, Suspense } from 'react';
import { ToastProvider } from './context/ToastContext';

// Dual-Build Mode Configuration
// Reads VITE_APP_MODE: 'public' | 'admin' | 'all' (default: 'all' during local dev)
const APP_MODE = (import.meta.env.VITE_APP_MODE as 'public' | 'admin' | 'all') || 'all';

// Dynamic lazy imports: Vite & Rollup perform tree-shaking on dead branches when building
// with VITE_APP_MODE=public or VITE_APP_MODE=admin, ensuring complete physical bundle isolation.
const AdminPortal = APP_MODE !== 'public'
  ? React.lazy(() => import('./components/Admin/AdminPortal'))
  : null;

const PublicView = APP_MODE !== 'admin'
  ? React.lazy(() => import('./components/PublicView'))
  : null;

// Loading Fallback Indicator
const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => (
  <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
    <div className="w-12 h-12 rounded-full border-4 border-accent/20 border-t-accent animate-spin mb-4" />
    <p className="font-serif text-primary font-medium text-sm animate-pulse">{message}</p>
  </div>
);

// 1. ADMIN ONLY APPLICATION (admin-indahspa.pages.dev / dedicated portal)
const AdminApp: React.FC = () => {
  useEffect(() => {
    // Inject noindex, nofollow meta tag automatically
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow');
    document.title = 'Portal Bidan - Indah Mom & Baby Spa';

    // Normalize path to root
    if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
  }, []);

  if (!AdminPortal) return null;

  return (
    <Suspense fallback={<LoadingSpinner message="Memuat Portal Bidan..." />}>
      <AdminPortal mode="admin" />
    </Suspense>
  );
};

// 2. PUBLIC ONLY APPLICATION (indahmombabyspa.com)
const PublicApp: React.FC = () => {
  useEffect(() => {
    // Redirect any path other than '/' to home root
    if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
  }, []);

  if (!PublicView) return null;

  return (
    <Suspense fallback={<LoadingSpinner message="Memuat Indah Mom & Baby Spa..." />}>
      <PublicView />
    </Suspense>
  );
};

// 3. ALL / DUAL-MODE APPLICATION (Local Dev & Temporary Preview)
const AllApp: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdminPath = currentPath === '/portal-bidan-indah';

  useEffect(() => {
    // If user navigates to '/admin' or any unrecognized path, redirect to '/'
    if (!isAdminPath && currentPath !== '/') {
      window.history.replaceState(null, '', '/');
      setCurrentPath('/');
    }
  }, [currentPath, isAdminPath]);

  if (isAdminPath && AdminPortal) {
    return (
      <Suspense fallback={<LoadingSpinner message="Memuat Portal Bidan..." />}>
        <AdminPortal mode="all" onBackToHome={() => navigateTo('/')} />
      </Suspense>
    );
  }

  if (PublicView) {
    return (
      <Suspense fallback={<LoadingSpinner message="Memuat Indah Mom & Baby Spa..." />}>
        <PublicView onNavigateToAdmin={() => navigateTo('/portal-bidan-indah')} />
      </Suspense>
    );
  }

  return null;
};

export const AppContent: React.FC = () => {
  if (APP_MODE === 'admin') {
    return <AdminApp />;
  }
  if (APP_MODE === 'public') {
    return <PublicApp />;
  }
  return <AllApp />;
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
