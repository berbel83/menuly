/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{
    revision: string | null;
    url: string;
  }>;
};

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener("push", (event) => {
  let data = {
    title: "Compausa",
    body: "Tienes una nueva notificación.",
    icon: "/pwa-192x192.png",
    badge: "/favicon-64x64.png",
    url: "/",
  };

  if (event.data) {
    try {
      const received = event.data.json();

      data = {
        ...data,
        ...received,
      };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        data: {
          url: data.url,
        },
      }
    )
  );
});

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const url =
      event.notification.data?.url ?? "/";

    event.waitUntil(
      self.clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clients) => {
          for (const client of clients) {
            if ("focus" in client) {
              client.navigate(url);
              return client.focus();
            }
          }

          return self.clients.openWindow(url);
        })
    );
  }
);

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});