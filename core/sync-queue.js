(function bootstrapSyncQueue(global) {
  'use strict';
  const DB_NAME = 'kinetiq-sync';
  const STORE = 'outbox';

  function database() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'key' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function transaction(mode, action) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = action(tx.objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  }

  const queue = Object.freeze({
    put(change) { return transaction('readwrite', store => store.put(change)); },
    remove(key) { return transaction('readwrite', store => store.delete(key)); },
    all() { return transaction('readonly', store => store.getAll()); }
  });
  global.Kinetiq = Object.assign(global.Kinetiq || {}, { syncQueue: queue });
})(window);
