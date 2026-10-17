// LandGuard AI — Secure Service Worker (PWA)
// Version: landguard-pwa-v1.0.1
// Strict Security Policy: NO API caching, NO auth caching, NO token/credential caching

const CACHE_NAME = 'landguard-shell-v1';
const OFFLINE_URL = '/offline.html';

// Static Shell Assets allowed for offline resilience
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.webmanifest'
];

// URLs that MUST NEVER be cached under any circumstances
const FORBIDDEN_CACHE_PATTERNS = [
  '/api/',
  'onrender.com',
  '/auth/',
  '/login',
  '/register',
  '/signup',
  '/reviews',
  '/assess/',
  '/reports/pdf',
  '/download'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Purging stale cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. NON-GET REQUESTS: Never intercept or cache mutations (POST, PUT, DELETE, PATCH)
  if (request.method !== 'GET') {
    return;
  }

  // 2. SECURITY CHECK: Strictly bypass all backend API, authentication, and review endpoints
  const isForbidden = FORBIDDEN_CACHE_PATTERNS.some((pattern) => 
    url.pathname.includes(pattern) || url.hostname.includes(pattern)
  );

  if (isForbidden) {
    // Pure network pass-through, zero cache storage
    return;
  }

  // 3. NAVIGATION REQUESTS (HTML Pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 4. STATIC BUNDLE ASSETS (Vite hashed JS/CSS, images, fonts)
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.png')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Support manual skip waiting when user approves update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
