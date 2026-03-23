/* eslint-disable no-restricted-globals */

// Minimal service worker required for web push token registration.
// Push handling can be enhanced later depending on your provider/payload shape.

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : undefined };
  }

  const title = payload.title || "Notification";
  const options = {
    body: payload.body,
    data: payload.data ?? payload,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of allClients) {
        if ("focus" in client) return client.focus();
      }

      if (self.clients.openWindow) return self.clients.openWindow("/");
    })(),
  );
});

