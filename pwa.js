(function registerKinetiqServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(registration => {
      registration.update();
    }).catch(error => {
      console.info('KINETIQ offline mode is unavailable:', error);
    });
  });

  // Taking control must not interrupt a first-time visit with a reload.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.dispatchEvent(new CustomEvent('kinetiqServiceWorkerReady'));
  });
})();
