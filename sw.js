const CACHE_NAME = 'vdb-v1';

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // ❌ NÃO cachear: GitHub raw, JSONs, vídeos, imagens, APIs externas
    if (
        url.includes('raw.githubusercontent.com') ||
        url.endsWith('.json') ||
        url.endsWith('.mp4') ||
        url.endsWith('.webm') ||
        url.endsWith('.png') ||
        url.endsWith('.jpg') ||
        url.endsWith('.jpeg') ||
        url.includes('api.qrserver.com') ||
        url.includes('wa.me') ||
        url.includes('fonts.googleapis.com') ||
        url.includes('fonts.gstatic.com') ||
        url.includes('cdnjs.cloudflare.com')
    ) {
        // Network-first, sem cache
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // Para HTML/CSS/JS do app: network-first também
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
