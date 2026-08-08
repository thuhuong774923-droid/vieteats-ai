const CACHE_NAME = "vieteats-ai-cache-v1";
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Chiến lược: Network First cho API, Cache First cho static asset, fallback offline cho điều hướng trang
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Không cache API calls - luôn ưu tiên dữ liệu mới nhất, chỉ fallback lỗi mạng
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ success: false, message: "Bạn đang offline" }), {
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  // Điều hướng trang (navigation) - network first, fallback trang offline khi mất mạng
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Static assets (ảnh, css, js, font) - cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});

// Nhận push notification từ Firebase Cloud Messaging
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const payload = event.data.json();
  const { title, body, icon } = payload.notification || {};
  event.waitUntil(
    self.registration.showNotification(title || "VietEats AI", {
      body: body || "Bạn có thông báo mới",
      icon: icon || "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    })
  );
});
