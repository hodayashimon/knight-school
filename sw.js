/*!
 * sw.js - offline caching for the hosted (GitHub Pages) copy of Knight School.
 *
 * Not needed and not registered for the local file:// copy - that version
 * already works offline because the app makes no network calls at all. This
 * exists purely so the hosted URL, once opened while online, keeps working
 * with no connection: install a PWA from a plane seat, then use it there.
 *
 * Strategy: network-falling-back-to-cache for every same-origin GET.
 *   - Online:  always fetch fresh, and update the cache with what came back.
 *   - Offline: serve the last successful response for that URL.
 * This means a code update (a fresh push to the repo) is picked up the next
 * time the visitor has a connection, without a stale copy lingering forever.
 *
 * Bump CACHE_NAME on a release that meaningfully changes the asset list, so
 * old cache entries get swept on activate rather than accumulating.
 */
'use strict';

var CACHE_NAME = 'knight-school-v1';

/* Precached on install, so a device that installs the app while online and
   never visits again while online can still open it offline immediately -
   without this, only URLs actually requested would ever be cached. */
var CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/i18n.js',
  './js/engine.js',
  './js/ai.js',
  './js/board.js',
  './js/lessons.js',
  './js/puzzles.js',
  './js/guide.js',
  './js/app.js',
  './favicon.ico',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
    }).then(function () {
      /* Take over immediately rather than waiting for every open tab of the
         old version to close - a chess app has no mid-session state that a
         surprise reload would lose in a way that matters. */
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;

  /* Only ever cache GET, and only this origin - a cross-origin or POST
     request has no business being intercepted here. */
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request).then(function (response) {
      /* Opaque or error responses are not worth caching, but are still
         returned to the page - just not remembered for offline use. */
      if (response && response.ok) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
      }
      return response;
    }).catch(function () {
      return caches.match(request).then(function (cached) {
        if (cached) return cached;
        /* A never-cached page with no network: nothing sensible to return. */
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return Response.error();
      });
    })
  );
});
