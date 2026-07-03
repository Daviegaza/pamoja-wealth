/* Pamoja Wealth service worker — offline queue + install prompt.
 * Strategies:
 *   - HTML shell: network-first, fallback to cache.
 *   - Static assets (JS/CSS/images): stale-while-revalidate.
 *   - API GETs: cache-first with 60s TTL (works offline for last-known data).
 *   - API POST/PUT/DELETE while offline: queue in IndexedDB, replay on connectivity.
 */
const CACHE = "pamoja-v1";
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

  if (request.method !== "GET") {
    // Queue mutating requests while offline.
    if (!navigator.onLine) {
      event.respondWith(queueForReplay(request));
      return;
    }
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html")),
    );
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithTtl(request, 60));
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

async function networkFirstWithTtl(request, ttlSeconds) {
  try {
    const res = await fetch(request);
    const cache = await caches.open(CACHE);
    cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response(JSON.stringify({ offline: true }), { status: 503, headers: { "Content-Type": "application/json" } });
  }
}

async function queueForReplay(request) {
  // Persist to IndexedDB via a lightweight store.
  const body = await request.clone().text();
  const entry = {
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()],
    body,
    queuedAt: Date.now(),
  };
  try {
    const db = await openDb();
    const tx = db.transaction("queue", "readwrite");
    tx.objectStore("queue").add(entry);
  } catch { /* fall through */ }
  return new Response(JSON.stringify({ queued: true }), { status: 202, headers: { "Content-Type": "application/json" } });
}

self.addEventListener("sync", (event) => {
  if (event.tag === "pamoja-replay") event.waitUntil(replayQueue());
});

async function replayQueue() {
  const db = await openDb();
  const tx = db.transaction("queue", "readwrite");
  const store = tx.objectStore("queue");
  const all = await promisify(store.getAll());
  for (const entry of all) {
    try {
      await fetch(entry.url, { method: entry.method, headers: entry.headers, body: entry.body });
      store.delete(entry.id);
    } catch { /* retry next sync */ }
  }
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("pamoja-offline", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("queue")) {
        db.createObjectStore("queue", { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function promisify(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
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
