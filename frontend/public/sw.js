// RoutineMate – Service Worker for Web Push Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for incoming Push Events from backend
self.addEventListener('push', (event) => {
  let data = {
    title: 'RoutineMate – Routine Reminder',
    body: 'You have a scheduled routine due now.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'routine-notification',
    data: {}
  };

  try {
    if (event.data) {
      const json = event.data.json();
      data.title = json.title || data.title;
      data.body = json.body || data.body;
      data.icon = json.icon || data.icon;
      data.badge = json.badge || data.badge;
      data.data = json.data || {};
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag || 'routine-' + Date.now(),
    data: data.data,
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Open Dashboard' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open or focus the RoutineMate web app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
