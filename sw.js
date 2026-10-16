/* 747-8F Tech Guide service worker. Cache name changes with every build, so a new build replaces the old copy. */
const VERSION = "e5dc3c7640";
const SHELL = "b748-shell-" + VERSION;
const FONTS = "b748-fonts-v1";
const ASSETS = ["./", "index.html", "manifest.webmanifest", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("b748-shell-") && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => { if (e.data === "skip") self.skipWaiting(); });

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Google Fonts: serve from cache, refresh in the background when online.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FONTS).then(async (c) => {
      const hit = await c.match(e.request);
      const net = fetch(e.request).then((r) => { if (r.ok || r.type === "opaque") c.put(e.request, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // Page loads: try the network briefly so a new build or an expired login (Cloudflare Access) is seen;
  // fall back to the cached copy when offline or the connection is slow.
  if (e.request.mode === "navigate") {
    e.respondWith((async () => {
      const cached = await caches.match("index.html");
      try {
        const net = await Promise.race([fetch(e.request), new Promise((_, no) => setTimeout(() => no(new Error("slow")), 3500))]);
        if (net.type === "opaqueredirect" || net.status >= 300) return net;
        if (net.ok && (net.headers.get("content-type") || "").includes("text/html")) (await caches.open(SHELL)).put("index.html", net.clone());
        return net;
      } catch (err) {
        return cached || Response.error();
      }
    })());
    return;
  }
  // Other app files: cache first.
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).catch(() => caches.match("index.html"))));
});
