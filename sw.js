const CACHE_NAME = 'ideasphere-v1';
const ASSETS = [
  '/ideasphere/',
  '/ideasphere/index.html',
  '/ideasphere/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if(res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'IdeaSphere', {
      body: data.body || 'New activity on your idea!',
      icon: 'https://via.placeholder.com/192x192/16a34a/ffffff?text=IS',
      badge: 'https://via.placeholder.com/72x72/16a34a/ffffff?text=IS',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/ideasphere/' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/ideasphere/'));
});
