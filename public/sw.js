const SHELL_CACHE = "leximemo-shell-v1";
const STATIC_CACHE = "leximemo-static-v1";
const APP_SHELL_URLS = [
  "/",
  "/login",
  "/register",
  "/offline",
  "/manifest.webmanifest",
  "/pwa-icons/180",
  "/pwa-icons/192",
  "/pwa-icons/512",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![SHELL_CACHE, STATIC_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticRequest(request, url) {
  return (
    request.method === "GET" &&
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/pwa-icons/") ||
      url.pathname === "/manifest.webmanifest" ||
      request.destination === "style" ||
      request.destination === "script" ||
      request.destination === "font" ||
      request.destination === "image")
  );
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    cache.put(request, response.clone());
  }

  return response;
}

async function handleNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    const cachedPage = await caches.match(request);

    if (cachedPage) {
      return cachedPage;
    }

    const offlinePage = await caches.match("/offline");
    return offlinePage || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isStaticRequest(request, url)) {
    event.respondWith(
      cacheFirst(request).catch(async () => {
        return caches.match(request);
      }),
    );
  }
});
