"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RichTextEditor } from "@/components/Editor";

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(" ").length : 0;
}

export default function EditChapterPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const chapterId = params.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [chapterNumber, setChapterNumber] = useState(1);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyId, setStoryId] = useState("");
  const [totalWords, setTotalWords] = useState(0);
  const [originalWordCount, setOriginalWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const PREMIUM_THRESHOLD = 20000;
  const canSetPremium = totalWords >= PREMIUM_THRESHOLD;
  const currentWords = countWords(content);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: chapter, error } = await supabase
        .from("chapters")
        .select("id, title, content_html, chapter_number, story_id, is_premium, word_count, author_id")
        .eq("id", chapterId)
        .single();

      if (error || !chapter) { router.push("/publish/manage"); return; }
      if (chapter.author_id !== user.id) { router.push("/publish/manage"); return; }

      const { data: story } = await supabase
        .from("stories")
        .select("title, total_words")
        .eq("id", chapter.story_id)
        .single();

      setTitle(chapter.title ?? "");
      setContent(chapter.content_html ?? "");
      setIsPremium(chapter.is_premium ?? false);
      setChapterNumber(chapter.chapter_number);
      setStoryId(chapter.story_id);
      setStoryTitle(story?.title ?? "");
      setOriginalWordCount(chapter.word_count ?? 0);
      setTotalWords(story?.total_words ?? 0);
      setLoadingData(false);
    }
    load();
  }, [chapterId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const newWordCount = currentWords;
      const wordDiff = newWordCount - originalWordCount;

      const { error: chapterError } = await supabase
        .from("chapters")
        .update({
          title: title || "Chapter " + chapterNumber,
          content_html: content,
          is_premium: canSetPremium && isPremium,
          word_count: newWordCount,
        })
        .eq("id", chapterId);

      if (chapterError) throw chapterError;

      if (wordDiff !== 0) {
        await supabase
          .from("stories")
          .update({ total_words: Math.max(0, totalWords + wordDiff) })
          .eq("id", storyId);
      }

      router.push("/publish/manage");
    } catch (err: any) {
      setError(err.message ?? "Error al guardar cambios");
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-400">Cargando capítulo...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-black">
          ← Volver
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Editar capítulo</h1>
          <p className="text-sm text-gray-500 mt-0.5">{storyTitle} · Capítulo {chapterNumber}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white/70 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Palabras publicadas (historia)</span>
          <span className={canSetPremium ? "text-green-600 font-medium" : "text-gray-700"}>
            {totalWords.toLocaleString()} / {PREMIUM_THRESHOLD.toLocaleString()}
            {canSetPremium && " ✅ Premium habilitado"}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className={"h-1.5 rounded-full transition-all " + (canSetPremium ? "bg-green-500" : "bg-black")}
            style={{ width: Math.min((totalWords / PREMIUM_THRESHOLD) * 100, 100) + "%" }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-border bg-white/70 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Capítulo {chapterNumber}</h2>
            <span className="text-xs text-gray-400">{currentWords.toLocaleString()} palabras</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Título del capítulo</label>
            <input
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              placeholder={"Chapter " + chapterNumber}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Contenido</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Contenido del capítulo..."
            />
          </div>

          <div className={`rounded-xl border p-4 space-y-2 ${canSetPremium ? "border-amber-200 bg-amber-50" : "border-border bg-gray-50 opacity-60"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Capítulo premium 👑</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {canSetPremium
                    ? "Solo los suscriptores podrán leer este capítulo."
                    : "Disponible cuando tu historia supere 20.000 palabras."}
                </p>
              </div>
              <button
                type="button"
                disabled={!canSetPremium}
                onClick={() => setIsPremium(!isPremium)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPremium && canSetPremium ? "bg-amber-500" : "bg-gray-200"} disabled:cursor-not-allowed`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isPremium && canSetPremium ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-border px-6 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}