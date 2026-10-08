const CACHE_NAME = 'vertice-cache-v1';

// Instalación: El Service Worker se activa
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Interceptor de tráfico de red
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // REGLA FINANCIERA: Jamás cachear la API ni peticiones que no sean GET
    if (url.pathname.startsWith('/api') || event.request.method !== 'GET') {
        return; // Pasa directo al servidor de OVH
    }

    // Para archivos estáticos (HTML, CSS, JS, Iconos): Red primero, fallback a caché
    event.respondWith(
        fetch(event.request)
        .then((response) => {
            // Si la red responde, guardamos una copia fresca en caché
            if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
            }
            return response;
        })
        .catch(() => {
            // Si no hay internet, servimos lo que tengamos guardado
            return caches.match(event.request);
        })
    );
});