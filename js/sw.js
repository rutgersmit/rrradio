self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("rrradio-cache").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/js/sw.js",
        "/js/script.js",
        "/css/style.css",
        "/img/bg.png",
        "/img/logo.png",
        "/img/kink.svg",
        "/img/npo-radio-1.svg",
        "/img/npo-radio-2.svg",
        "/img/npo-radio-2-soul-jazz.png",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
