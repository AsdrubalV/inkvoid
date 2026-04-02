"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
}

interface Story {
  id: string;
  title: string;
  cover_url: string | null;
  description: string | null;
  category: string | null;
  audiobook_url: string | null;
  chapters?: Chapter[];
  expanded?: boolean;
  editingAudio?: boolean;
}

export default function ManagePage() {
  const router = useRouter();
  const supabase = createClient();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [audioInputs, setAudioInputs] = useState<Record<string, string>>({});
  const [savingAudio, setSavingAudio] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("stories")
        .select("id, title, cover_url, description, category, audiobook_url")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      setStories(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function loadChapters(storyId: string) {
    const { data } = await supabase
      .from("chapters")
      .select("id, title, chapter_number")
      .eq("story_id", storyId)
      .order("chapter_number", { ascending: true });

    setStories((prev) =>
      prev.map((s) => s.id === storyId ? { ...s, chapters: data ?? [], expanded: true } : s)
    );
  }

  function toggleExpand(story: Story) {
    if (story.expanded) {
      setStories((prev) => prev.map((s) => s.id === story.id ? { ...s, expanded: false } : s));
    } else {
      loadChapters(story.id);
    }
  }

  function toggleEditAudio(story: Story) {
    setAudioInputs((prev) => ({ ...prev, [story.id]: story.audiobook_url ?? "" }));
    setStories((prev) => prev.map((s) => s.id === story.id ? { ...s, editingAudio: !s.editingAudio } : s));
  }

  async function saveAudioUrl(storyId: string) {
    setSavingAudio(storyId);
    const url = audioInputs[storyId]?.trim() || null;
    const { error } = await supabase
      .from("stories")
      .update({ audiobook_url: url })
      .eq("id", storyId);

    if (!error) {
      setStories((prev) => prev.map((s) => s.id === storyId ? { ...s, audiobook_url: url, editingAudio: false } : s));
    }
    setSavingAudio(null);
  }

  async function deleteChapter(chapterId: string, storyId: string) {
    if (!confirm("¿Seguro que quieres borrar este capítulo? Esta acción no se puede deshacer.")) return;
    setDeleting(chapterId);
    const { error } = await supabase.from("chapters").delete().eq("id", chapterId);
    if (error) { alert("Error al borrar el capítulo: " + error.message); setDeleting(null); return; }
    setStories((prev) => prev.map((s) => s.id === storyId ? { ...s, chapters: s.chapters?.filter((c) => c.id !== chapterId) } : s));
    setDeleting(null);
  }

  async function deleteStory(storyId: string) {
    if (!confirm("¿Seguro que quieres borrar esta historia y TODOS sus capítulos? Esta acción no se puede deshacer.")) return;
    setDeleting(storyId);
    await supabase.from("chapters").delete().eq("story_id", storyId);
    const { error } = await supabase.from("stories").delete().eq("id", storyId);
    if (error) { alert("Error al borrar la historia: " + error.message); setDeleting(null); return; }
    setStories((prev) => prev.filter((s) => s.id !== storyId));
    setDeleting(null);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-sm text-gray-400">Cargando...</p></div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mis historias</h1>
          <p className="text-sm text-gray-500 mt-0.5">Administra tus historias y capítulos</p>
        </div>
        <Link href="/publish/new" className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 transition">
          + Nueva historia
        </Link>
      </div>

      {stories.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white/70 p-8 text-center">
          <p className="text-gray-500 text-sm">Aún no tienes historias publicadas.</p>
          <Link href="/publish/new" className="mt-3 inline-block text-sm font-medium underline">
            Crear primera historia →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <div key={story.id} className="rounded-2xl border border-border bg-white/70 overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {story.cover_url ? (
                  <img src={story.cover_url} alt={story.title} className="h-16 w-11 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="h-16 w-11 rounded bg-gray-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{story.title}</p>
                  {story.category && <p className="text-xs text-gray-500 mt-0.5">{story.category}</p>}
                  {story.audiobook_url && (
                    <p className="text-[10px] text-indigo-500 mt-0.5">Audiolibro disponible</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  <Link href={"/publish/chapter?story=" + story.id} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-gray-50 transition">
                    + Capítulo
                  </Link>
                  <button
                    onClick={() => toggleEditAudio(story)}
                    className={"rounded-full border px-3 py-1 text-xs transition " + (story.audiobook_url ? "border-indigo-200 text-indigo-600 hover:bg-indigo-50" : "border-border hover:bg-gray-50")}
                  >
                    {story.audiobook_url ? "Audiolibro" : "+ Audio"}
                  </button>
                  <button
                    onClick={() => deleteStory(story.id)}
                    disabled={deleting === story.id}
                    className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {deleting === story.id ? "..." : "Borrar"}
                  </button>
                  <button
                    onClick={() => toggleExpand(story)}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-gray-50 transition"
                  >
                    {story.expanded ? "▲ Ocultar" : "▼ Capítulos"}
                  </button>
                </div>
              </div>

              {/* Panel editar audiolibro */}
              {story.editingAudio && (
                <div className="border-t border-border px-4 py-3 bg-indigo-50/50 space-y-2">
                  <p className="text-xs font-medium text-gray-700">URL del audiolibro</p>
                  <p className="text-[10px] text-gray-400">
                    Sube tu MP3 a Google Drive, Dropbox o SoundCloud y pega el link aquí. Solo accesible para suscriptores premium.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={audioInputs[story.id] ?? ""}
                      onChange={(e) => setAudioInputs((prev) => ({ ...prev, [story.id]: e.target.value }))}
                      className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                      placeholder="https://drive.google.com/... o https://soundcloud.com/..."
                    />
                    <button
                      onClick={() => saveAudioUrl(story.id)}
                      disabled={savingAudio === story.id}
                      className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition"
                    >
                      {savingAudio === story.id ? "..." : "Guardar"}
                    </button>
                    <button
                      onClick={() => setStories((prev) => prev.map((s) => s.id === story.id ? { ...s, editingAudio: false } : s))}
                      className="rounded-full border border-border px-4 py-2 text-xs hover:bg-gray-50 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                  {story.audiobook_url && (
                    <button
                      onClick={() => { setAudioInputs((prev) => ({ ...prev, [story.id]: "" })); saveAudioUrl(story.id); }}
                      className="text-[10px] text-red-400 hover:text-red-600 transition"
                    >
                      Eliminar audiolibro
                    </button>
                  )}
                </div>
              )}

              {story.expanded && (
                <div className="border-t border-border divide-y divide-border">
                  {story.chapters?.length ? (
                    story.chapters.map((ch) => (
                      <div key={ch.id} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-sm text-gray-700 truncate flex-1 mr-4">
                          {ch.chapter_number}. {ch.title}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link href={"/publish/chapter/edit/" + ch.id} className="rounded-full border border-border px-3 py-0.5 text-xs hover:bg-gray-50 transition">
                            Editar
                          </Link>
                          <button
                            onClick={() => deleteChapter(ch.id, story.id)}
                            disabled={deleting === ch.id}
                            className="rounded-full border border-red-200 px-3 py-0.5 text-xs text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                          >
                            {deleting === ch.id ? "..." : "Borrar"}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-sm text-gray-400">No hay capítulos aún.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}