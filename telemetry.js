(() => {
  const send = payload => {
    if (navigator.doNotTrack === '1') return;
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) navigator.sendBeacon('/api/telemetry', new Blob([body], { type: 'application/json' }));
    else fetch('/api/telemetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  };
  send({ event: 'page_view', page: location.pathname });
  document.addEventListener('click', event => {
    const feature = event.target.closest('[data-open]')?.dataset.open;
    if (feature) send({ event: 'feature_open', page: location.pathname, feature });
  });
  addEventListener('error', event => send({ event: 'client_error', page: location.pathname, feature: String(event.error?.name || 'Error') }));
  addEventListener('unhandledrejection', event => send({ event: 'client_error', page: location.pathname, feature: String(event.reason?.name || 'UnhandledRejection') }));
})();
