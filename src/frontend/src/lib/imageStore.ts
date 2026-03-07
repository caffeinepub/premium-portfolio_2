/**
 * IndexedDB-based image store.
 * Stores large base64/blob images outside of localStorage to avoid the ~5MB limit.
 * Images are keyed by a unique string ID.
 */

const DB_NAME = "portfolio_images_db";
const DB_VERSION = 1;
const STORE_NAME = "images";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });
  return dbPromise;
}

/** Save an image (base64 data URL or blob URL) with a given ID. */
export async function saveImage(id: string, dataUrl: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ id, dataUrl });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Load an image by ID. Returns null if not found. */
export async function loadImage(id: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => {
      const result = req.result as { id: string; dataUrl: string } | undefined;
      resolve(result?.dataUrl ?? null);
    };
    req.onerror = () => reject(req.error);
  });
}

/** Load multiple images by IDs. Returns array of data URLs (null for missing). */
export async function loadImages(ids: string[]): Promise<(string | null)[]> {
  return Promise.all(ids.map((id) => loadImage(id)));
}

/** Delete an image by ID. */
export async function deleteImage(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Delete multiple images by IDs. */
export async function deleteImages(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteImage(id)));
}

/** Generate a unique image ID. */
export function generateImageId(projectId: string, index: number): string {
  return `img_${projectId}_${index}_${Date.now()}`;
}

/** Save multiple images and return their IDs. */
export async function saveImages(
  projectId: string,
  dataUrls: string[],
  existingIds?: string[],
): Promise<string[]> {
  const ids: string[] = [];
  for (let i = 0; i < dataUrls.length; i++) {
    // Reuse existing ID if available, otherwise generate new
    const id = existingIds?.[i] ?? generateImageId(projectId, i);
    await saveImage(id, dataUrls[i]);
    ids.push(id);
  }
  return ids;
}
