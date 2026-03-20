const DB_NAME = "inkvoid-offline";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("chapters"))
        db.createObjectStore("chapters", { keyPath: "id" });
      if (!db.objectStoreNames.contains("pending-reads"))
        db.createObjectStore("pending-reads", { keyPath: "id", autoIncrement: true });
      if (!db.objectStoreNames.contains("subscriptions"))
        db.createObjectStore("subscriptions", { keyPath: "user_id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveChapterOffline(chapter: {
  id: string; title: string; content_html: string;
  chapter_number: number; story_id: string; story_title: string;
  is_premium: boolean;
}) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("chapters", "readwrite");
    tx.objectStore("chapters").put({ ...chapter, saved_at: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineChapter(chapterId: string) {
  const db = await openDB();
  return new Promise<any>((resolve) => {
    const tx = db.transaction("chapters", "readonly");
    const req = tx.objectStore("chapters").get(chapterId);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => resolve(null);
  });
}

export async function getOfflineChaptersByStory(storyId: string) {
  const db = await openDB();
  return new Promise<any[]>((resolve) => {
    const tx = db.transaction("chapters", "readonly");
    const req = tx.objectStore("chapters").getAll();
    req.onsuccess = () =>
      resolve((req.result ?? []).filter((c: any) => c.story_id === storyId));
    req.onerror = () => resolve([]);
  });
}

export async function removeStoryOffline(storyId: string) {
  const db = await openDB();
  const chapters = await getOfflineChaptersByStory(storyId);
  return new Promise<void>((resolve) => {
    const tx = db.transaction("chapters", "readwrite");
    const store = tx.objectStore("chapters");
    chapters.forEach((c) => store.delete(c.id));
    tx.oncomplete = () => resolve();
  });
}

export async function savePendingRead(read: {
  chapter_id: string; story_id: string;
  user_id: string | null; read_at: string;
}) {
  const db = await openDB();
  return new Promise<void>((resolve) => {
    const tx = db.transaction("pending-reads", "readwrite");
    tx.objectStore("pending-reads").add(read);
    tx.oncomplete = () => resolve();
  });
}

export async function saveSubscriptionOffline(userId: string, expiresAt: string) {
  const db = await openDB();
  return new Promise<void>((resolve) => {
    const tx = db.transaction("subscriptions", "readwrite");
    tx.objectStore("subscriptions").put({ user_id: userId, expires_at: expiresAt });
    tx.oncomplete = () => resolve();
  });
}

export async function checkOfflineSubscription(userId: string): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction("subscriptions", "readonly");
    const req = tx.objectStore("subscriptions").get(userId);
    req.onsuccess = () => {
      const sub = req.result;
      if (!sub) return resolve(false);
      resolve(new Date(sub.expires_at) > new Date());
    };
    req.onerror = () => resolve(false);
  });
}