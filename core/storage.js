(function bootstrapStorage(global) {
  'use strict';

  function readLocal(key, fallback) {
    try {
      const raw = global.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function writeLocal(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      global.dispatchEvent(new CustomEvent('localDataChanged', { detail: { key, value } }));
      return true;
    } catch {
      return false;
    }
  }

  function removeLocal(key) {
    try {
      global.localStorage.removeItem(key);
      global.dispatchEvent(new CustomEvent('localDataChanged', { detail: { key, value: null } }));
      return true;
    } catch {
      return false;
    }
  }

  global.Kinetiq = Object.assign(global.Kinetiq || {}, {
    storage: Object.freeze({ read: readLocal, write: writeLocal, remove: removeLocal })
  });

  // Compatibility aliases keep existing feature scripts stable during migration.
  global.readLocal = readLocal;
  global.writeLocal = writeLocal;
})(window);
