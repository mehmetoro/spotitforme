// SpotItForMe Service Worker
// CACHE_VERSION güncellendi: 17 Mart 2026 - yeni ikonlar için
const CACHE_NAME = 'spotitforme-v7';

const PRECACHE_URLS = [
  '/manifest.json',
  '/spotitforme-log.png',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/manifest.json?v=2',
  '/spotitforme-log.png?v=2',
  '/apple-touch-icon.png?v=2',
  '/icons/icon-192.png?v=2',
  '/icons/icon-512.png?v=2',
  '/icons/icon-maskable-512.png?v=2',
];

// Install: precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: keep app shell fresh, only cache stable public assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests (Supabase, ads, etc.)
  if (url.origin !== self.location.origin) return;

  // Skip API routes — always network
  if (url.pathname.startsWith('/api/')) return;

  // Never cache Next build assets here; browser cache handles hashed files.
  // Caching them in SW can mix old bundles with new HTML and trigger hydration errors.
  if (url.pathname.startsWith('/_next/')) return;

  // HTML navigations: network first, cached fallback only if offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first only for stable public assets
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(svg|png|ico|woff2?|css)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
      )
    );
    return;
  }
});
