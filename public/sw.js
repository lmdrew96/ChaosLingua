/// <reference lib="webworker" />

const CACHE_NAME = 'chaoslingua-v1'
const STATIC_CACHE = 'chaoslingua-static-v1'
const DYNAMIC_CACHE = 'chaoslingua-dynamic-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html'
]

// API routes to cache with network-first strategy
const CACHEABLE_API_ROUTES = [
  '/api/content',
  '/api/forge/prompts'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  // Activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  // Take control immediately
  self.clients.claim()
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return
  }

  // API routes - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    if (CACHEABLE_API_ROUTES.some(route => url.pathname.startsWith(route))) {
      event.respondWith(networkFirst(request))
    }
    return
  }

  // Static assets - cache first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML pages - network first with offline fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithOffline(request))
    return
  }

  // Default - network first
  event.respondWith(networkFirst(request))
})

// Cache-first strategy
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('[SW] Cache-first fetch failed:', error)
    throw error
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    throw error
  }
}

// Network-first with offline fallback
async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    // Return offline page
    const offlinePage = await caches.match('/offline.html')
    if (offlinePage) {
      return offlinePage
    }
    throw error
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncSessions())
  }
  if (event.tag === 'sync-errors') {
    event.waitUntil(syncErrors())
  }
})

async function syncSessions() {
  console.log('[SW] Syncing sessions...')
  // Get pending sessions from IndexedDB and sync
  // Implementation depends on IndexedDB setup
}

async function syncErrors() {
  console.log('[SW] Syncing errors...')
  // Get pending errors from IndexedDB and sync
}

// Push notifications (future)
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.openWindow(url)
  )
})
