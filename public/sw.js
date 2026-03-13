const CACHE_NAME = 'advaydecor-cache-v2';
const ASSETS_TO_CACHE = [
    '/manifest.json',
    '/logo.ico',
];

// Install Event - skip waiting to activate immediately
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('PWA: Caching essential shell...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate Event (Cleanup old caches and claim clients immediately)
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
        }).then(() => self.clients.claim())
    );
});

// Fetch Event (Network-first, never cache Next.js bundles)
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // NEVER cache API routes
    if (event.request.url.includes('/api/')) return;

    // NEVER cache Next.js build assets — these change on every code update
    if (event.request.url.includes('/_next/')) return;

    // For everything else: Network first, fallback to cache
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Cache successful responses for offline fallback (images, static files only)
                if (networkResponse && networkResponse.status === 200) {
                    const isStaticAsset = event.request.url.match(/\.(png|jpg|jpeg|svg|ico|woff2)$/);
                    if (isStaticAsset) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                }
                return networkResponse;
            })
            .catch(() => caches.match(event.request))
    );
});
