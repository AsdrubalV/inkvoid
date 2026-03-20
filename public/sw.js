const CACHE_NAME = "inkvoid-v1";
const OFFLINE_CHAPTERS_STORE = "offline-chapters";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/", "/offline.html"])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Para páginas de capítulos, intentar red primero, luego caché
  if (url.pathname.startsWith("/chapter/")) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request).then((cached) => cached ?? caches.match("/offline.html")))
    );
    return;
  }

  // Para assets estáticos, caché primero
  if (url.pathname.startsWith("/_next/static/") || url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
          return res;
        });
      })
    );
    return;
  }

  // Para el resto, red primero
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached ?? caches.match("/offline.html")))
  );
});

// Background Sync para lecturas offline
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-reads") {
    event.waitUntil(syncPendingReads());
  }
});

async function syncPendingReads() {
  const db = await openDB();
  const tx = db.transaction("pending-reads", "readwrite");
  const store = tx.objectStore("pending-reads");
  const reads = await getAllFromStore(store);

  for (const read of reads) {
    try {
      await fetch("/api/sync-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(read),
      });
      await store.delete(read.id);
    } catch {}
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("inkvoid-offline", 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("chapters")) db.createObjectStore("chapters", { keyPath: "id" });
      if (!db.objectStoreNames.contains("pending-reads")) db.createObjectStore("pending-reads", { keyPath: "id", autoIncrement: true });
      if (!db.objectStoreNames.contains("subscriptions")) db.createObjectStore("subscriptions", { keyPath: "user_id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve([]);
  });
}