const CACHE_NAME = "nibiru-lxl-final-supabase-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "/assets/logo-nibiru-red.png",
  "/assets/logo-nibiru-blue.png",
  "/assets/home-art-dark.webp?v=4?v=4",
  "/assets/home-art-light.webp",
  "/assets/background-dark.webp",
  "/assets/background-light.webp",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});


