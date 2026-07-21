const CACHE = 'routineos-pro41';
const ASSETS = [
  './index.html?v=pro41',
  './css/styles.css?v=pro41',
  './js/core.js?v=pro41',
  './js/dashboard.js?v=pro41',
  './js/meals.js?v=pro41',
  './js/exercise.js?v=pro41',
  './js/professional.js?v=pro41'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin === location.origin) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
  }
});
