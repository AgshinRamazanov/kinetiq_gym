const CACHE_NAME = 'kinetiq-shell-v20260709-3';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icon.svg',
  './styles.css',
  './bodyfat.css',
  './home.css',
  './train.css',
  './fuel.css',
  './swap.css',
  './progress.css',
  './scanner.css',
  './logged.css',
  './macro.css',
  './meal-log.css',
  './motion.css',
  './honest-plan.css',
  './bmi.css',
  './video-audit.css',
  './body-methods.css',
  './onboarding.css',
  './workout-tracker.css',
  './substitutions.css',
  './meal-preferences.css',
  './cloud.css',
  './insights.css',
  './reminders.css',
  './supabase-config.js',
  './i18n.js',
  './app.js',
  './home.js',
  './train.js',
  './substitutions.js',
  './fuel.js',
  './meal-preferences.js',
  './progress.js',
  './scanner.js',
  './onboarding.js',
  './workout-tracker.js',
  './insights.js',
  './reminders.js',
  './pwa.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(cached => {
      const fresh = fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
      return cached || fresh;
    })
  );
});
