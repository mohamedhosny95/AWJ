import './compat-context.mjs';
import test from "node:test";
import assert from "node:assert/strict";

function createMockIndexedDB() {
  const stores = new Map();
  return {
    _stores: stores,
    _failOpen: false,
    open(name, version) {
      const request = { result: null, error: null, onsuccess: null, onerror: null, onupgradeneeded: null };
      setTimeout(() => {
        if(this._failOpen){request.error=Error("Device storage unavailable");request.onerror?.();return;}
        if (!stores.has("records")) stores.set("records", new Map());
        const db = {
          createObjectStore(storeName) {
            if (!stores.has(storeName)) stores.set(storeName, new Map());
            return {};
          },
          transaction(storeNames, mode = "readonly") {
            const storeMap = stores.get("records");
            let pendingOps = 0;
            let completeCallback = null;
            function maybeComplete() {
              if (pendingOps === 0 && completeCallback) {
                const cb = completeCallback;
                completeCallback = null;
                setTimeout(cb, 0);
              }
            }
            return {
              objectStore(storeName) {
                return {
                  get(key) {
                    pendingOps++;
                    const req = { result: undefined, error: null, onsuccess: null, onerror: null };
                    setTimeout(() => {
                      req.result = storeMap.get(key);
                      if (req.onsuccess) req.onsuccess();
                      pendingOps--;
                      maybeComplete();
                    }, 0);
                    return req;
                  },
                  put(value, key) {
                    storeMap.set(key, JSON.parse(JSON.stringify(value)));
                  },
                  clear() {
                    storeMap.clear();
                  }
                };
              },
              get oncomplete() { return completeCallback; },
              set oncomplete(fn) {
                completeCallback = fn;
                maybeComplete();
              }
            };
          },
          close() {}
        };
        request.result = db;
        if (request.onsuccess) request.onsuccess();
      }, 0);
      return request;
    }
  };
}

function createMockLocalStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.get(key) || null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); }
  };
}

test("storage.js single-step migration backfills missing LARGE_KEYS from legacy state", async () => {
  const mockIDB = createMockIndexedDB();
  const mockStorage = createMockLocalStorage();
  globalThis.window = globalThis;
  globalThis.indexedDB = mockIDB;
  globalThis.localStorage = mockStorage;
  globalThis.document = { addEventListener: () => {} };
  globalThis.addEventListener = () => {};

  // 1. Seed legacy monolithic state in records store
  const records = new Map();
  records.set("state", {
    history: [{ date: "2026-08-01", session: "gym", exercises: [] }],
    foodEntries: [{ id: "food-1", name: "Oatmeal", calories: 350 }],
    sleepLogs: [{ date: "2026-08-01", hours: 7.5 }],
    daily: { habits: { "2026-08-01": { habit1: true } } }
  });
  mockIDB._stores.set("records", records);

  // 2. Load storage.js
  await import("../src/client/storage.js");
  const store = globalThis.AWJ_STORE;

  // 3. Hydrate state
  const hydrated = await store.hydrate(AWJ_COMPAT.stateKey);

  // 4. Verify backfill of LARGE_KEYS
  assert.equal(hydrated.history.length, 1);
  assert.equal(hydrated.history[0].session, "gym");
  assert.equal(hydrated.foodEntries.length, 1);
  assert.equal(hydrated.foodEntries[0].name, "Oatmeal");
  assert.equal(hydrated.sleepLogs[0].hours, 7.5);

  // 5. When a mutation is made, persist updates the individual partitioned record
  hydrated.history.push({ date: "2026-08-02", session: "cardio", exercises: [] });
  store.persist(AWJ_COMPAT.stateKey, hydrated);
  await store.flush();

  assert.equal(records.get("state:history").length, 2);
  assert.equal(records.get("state:history")[1].session, "cardio");

  // A full device store must never be presented as a successful local save.
  mockStorage.setItem = () => { throw Error("Quota exceeded"); };
  assert.equal(store.persist(AWJ_COMPAT.stateKey, hydrated), false);
  assert.equal(store.saveStatus, "failed");
});

test("unavailable storage preserves legacy data instead of hydrating an empty success",async()=>{
  const mockIDB=createMockIndexedDB(),mockStorage=createMockLocalStorage();
  globalThis.window=globalThis;globalThis.indexedDB=mockIDB;globalThis.localStorage=mockStorage;
  globalThis.document={addEventListener(){}};globalThis.addEventListener=()=>{};
  const legacy=JSON.stringify({history:[{id:"keep-me",session:"gym"}],preferences:{weightUnit:"lb"}});
  mockStorage.setItem(AWJ_COMPAT.stateKey,legacy);mockIDB._failOpen=true;
  await import("../src/client/storage.js?unavailable-test");
  await assert.rejects(globalThis.AWJ_STORE.hydrate(AWJ_COMPAT.stateKey),/unavailable/);
  assert.equal(mockStorage.getItem(AWJ_COMPAT.stateKey),legacy);
  assert.equal(globalThis.AWJ_STORE.saveStatus,"failed");
});

test("a failed durable write stays retryable and is confirmed only after recovery",async()=>{
  const mockIDB=createMockIndexedDB(),mockStorage=createMockLocalStorage();
  globalThis.window=globalThis;globalThis.indexedDB=mockIDB;globalThis.localStorage=mockStorage;
  globalThis.document={addEventListener(){}};globalThis.addEventListener=()=>{};
  await import("../src/client/storage.js?retry-test");const store=globalThis.AWJ_STORE;
  await store.hydrate(AWJ_COMPAT.stateKey);mockIDB._failOpen=true;
  store.persist(AWJ_COMPAT.stateKey,{history:[{id:"new-set",session:"gym"}]});
  assert.equal(store.saveStatus,"saving");
  await assert.rejects(store.flush(),/unavailable/);assert.equal(store.saveStatus,"failed");
  mockIDB._failOpen=false;await store.flush();
  assert.equal(mockIDB._stores.get("records").get("state:history")[0].id,"new-set");
  assert.equal(store.saveStatus,"saved");
});
