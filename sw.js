const CACHE_NAME = 'digits-bc-v1';

// Instalasi Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Aktivasi Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Fetch Handler (Syarat wajib Chrome agar tombol Install PWA muncul)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Listener untuk menerima Push Notification dari Server / Trigger
self.addEventListener('push', (event) => {
  let data = {
    title: 'DigiTS-BC XI-Bilingual',
    body: 'Pesan notifikasi real-time masuk ke perangkat Anda.',
    icon: 'ts.png',
    badge: 'ts.png'
  };

  if (event.data) {
    try {
      const incoming = event.data.json();
      data = { ...data, ...incoming };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    data: {
      url: self.registration.scope
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Ketika notifikasi di HP diklik, buka aplikasi WebView DigiTS-BC
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});