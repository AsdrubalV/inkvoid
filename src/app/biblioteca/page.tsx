"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getOfflineChaptersByStory, removeStoryOffline } from "@/lib/offline";

interface OfflineChapter {
  id: string;
  title: string;
  chapter_number: number;
  story_id: string;
  story_title: string;
  is_premium: boolean;
  saved_at: string;
}

interface GroupedStory {
  story_id: string;
  story_title: string;
  chapters: OfflineChapter[];
  saved_at: string;
}

export default function BibliotecaPage() {
  const [stories, setStories] = useState<GroupedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const db = await openLocalDB();
        const all = await getAllChapters(db);
        const grouped: Record<string, GroupedStory> = {};
        all.forEach((ch: OfflineChapter) => {
          if (!grouped[ch.story_id]) {
            grouped[ch.story_id] = {
              story_id: ch.story_id,
              story_title: ch.story_title,
              chapters: [],
              saved_at: ch.saved_at,
            };
          }
          grouped[ch.story_id].chapters.push(ch);
        });
        Object.values(grouped).forEach((s) =>
          s.chapters.sort((a, b) => a.chapter_number - b.chapter_number)
        );
        setStories(Object.values(grouped).sort((a, b) =>
          new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()
        ));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRemove(storyId: string) {
    setRemoving(storyId);
    await removeStoryOffline(storyId);
    setStories((prev) => prev.filter((s) => s.story_id !== storyId));
    setRemoving(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-400">Cargando biblioteca...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mi biblioteca offline</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Historias guardadas para leer sin conexión
          </p>
        </div>
        <Link href="/" className="text-sm text-gray-400 hover:text-black transition">
          ← Inicio
        </Link>
      </div>

      {stories.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white/70 p-10 text-center space-y-3">
          <p className="text-4xl">📚</p>
          <p className="text-gray-600 text-sm font-medium">Tu biblioteca está vacía</p>
          <p className="text-gray-400 text-xs">
            Entra a cualquier historia y presiona "Guardar para offline" para leerla sin internet.
          </p>
          <Link
            href="/trending"
            className="inline-block mt-2 rounded-full bg-black px-5 py-2 text-xs font-medium text-white hover:bg-gray-800 transition"
          >
            Explorar historias
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <div key={story.story_id} className="rounded-2xl border border-border bg-white/70 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <Link
                    href={"/story/" + story.story_id}
                    className="font-semibold text-sm hover:underline"
                  >
                    {story.story_title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {story.chapters.length} capítulo{story.chapters.length !== 1 ? "s" : ""} guardado{story.chapters.length !== 1 ? "s" : ""}
                    {" · "}Guardado el {new Date(story.saved_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(story.story_id)}
                  disabled={removing === story.story_id}
                  className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                >
                  {removing === story.story_id ? "..." : "Eliminar"}
                </button>
              </div>
              <div className="divide-y divide-border">
                {story.chapters.map((ch) => (
                  <Link
                    key={ch.id}
                    href={"/chapter/" + ch.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition"
                  >
                    <span className="text-sm text-gray-700">
                      {ch.chapter_number}. {ch.title}
                    </span>
                    <div className="flex items-center gap-2">
                      {ch.is_premium && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                          👑 Premium
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">Offline</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helpers IndexedDB locales
function openLocalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("inkvoid-offline", 1);
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

function getAllChapters(db: IDBDatabase): Promise<OfflineChapter[]> {
  return new Promise((resolve) => {
    const tx = db.transaction("chapters", "readonly");
    const req = tx.objectStore("chapters").getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => resolve([]);
  });
}