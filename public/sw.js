const CACHE_NAME = 'advaydecor-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/logo.ico',
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('PWA: Caching essential shell...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate Event (Cleanup old caches)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('PWA: Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch Event (Safe Networking)
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // We should NOT cache dynamic API routes to prevent stale pricing or user data
    if (event.request.url.includes('/api/')) {
        return;
    }

    // Network-First approach for most navigations (ensures fresh data)
    // Stale-While-Revalidate for images and static assets
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Only cache successful GET requests for non-API domains
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            });

            // Use cached asset if it's an image or static file, otherwise wait for network
            const isStaticAsset = event.request.url.match(/\.(png|jpg|jpeg|svg|ico|css|js|woff2|json)$/);
            if (isStaticAsset && cachedResponse) {
                return cachedResponse;
            }

            return fetchPromise.catch(() => cachedResponse);
        })
    );
});
