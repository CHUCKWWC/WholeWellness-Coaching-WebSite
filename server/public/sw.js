const CURRENT_VERSION = 'v6';
const STATIC_CACHE = `wholewellness-static-${CURRENT_VERSION}`;
const DYNAMIC_CACHE = `wholewellness-dynamic-${CURRENT_VERSION}`;

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Helper: Check if URL should bypass cache (sensitive/dynamic data)
const shouldBypassCache = (url) =>
  url.pathname.startsWith('/api/auth') ||
  url.pathname.startsWith('/api/admin') ||
  url.pathname.startsWith('/api/user') ||
  url.pathname.startsWith('/api/assessments') ||
  url.pathname.startsWith('/api/digest') ||
  url.pathname.startsWith('/api/ai-coaching') ||
  url.pathname.startsWith('/api/crisis-alerts') ||
  url.pathname.startsWith('/api/chat');

// Install event
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(STATIC_ASSETS);
  })());
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !k.includes(CURRENT_VERSION)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass cache for sensitive/dynamic endpoints - always fetch fresh
  if (shouldBypassCache(url)) {
    console.log('[SW] Network-only (no cache):', url.pathname);
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => new Response(null, { status: 503 }))
    );
    return;
  }

  // Only apply caching strategies to GET requests
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first for static assets only
  if (url.origin === location.origin &&
      (url.pathname.startsWith('/assets') || 
       url.pathname.endsWith('.webmanifest') || 
       url.pathname.endsWith('/favicon.ico') ||
       url.pathname.includes('/icons/'))) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Everything else (GET requests only): network-first with cache fallback
  event.respondWith(networkFirst(event.request));
});

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
      const cache = await caches.open(STATIC_CACHE);
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

// Network First strategy with cache fallback
async function networkFirst(request) {
  try {
    // Skip chrome-extension and other unsupported schemes
    const url = new URL(request.url);
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
      return fetch(request);
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
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
