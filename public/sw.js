/**
 * Service Worker for CNC Control Application
 * 
 * Provides offline functionality, background sync, push notifications,
 * and cache management for the CNC control PWA.
 */

const CACHE_NAME = 'cnc-control-v1.0.0';
const STATIC_CACHE_NAME = 'cnc-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'cnc-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html', // Offline fallback page
];

// API routes that should be cached
const CACHEABLE_API_ROUTES = [
  '/api/machine/status',
  '/api/settings',
  '/api/jobs',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with cache-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets - cache first
    if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
      event.respondWith(cacheFirst(request));
    }
    // API routes - network first with cache fallback
    else if (CACHEABLE_API_ROUTES.some(route => url.pathname.startsWith(route))) {
      event.respondWith(networkFirstWithCache(request));
    }
    // Navigation requests - network first with offline fallback
    else if (request.mode === 'navigate') {
      event.respondWith(networkFirstWithOfflineFallback(request));
    }
    // Other resources - cache first with network fallback
    else {
      event.respondWith(cacheFirst(request));
    }
  }
  // Non-GET requests - network only (for machine control)
  else {
    event.respondWith(networkOnlyWithOfflineQueue(request));
  }
});

// Cache-first strategy (for static assets)
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    return new Response('Network error', { status: 408 });
  }
}

// Network-first with cache fallback (for API routes)
async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'This data is not available offline' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Network-first with offline fallback (for navigation)
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Network failed for navigation, serving offline page');
    
    const cache = await caches.open(STATIC_CACHE_NAME);
    const offlinePage = await cache.match('/offline.html');
    
    return offlinePage || new Response('Offline', { status: 503 });
  }
}

// Network-only with offline queueing (for machine control)
async function networkOnlyWithOfflineQueue(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('Network failed for control request, queueing for later');
    
    // Queue the request for background sync
    await queueRequestForSync(request);
    
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Command queued for when connection is restored',
      queued: true
    }), {
      status: 202, // Accepted
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event', event.tag);
  
  if (event.tag === 'cnc-data-sync') {
    event.waitUntil(processSyncQueue());
  }
});

// Queue requests for background sync
async function queueRequestForSync(request) {
  try {
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.text() : null,
      timestamp: Date.now(),
    };
    
    // Store in IndexedDB for persistence
    const db = await openSyncDatabase();
    const transaction = db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    
    await store.add(requestData);
    
    console.log('Request queued for sync:', requestData);
  } catch (error) {
    console.error('Failed to queue request for sync:', error);
  }
}

// Process queued sync requests
async function processSyncQueue() {
  try {
    const db = await openSyncDatabase();
    const transaction = db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    
    const queuedRequests = await store.getAll();
    
    for (const requestData of queuedRequests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body,
        });
        
        if (response.ok) {
          // Remove from queue on successful sync
          await store.delete(requestData.id);
          console.log('Successfully synced queued request:', requestData.url);
        } else {
          console.error('Failed to sync request:', requestData.url, response.status);
        }
      } catch (error) {
        console.error('Error syncing request:', requestData.url, error);
      }
    }
  } catch (error) {
    console.error('Failed to process sync queue:', error);
  }
}

// IndexedDB for persistent storage
function openSyncDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cnc_sync_db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('sync_queue')) {
        const store = db.createObjectStore('sync_queue', { 
          keyPath: 'id',
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData = { title: 'CNC Alert', body: event.data.text() };
    }
  }
  
  const {
    title = 'CNC Control',
    body = 'Machine notification',
    icon = '/icons/icon-192x192.png',
    badge = '/icons/badge-72x72.png',
    tag = 'cnc-alert',
    requireInteraction = false,
    actions = []
  } = notificationData;
  
  const notificationOptions = {
    body,
    icon,
    badge,
    tag,
    requireInteraction,
    actions,
    data: notificationData,
    vibrate: notificationData.vibrate || [100, 50, 100],
  };
  
  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  const { action, data } = event;
  
  // Handle notification actions
  if (action === 'view') {
    event.waitUntil(
      clients.openWindow(data.url || '/')
    );
  } else if (action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // If app is already open, focus it
          for (const client of clientList) {
            if (client.url === self.location.origin && 'focus' in client) {
              return client.focus();
            }
          }
          // Otherwise, open new window
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Message event (for communication with main thread)
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_MACHINE_DATA':
      cacheMachineData(data);
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      });
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// Cache machine data for offline access
async function cacheMachineData(data) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put('/api/machine/status', response);
    console.log('Machine data cached successfully');
  } catch (error) {
    console.error('Failed to cache machine data:', error);
  }
}

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('All caches cleared');
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}

// Get total cache size
async function getCacheSize() {
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const arrayBuffer = await response.arrayBuffer();
          totalSize += arrayBuffer.byteLength;
        }
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Failed to calculate cache size:', error);
    return 0;
  }
}

// Periodic cleanup of old cache entries
setInterval(async () => {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    
    // Remove entries older than 24 hours
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime();
          if (responseDate < oneDayAgo) {
            await cache.delete(request);
            console.log('Cleaned up old cache entry:', request.url);
          }
        }
      }
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}, 60 * 60 * 1000); // Run every hour

console.log('Service Worker: Loaded and ready');