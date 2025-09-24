// Service Worker for PWA functionality
const CACHE_NAME = 'boston-elp-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  OFFLINE_URL,
  // Icons
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Fonts (if using custom fonts)
  '/fonts/roboto-v30-latin-300.woff2',
  '/fonts/roboto-v30-latin-400.woff2',
  '/fonts/roboto-v30-latin-500.woff2',
  '/fonts/roboto-v30-latin-700.woff2'
];

// Runtime cache patterns
const RUNTIME_CACHE_PATTERNS = [
  // API responses (cache first)
  { pattern: /^https:\/\/api\..*\.com\/.*/, strategy: 'cacheFirst' },
  // Images (cache first)
  { pattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/, strategy: 'cacheFirst' },
  // Audio files (cache first)
  { pattern: /\.(?:mp3|wav|ogg|m4a)$/, strategy: 'cacheFirst' },
  // Video files (cache first)
  { pattern: /\.(?:mp4|webm|avi)$/, strategy: 'cacheFirst' },
  // HTML pages (network first)
  { pattern: /.*\.html$/, strategy: 'networkFirst' },
  // JavaScript and CSS (stale while revalidate)
  { pattern: /\.(?:js|css)$/, strategy: 'staleWhileRevalidate' }
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Claim all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'document') {
    // HTML documents - network first with offline fallback
    event.respondWith(handleDocumentRequest(request));
  } else if (request.destination === 'image') {
    // Images - cache first
    event.respondWith(handleImageRequest(request));
  } else if (request.url.includes('/api/')) {
    // API requests - network first with cache fallback
    event.respondWith(handleApiRequest(request));
  } else {
    // Other resources - stale while revalidate
    event.respondWith(handleGenericRequest(request));
  }
});

// Document request handler
async function handleDocumentRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful response
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Show offline page
    return caches.match(OFFLINE_URL);
  }
}

// Image request handler
async function handleImageRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Fetch from network
    const networkResponse = await fetch(request);

    // Cache successful response
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Return placeholder image or error response
    console.log('Image fetch failed:', request.url);
    return new Response('', { status: 404, statusText: 'Not Found' });
  }
}

// API request handler
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful GET responses
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache for GET requests
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Return error response
    return new Response(
      JSON.stringify({ error: 'Network unavailable' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Generic request handler
async function handleGenericRequest(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    // Try to fetch from network
    const networkResponse = await fetch(request);

    // Update cache with fresh response
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, return cached version
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('', { status: 404 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'background-sync-user-progress') {
    event.waitUntil(syncUserProgress());
  } else if (event.tag === 'background-sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync user progress when back online
async function syncUserProgress() {
  try {
    // Get stored progress data
    const progressData = await getStoredProgressData();

    if (progressData.length > 0) {
      // Send to server
      const response = await fetch('/api/user/sync-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: progressData })
      });

      if (response.ok) {
        // Clear stored data after successful sync
        await clearStoredProgressData();
        console.log('User progress synced successfully');
      }
    }
  } catch (error) {
    console.error('Failed to sync user progress:', error);
  }
}

// Sync offline actions
async function syncOfflineActions() {
  try {
    // Get stored offline actions
    const offlineActions = await getStoredOfflineActions();

    for (const action of offlineActions) {
      try {
        await fetch(action.url, action.options);
        // Remove successful action from storage
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('Failed to sync offline action:', error);
      }
    }
  } catch (error) {
    console.error('Failed to sync offline actions:', error);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: 'You have new learning content available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Start Learning',
        icon: '/icons/action-learn.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  };

  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.data = { ...options.data, ...payload.data };
  }

  event.waitUntil(
    self.registration.showNotification('Boston English Learning', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app and navigate to dashboard
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;

    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;

    case 'STORE_OFFLINE_DATA':
      storeOfflineData(payload).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

// Helper functions for IndexedDB operations
async function getStoredProgressData() {
  // Implementation would use IndexedDB to retrieve stored progress
  return [];
}

async function clearStoredProgressData() {
  // Implementation would clear IndexedDB progress data
}

async function getStoredOfflineActions() {
  // Implementation would use IndexedDB to retrieve offline actions
  return [];
}

async function removeOfflineAction(actionId) {
  // Implementation would remove specific offline action from IndexedDB
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

async function storeOfflineData(data) {
  // Implementation would store data in IndexedDB for offline use
  console.log('Storing offline data:', data);
}

console.log('Service Worker loaded successfully');