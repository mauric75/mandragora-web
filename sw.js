// Subí la versión acá cada vez que hagas un deploy con cambios importantes.
// Al cambiar el número, el service worker borra el caché viejo automáticamente.
const CACHE_VERSION = 'v5';
const CACHE = `mandragora-${CACHE_VERSION}`;

const ASSETS = [
  '/',
  '/index.html',
  '/escuela.html',
  '/sala.html',
  '/compania.html',
  '/cine-viajero.html',
  '/agenda.html',
  '/comunidad.html',
  '/contacto.html',
  '/reservar.html',
  '/galeria.html',
];

// Instalación: precarga las páginas base y activa la versión nueva sin esperar
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

// Activación: borra cachés de versiones anteriores y toma control de las pestañas abiertas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Solo manejamos GET; todo lo demás (POST a /api/crear-preferencia, etc.) pasa directo a la red
  if (e.request.method !== 'GET') return;

  const acceptsHTML = (e.request.headers.get('accept') || '').includes('text/html');
  const isNavigation = e.request.mode === 'navigate' || acceptsHTML;

  if (isNavigation) {
    // Network-first para páginas HTML: siempre la versión más nueva si hay conexión;
    // si no hay conexión, cae al caché como respaldo.
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Stale-while-revalidate para el resto (imágenes, fuentes, etc.):
    // muestra lo que haya en caché al toque, y de paso actualiza el caché en segundo plano.
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const fetchAndUpdate = fetch(e.request)
          .then((res) => {
            caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
            return res;
          })
          .catch(() => cached);
        return cached || fetchAndUpdate;
      })
    );
  }
});

// --- Web Push: notificaciones ---
self.addEventListener('push', (e) => {
  let data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch (err) {
    data = { title: 'Mandrágora', body: e.data ? e.data.text() : '' };
  }

  const title = data.title || 'Mandrágora';
  const options = {
    body: data.body || '',
    icon: '/assets/brand-logos/iso.png',
    badge: '/assets/brand-logos/iso.png',
    data: { url: data.url || '/' },
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
