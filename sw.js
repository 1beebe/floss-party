// Floss Party service worker: caches the app shell so it opens offline.
// Bump CACHE when any shell file changes so installed copies update.
const CACHE = "flossparty-v6";
const SHELL = [
  "./", "index.html", "manifest.webmanifest", "icon.svg",
  // tooth dances the party can pick, so they play offline too
  "animations/tooth-kit.js", "animations/lasso.html", "animations/hoop.html", "animations/limbo.html",
  "animations/jumprope.html", "animations/swing.html", "animations/whip.html", "animations/web.html",
  "animations/lantern.html",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first for pages (so updates land), cache first for everything else.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("index.html", copy)); return res; })
        .catch(() => caches.match("index.html"))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok && (new URL(req.url).origin === location.origin || req.url.startsWith("https://fonts."))) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});
