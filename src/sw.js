const CACHE_NAME = 'rrradio-v1';
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
    '/img/station_placeholder.png',
    '/img/favicon.ico',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                // Try to fetch from network
                return fetch(event.request).catch(() => {
                    // If network fails and it's a navigation request, return cached index.html
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                    // For other requests, return a fallback or undefined
                    return undefined;
                });
            })
    );
});

// Background sync for maintaining playback state
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'KEEP_ALIVE') {
        // Keep service worker alive for background playback
        event.waitUntil(Promise.resolve());
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
