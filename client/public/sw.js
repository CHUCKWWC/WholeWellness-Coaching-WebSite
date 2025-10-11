const CACHE_NAME = 'wholewellness-v4';
const STATIC_CACHE_NAME = 'wholewellness-static-v4';
const DYNAMIC_CACHE_NAME = 'wholewellness-dynamic-v4';

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
  '/manifest.json',
  // Add core CSS and JS files
  '/src/components/',
  '/src/pages/',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// NEVER cache these sensitive/dynamic endpoints - always network-only
// Using (?:\/|$) to match both base routes (/api/user) and nested paths (/api/user/profile)
const NEVER_CACHE_PATTERNS = [
  /^\/api\/auth(?:\/|$)/,           // All auth endpoints (login, logout, user, etc.)
  /^\/api\/assessments(?:\/|$)/,    // User-specific assessments (dynamic data)
  /^\/api\/user(?:\/|$)/,           // User-specific data
  /^\/api\/admin(?:\/|$)/,          // Admin endpoints
  /^\/api\/digest(?:\/|$)/,         // User digest preferences
  /^\/api\/ai-coaching(?:\/|$)/,    // AI chat sessions (real-time data)
  /^\/api\/crisis-alerts(?:\/|$)/,  // Crisis alerts
  /^\/api\/chat(?:\/|$)/,           // Chat/conversation data
];

// API endpoints safe to cache (static/public data only)
const API_CACHE_PATTERNS = [
  /^\/api\/coaches$/,         // Coach list (semi-static)
  /^\/api\/sessions$/,        // Session templates (semi-static)
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v4...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v4...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME && cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
  console.log('[SW] Service worker v4 activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests with appropriate caching strategies
  if (request.method === 'GET') {
    // NEVER cache sensitive/user-specific endpoints - Network Only
    if (NEVER_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      console.log('[SW] Network-only (no cache):', url.pathname);
      event.respondWith(networkOnly(request));
    }
    // Static assets - Cache First strategy
    else if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
      event.respondWith(cacheFirst(request));
    }
    // Safe API requests - Network First strategy (with cache fallback)
    else if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      event.respondWith(networkFirst(request));
    }
    // Images - Cache First with WebP optimization
    else if (request.destination === 'image') {
      event.respondWith(imageOptimization(request));
    }
    // Other requests - Stale While Revalidate
    else {
      event.respondWith(staleWhileRevalidate(request));
    }
  }
});

// Network Only strategy - NO caching for sensitive endpoints
async function networkOnly(request) {
  try {
    const networkResponse = await fetch(request);
    console.log('[SW] Network-only response:', request.url, networkResponse.status);
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network-only failed:', error);
    // Return error response - do NOT serve stale cache for auth/user data
    return new Response(JSON.stringify({ 
      error: 'Network unavailable - Please check your connection',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache First strategy for static assets
async function cacheFirst(request) {
  try {
    // Skip chrome-extension and other unsupported schemes
    const url = new URL(request.url);
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
      return fetch(request);
    }

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('[SW] Cached new resource:', request.url);
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Offline - Resource not available', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network First strategy for API requests (safe to cache)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('[SW] Updated cache from network:', request.url);
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, serving from cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(JSON.stringify({ 
      error: 'Offline - Data not available',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const networkResponse = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cachedResponse || networkResponse;
}

// Image optimization with WebP support
async function imageOptimization(request) {
  try {
    const url = new URL(request.url);
    
    // Check if browser supports WebP
    const acceptHeader = request.headers.get('Accept') || '';
    const supportsWebP = acceptHeader.includes('image/webp');
    
    if (supportsWebP && !url.pathname.includes('.webp')) {
      // Try to fetch WebP version first
      const webpUrl = url.pathname.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      const webpRequest = new Request(webpUrl, request);
      
      try {
        const webpResponse = await fetch(webpRequest);
        if (webpResponse.ok) {
          const cache = await caches.open(STATIC_CACHE_NAME);
          cache.put(webpRequest, webpResponse.clone());
          return webpResponse;
        }
      } catch (webpError) {
        console.log('[SW] WebP version not available, falling back to original');
      }
    }

    // Fallback to cache-first for original image
    return cacheFirst(request);
  } catch (error) {
    console.error('[SW] Image optimization failed:', error);
    return cacheFirst(request);
  }
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline form submissions when back online
  const requests = await getStoredRequests();
  
  for (const storedRequest of requests) {
    try {
      await fetch(storedRequest.url, storedRequest.options);
      await removeStoredRequest(storedRequest.id);
      console.log('[SW] Synced offline request:', storedRequest.url);
    } catch (error) {
      console.error('[SW] Failed to sync request:', error);
    }
  }
}

// Helper functions for offline storage
async function getStoredRequests() {
  // Implementation would use IndexedDB to store offline requests
  return [];
}

async function removeStoredRequest(id) {
  // Implementation would remove request from IndexedDB
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Update',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('WholeWellness Update', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
