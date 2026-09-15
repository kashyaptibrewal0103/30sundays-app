// Where a session is kept between reloads.
//
// Settings live in localStorage, which is the right place for a few kilobytes of
// text and the wrong place for pictures: its quota is around five megabytes and a
// single generated photo can be two. So the images and the results go in
// IndexedDB instead, which is measured in hundreds of megabytes, and which holds
// blobs directly rather than as base64 a third larger than the bytes it carries.
//
// Two stores: "images" holds one blob per picture, "state" holds a single json
// snapshot of the session that points at them by key.

const DB_NAME = "photo-lab";
const DB_VERSION = 1;
const SESSION_KEY = "session";

let dbPromise = null;

function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) { reject(new Error("This browser has no IndexedDB")); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("images")) db.createObjectStore("images");
      if (!db.objectStoreNames.contains("state")) db.createObjectStore("state");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Could not open the session store"));
    req.onblocked = () => reject(new Error("The session store is open in another tab"));
  });
  return dbPromise;
}

function run(storeName, mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const request = fn(tx.objectStore(storeName));
    tx.oncomplete = () => resolve(request && "result" in request ? request.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("The write was aborted"));
  }));
}

/* ── pictures ── */

export const putImage = (key, blob) => run("images", "readwrite", (s) => s.put(blob, key));
export const getImage = (key) => run("images", "readonly", (s) => s.get(key));
export const deleteImage = (key) => run("images", "readwrite", (s) => s.delete(key));
export const imageKeys = () => run("images", "readonly", (s) => s.getAllKeys());

/* ── the session snapshot ── */

export const putSession = (session) => run("state", "readwrite", (s) => s.put(session, SESSION_KEY));
export const getSession = () => run("state", "readonly", (s) => s.get(SESSION_KEY));

export async function clearAll() {
  await run("images", "readwrite", (s) => s.clear());
  await run("state", "readwrite", (s) => s.clear());
}

/* ── helpers ── */

// A data url or a blob url, read back as the bytes behind it. Both are fetchable
// in the page, which saves hand rolling a base64 decoder.
export const urlToBlob = (url) => fetch(url).then((r) => {
  if (!r.ok) throw new Error("Could not read that picture back");
  return r.blob();
});

// Asks the browser not to evict this origin's storage when disk gets tight.
// Silently declined in some browsers, which is fine: the data is still written.
export async function askToPersist() {
  try {
    if (navigator.storage?.persisted && await navigator.storage.persisted()) return true;
    return Boolean(await navigator.storage?.persist?.());
  } catch { return false; }
}

export async function storageUsed() {
  try {
    const { usage, quota } = await navigator.storage.estimate();
    return { usage, quota };
  } catch { return null; }
}
