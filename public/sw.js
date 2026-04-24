// La Boutique de la Elegancia - Service Worker
// Estrategias:
//   - App shell (HTML): network-first con fallback a cache (offline.html si falla)
//   - Assets versionados /assets/*: cache-first, inmutables (1 año)
//   - Imágenes (Cloudinary, Unsplash, public/*): cache-first con expiración suave
//   - Firestore/Firebase/API: network-only (NO cachear — datos sensibles/mutables)

const SW_VERSION = 'v1.0.0';
const SHELL_CACHE = `lbe-shell-${SW_VERSION}`;
const ASSETS_CACHE = `lbe-assets-${SW_VERSION}`;
const IMAGES_CACHE = `lbe-images-${SW_VERSION}`;

const SHELL_URLS = [
    '/',
    '/offline.html',
    '/manifest.webmanifest',
    '/assets/logo-main.png',
];

const IMAGE_HOSTS = [
    'res.cloudinary.com',
    'images.unsplash.com',
];

const NEVER_CACHE_HOSTS = [
    'firestore.googleapis.com',
    'firebase.googleapis.com',
    'identitytoolkit.googleapis.com',
    'securetoken.googleapis.com',
    'www.googletagmanager.com',
    'www.google-analytics.com',
    'analytics.google.com',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE).then((cache) =>
            cache.addAll(SHELL_URLS).catch(() => { /* tolerar 404s en precarga */ })
        )
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys
                .filter((k) => ![SHELL_CACHE, ASSETS_CACHE, IMAGES_CACHE].includes(k))
                .map((k) => caches.delete(k))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

const isImage = (url) =>
    IMAGE_HOSTS.some((h) => url.hostname.endsWith(h)) ||
    /\.(png|jpe?g|webp|avif|gif|svg|ico)(\?|$)/i.test(url.pathname);

const isNeverCache = (url) =>
    NEVER_CACHE_HOSTS.some((h) => url.hostname.endsWith(h));

const isAsset = (url) =>
    url.origin === self.location.origin && url.pathname.startsWith('/assets/');

const isNavigation = (request) =>
    request.mode === 'navigate' ||
    (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Skip chrome-extension, data:, etc.
    if (!['http:', 'https:'].includes(url.protocol)) return;

    // Never cache Firebase/Analytics — passthrough.
    if (isNeverCache(url)) return;

    // App shell navigation: network-first, fallback to cached shell, then offline.html
    if (isNavigation(request)) {
        event.respondWith((async () => {
            try {
                const fresh = await fetch(request);
                const cache = await caches.open(SHELL_CACHE);
                cache.put('/', fresh.clone()).catch(() => { });
                return fresh;
            } catch (err) {
                const cached = await caches.match('/');
                if (cached) return cached;
                const offline = await caches.match('/offline.html');
                if (offline) return offline;
                return new Response('Sin conexión', { status: 503, headers: { 'Content-Type': 'text/plain' } });
            }
        })());
        return;
    }

    // Versioned assets: cache-first (immutable).
    if (isAsset(url)) {
        event.respondWith((async () => {
            const cached = await caches.match(request);
            if (cached) return cached;
            try {
                const fresh = await fetch(request);
                if (fresh.ok) {
                    const cache = await caches.open(ASSETS_CACHE);
                    cache.put(request, fresh.clone()).catch(() => { });
                }
                return fresh;
            } catch {
                return Response.error();
            }
        })());
        return;
    }

    // Images: cache-first with stale-while-revalidate.
    if (isImage(url)) {
        event.respondWith((async () => {
            const cache = await caches.open(IMAGES_CACHE);
            const cached = await cache.match(request);
            const network = fetch(request).then((res) => {
                if (res && res.ok) cache.put(request, res.clone()).catch(() => { });
                return res;
            }).catch(() => null);
            return cached || (await network) || Response.error();
        })());
        return;
    }

    // Default: try network, fallback to cache if any.
    event.respondWith((async () => {
        try {
            return await fetch(request);
        } catch {
            const cached = await caches.match(request);
            return cached || Response.error();
        }
    })());
});
