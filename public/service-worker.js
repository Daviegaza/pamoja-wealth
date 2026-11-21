/* eslint-disable no-undef */
/* Pamoja Wealth service worker — app shell caching only.
 * Strategies:
 *   - HTML shell: network-first, fallback to cached index.html.
 *   - Same-origin static assets (JS/CSS/images): stale-while-revalidate.
 *   - API requests (any origin) and cross-origin requests: never intercepted or
 *     cached. Chama records must always be fresh and must not persist on a
 *     shared phone after logout.
 *   - Mutations are never queued/replayed offline: replaying a "record
 *     contribution" later could create duplicate financial records.
 */
const CACHE = "pamoja-v2";
const SHELL = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html")),
    );
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => cached);
  return cached ?? network;
}

// Push events (FCM web push).
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title ?? "Pamoja Wealth";
  const body = data.body ?? "";
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.clickAction ?? "/";
  event.waitUntil(clients.openWindow(url));
});
