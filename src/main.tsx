import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Registrasi Service Worker Ringan untuk PWA Fullscreen
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.debug('Service Worker terdaftar dengan scope:', registration.scope);
      })
      .catch((error) => {
        console.debug('Registrasi Service Worker gagal:', error);
      });
  });
}
