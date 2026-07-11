# KINETIQ architecture

KINETIQ uses a small browser-first architecture with no build step.

## Loading order

1. Configuration and translations.
2. `core/` shared infrastructure.
3. Feature scripts such as training, nutrition, progress, and reminders.
4. PWA and optional cloud synchronization.

Feature scripts may use the compatibility globals `readLocal`, `writeLocal`, and
`navigate`. New shared behavior belongs under `core/` and should also be exposed
through the `window.Kinetiq` namespace. Feature-specific behavior should remain in
its feature file.

## Core APIs

- `Kinetiq.storage.read(key, fallback)` safely reads JSON data.
- `Kinetiq.storage.write(key, value)` saves JSON and emits `localDataChanged`.
- `Kinetiq.storage.remove(key)` removes data and emits `localDataChanged`.
- `Kinetiq.ui.navigate(id)` changes the active main screen.
- `Kinetiq.ui.openSheet(id)` and `closeSheet(element)` manage modal sheets.
- `Kinetiq.syncQueue` stores pending cloud writes in IndexedDB and retries them
  after connectivity returns.

Cloud rows use optimistic revisions. A write succeeds only from the revision the
device last observed. If another device changed the same key first, the remote
version is retained and the unsent local value is preserved in
`kinetiq-sync-conflicts` instead of being silently destroyed.

Whenever a new local JavaScript or CSS file is required at startup, add it to
`APP_SHELL` in `sw.js` and bump `CACHE_NAME`.
