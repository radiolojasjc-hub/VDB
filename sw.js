const CACHE_NAME = 'vdb-v1';

const PRECACHE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './favicon30.png',
    './favicon192.png',
    './favicon512.png',
    './sw.js'
];

const NO_CACHE_EXT = ['.mp4', '.webm', '.mp3', '.json', '.jpg', '.jpeg', '.gif', '.svg'];
const NO_CACHE_HOSTS = [
    'raw.githubusercontent.com',
    'api.qrserver.com',
    'wa.me',
    'api.whatsapp.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net'
];

// ---------- INSTALL ----------
self.addEventListener('install', (event) => {
    console.log('[SW] Install', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
            .then(() => self.skipWaiting())
    );
});

// ---------- ACTIVATE ----------
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate', CACHE_NAME);
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((k) => k.startsWith('vdb-') && k !== CACHE_NAME)
                    .map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// ---------- FETCH ----------
self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    if (!url.protocol.startsWith('http')) return;

    const path = url.pathname.toLowerCase();
    const isNoCacheExt = NO_CACHE_EXT.some((ext) => path.endsWith(ext));
    const isNoCacheHost = NO_CACHE_HOSTS.some((host) => url.hostname.includes(host));

    // Mídia / JSON / APIs → SEMPRE rede (sem cache)
    if (isNoCacheExt || isNoCacheHost) {
        event.respondWith(
            fetch(req).catch(() => new Response('', { status: 503, statusText: 'Offline' }))
        );
        return;
    }

    // Recursos do app → Stale-While-Revalidate
    event.respondWith(
        caches.match(req).then((cached) => {
            const networkFetch = fetch(req)
                .then((response) => {
                    if (response && response.status === 200 && response.type === 'basic') {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
                    }
                    return response;
                })
                .catch(() => cached);
            return cached || networkFetch;
        })
    );
});

// ---------- MESSAGE ----------
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting();
    if (event.data === 'CLEAR_CACHE') {
        caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
    }
});
