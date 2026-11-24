import { useState, useEffect } from 'react';

export const ANDROID_APK_URL =
  'https://github.com/officialgadgeton-droid/Indah-Mom-Baby-Spa-Comal/releases/download/v1.0.0/IndahMomBabySpa.apk';

/**
 * Mendeteksi apakah pengguna sedang membuka halaman web dari dalam aplikasi Android resmi
 * (IndahMomBabySpa.apk) guna mencegah penawaran duplikasi banner/tombol download.
 *
 * Pengecekan meliputi:
 * 1. User-Agent mengandung keyword aplikasi khusus ('indahmombabyspa', 'officialgadgeton')
 * 2. URL parameter khusus (misal ?source=app, ?app=true, ?platform=android)
 * 3. JavaScript bridge atau window property yang diinjeksikan WebView Android
 * 4. Tag Android WebView bawaan ('; wv' atau 'Version/X.X ... Chrome/... Mobile')
 */
export function isAndroidApp(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = (navigator.userAgent || '').toLowerCase();

  // 1. Cek User-Agent khusus aplikasi Indah Mom & Baby Spa
  const isCustomAppUA =
    ua.includes('indahmombabyspa') ||
    ua.includes('indah-mom-baby-spa') ||
    ua.includes('officialgadgeton');

  // 2. Cek flag URL parameter
  const searchParams = new URLSearchParams(window.location.search);
  const isAppParam =
    searchParams.get('source') === 'app' ||
    searchParams.get('app') === 'true' ||
    searchParams.get('app') === 'android' ||
    searchParams.get('platform') === 'android';

  // 3. Cek bridge / window injection dari Android WebView
  const hasAndroidBridge = Boolean(
    (window as any).Android ||
    (window as any).IndahMomBabySpa ||
    (window as any).isAndroidApp
  );

  // 4. Cek WebView Android standar
  const isAndroidWebView =
    ua.includes('android') &&
    (ua.includes('; wv') || ua.includes(';wv') || (ua.includes('version/') && ua.includes('chrome/')));

  return isCustomAppUA || isAppParam || hasAndroidBridge || isAndroidWebView;
}

/**
 * Custom React Hook untuk mendeteksi apakah lingkungan saat ini adalah aplikasi Android APK
 */
export function useIsAndroidApp(): boolean {
  const [inApp, setInApp] = useState<boolean>(() => isAndroidApp());

  useEffect(() => {
    setInApp(isAndroidApp());
  }, []);

  return inApp;
}
