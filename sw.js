/* Service Worker: offline cache for the protein design guide */
const CACHE_NAME = "pdg-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./concepts.html",
  "./software.html",
  "./literature.html",
  "./resources.html",
  "./glossary.html",
  "./practice.html",
  "./practice-task.html",
  "./disclaimer.html",
  "./courses.html",
  "./message.html",
  "./quiz.html",
  "./manifest.webmanifest",
  "./assets/style.css",
  "./assets/app.js",
  "./assets/practice-data.js",
  "./assets/quiz-data.js",
  "./assets/paid-gate.js",
  "./assets/vendor/qrcode.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
