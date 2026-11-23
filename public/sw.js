// Service Worker Ringan Indah Mom & Baby Spa Comal
// Menggunakan strategi Network-First agar data reservasi & Supabase selalu segar,
// namun tetap memenuhi standar PWA Chrome Android & iOS Fullscreen.

const CACHE_NAME = 'indah-spa-pwa-v3';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png'
];

// 1. Install Event: Pra-cache aset dasar & langsung aktif tanpa menunggu
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Bersihkan cache lama & klaim semua klien
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Network-First (Jaringan Utama -> Fallback Cache)
self.addEventListener('fetch', (event) => {
  // Hanya tangani request GET http/https
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Jangan cache request ke Supabase REST / Realtime websocket agar tidak ada data stale
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Simpan salinan aset statis origin yang berhasil di-fetch
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          url.origin === self.location.origin &&
          (url.pathname.endsWith('.js') ||
            url.pathname.endsWith('.css') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.jpg') ||
            url.pathname.endsWith('.svg') ||
            url.pathname.endsWith('.woff2') ||
            url.pathname === '/' ||
            url.pathname === '/index.html')
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Jika offline atau jaringan terputus, cari di cache
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // Fallback navigasi SPA ke cache root '/'
        if (event.request.mode === 'navigate') {
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
        }

        return new Response('Jaringan offline. Silakan hubungkan kembali koneksi internet Bunda.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      })
  );
});
