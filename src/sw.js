// Update this version number for each deployment to force cache refresh
const CACHE_VERSION = 'rrradio-v' + Date.now(); // This ensures a unique cache name for each deployment
const CACHE_NAME = CACHE_VERSION;

const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/mediaSession.js',
    '/manifest.json',
    '/img/icon-16.png',
    '/img/icon-32.png',
    '/img/icon-192.png',
    '/img/icon-512.png',
    '/img/station_placeholder.svg',
    '/img/favicon.ico',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', event => {
    console.log('Service Worker installing with cache:', CACHE_NAME);
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app shell with version:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
    );
});

// Clean up old caches when activating
self.addEventListener('activate', event => {
    console.log('Service Worker activating');
    // Take control of all pages immediately
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all pages immediately
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {
    // For app shell resources, use network-first strategy to get updates
    if (urlsToCache.some(url => event.request.url.includes(url.replace('/', '')))) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // If network request succeeded, update cache and return response
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    // If network fails, fall back to cache
                    return caches.match(event.request)
                        .then(response => {
                            if (response) {
                                return response;
                            }
                            // If navigation request and no cache, return index.html
                            if (event.request.mode === 'navigate') {
                                return caches.match('/index.html');
                            }
                            return undefined;
                        });
                })
        );
    } else {
        // For other requests (external resources), use cache-first
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    return response || fetch(event.request);
                })
        );
    }
});

// Background sync for maintaining playback state
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'KEEP_ALIVE') {
        // Keep service worker alive for background playback
        event.waitUntil(Promise.resolve());
    } else if (event.data && event.data.type === 'SKIP_WAITING') {
        // Force the waiting service worker to become active
        self.skipWaiting();
    }
});

// Notify clients when a new service worker is ready
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CHECK_UPDATE') {
        // Send update available message to all clients
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'UPDATE_AVAILABLE'
                });
            });
        });
    }
});

// Handle background audio interruptions
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    // Focus the app when notification is clicked
    event.waitUntil(
        clients.matchAll().then(clientList => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('/');
        })
    );
});
