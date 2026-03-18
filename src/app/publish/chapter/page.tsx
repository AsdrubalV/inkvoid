"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RichTextEditor } from "@/components/Editor";

const CATEGORIES = [
  "Terror", "Fantasy", "Dark Fantasy", "SciFi", "Dark SciFi",
  "Isekai", "LitRPG", "Paranormal", "Fanfiction", "Action",
  "Mystery", "Regression", "Post Apocalyptic", "Zombie",
  "Supernatural", "Adventure", "Psychological Horror",
  "Cosmic Horror", "Thriller", "Crime", "Dystopian",
  "Survival", "Urban Fantasy", "Mythology", "Historical Fantasy", "Erotic"
];

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(" ").length : 0;
}

export default function AddChapterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get("story") ?? "";
  const isFirst = searchParams.get("first") === "true";
  const supabase = createClient();

  const [storyTitle, setStoryTitle] = useState("");
  const [storyDescription, setStoryDescription] = useState("");
  const [storyCategory, setStoryCategory] = useState("");
  const [storyTags, setStoryTags] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);
  const [showEditStory, setShowEditStory] = useState(false);
  const [nextChapterNumber, setNextChapterNumber] = useState(1);
  const [totalWords, setTotalWords] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterContent, setChapterContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStory, setLoadingStory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const PREMIUM_THRESHOLD = 20000;
  const canSetPremium = totalWords >= PREMIUM_THRESHOLD;
  const currentChapterWords = countWords(chapterContent);

  useEffect(() => {
    if (!storyId) { router.push("/publish"); return; }
    async function load() {
      const { data: story } = await supabase
        .from("stories")
        .select("title, description, category, tags, cover_url, total_words")
        .eq("id", storyId)
        .single();

      if (story) {
        setStoryTitle(story.title ?? "");
        setStoryDescription(story.description ?? "");
        setStoryCategory(story.category ?? "");
        setStoryTags(Array.isArray(story.tags) ? story.tags.join(", ") : (story.tags ?? ""));
        setCurrentCoverUrl(story.cover_url ?? null);
        setCoverPreview(story.cover_url ?? null);
        setTotalWords(story.total_words ?? 0);
      }

      const { data: chapters } = await supabase
        .from("chapters")
        .select("chapter_number")
        .eq("story_id", storyId)
        .order("chapter_number", { ascending: false })
        .limit(1);

      setNextChapterNumber(chapters && chapters.length > 0 ? chapters[0].chapter_number + 1 : 1);
      setLoadingStory(false);
    }
    load();
  }, [storyId]);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setCoverFile(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      if (showEditStory || isFirst) {
        let coverUrl = currentCoverUrl;

        if (coverFile) {
          const ext = coverFile.name.split(".").pop();
          const path = user.id + "/" + crypto.randomUUID() + "." + ext;
          const { data: storageData, error: storageError } = await supabase.storage
            .from("covers")
            .upload(path, coverFile, { cacheControl: "3600", upsert: false });
          if (storageError) throw storageError;
          const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(storageData.path);
          coverUrl = publicUrl;
        }

        const { error: updateError } = await supabase
          .from("stories")
          .update({
            title: storyTitle,
            description: storyDescription,
            category: storyCategory,
            cover_url: coverUrl,
            tags: storyTags.split(",").map((t) => t.trim()).filter(Boolean),
          })
          .eq("id", storyId);

        if (updateError) throw updateError;
      }

      const newWordCount = currentChapterWords;
      const newTotalWords = totalWords + newWordCount;

      const { error: chapterError } = await supabase
        .from("chapters")
        .insert({
          story_id: storyId,
          title: chapterTitle || "Chapter " + nextChapterNumber,
          content_html: chapterContent,
          chapter_number: nextChapterNumber,
          author_id: user.id,
          word_count: newWordCount,
          is_premium: canSetPremium && isPremium,
        });

      if (chapterError) throw chapterError;

      await supabase
        .from("stories")
        .update({
          last_chapter_at: new Date().toISOString(),
          total_words: newTotalWords,
        })
        .eq("id", storyId);

      router.push("/story/" + storyId);
    } catch (err: any) {
      setError(err.message ?? "Error al publicar capítulo");
    } finally {
      setLoading(false);
    }
  }

  if (loadingStory) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-black">← Volver</button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isFirst ? "Primer capítulo" : "Nuevo capítulo"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{storyTitle} · Capítulo {nextChapterNumber}</p>
        </div>
      </div>

      {/* Barra de progreso hacia premium */}
      <div className="rounded-xl border border-border bg-white/70 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Palabras publicadas</span>
          <span className={canSetPremium ? "text-green-600 font-medium" : "text-gray-700"}>
            {totalWords.toLocaleString()} / {PREMIUM_THRESHOLD.toLocaleString()}
            {canSetPremium && " ✅ Habilitado para premium"}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className={"h-1.5 rounded-full transition-all " + (canSetPremium ? "bg-green-500" : "bg-black")}
            style={{ width: Math.min((totalWords / PREMIUM_THRESHOLD) * 100, 100) + "%" }}
          />
        </div>
        {!canSetPremium && (
          <p className="text-[11px] text-gray-400">
            Te faltan {(PREMIUM_THRESHOLD - totalWords).toLocaleString()} palabras para poder publicar capítulos premium.
          </p>
        )}
      </div>

      {!isFirst && (
        <button
          onClick={() => setShowEditStory(!showEditStory)}
          className="text-sm text-gray-600 underline hover:text-black"
        >
          {showEditStory ? "▲ Ocultar edición de historia" : "✏️ Editar detalles de la historia"}
        </button>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {(showEditStory || isFirst) && (
          <div className="rounded-2xl border border-border bg-white/70 p-6 space-y-4">
            <h2 className="text-sm font-semibold">Detalles de la historia</h2>
            <div className="grid gap-4 sm:grid-cols-[1fr,140px]">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Título</label>
                  <input
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Descripción</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                    rows={3}
                    value={storyDescription}
                    onChange={(e) => setStoryDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Categoría</label>
                  <select
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                    value={storyCategory}
                    onChange={(e) => setStoryCategory(e.target.value)}
                  >
                    <option value="">Selecciona una categoría</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Tags</label>
                  <input
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                    value={storyTags}
                    onChange={(e) => setStoryTags(e.target.value)}
                    placeholder="magic, academy, slow burn"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Portada</label>
                <label className="cursor-pointer block">
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 hover:border-black transition flex items-center justify-center">
                    {coverPreview ? (
                      <img src={coverPreview} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center space-y-1 px-2">
                        <p className="text-xl">🖼️</p>
                        <p className="text-[10px] text-gray-400">Click para cambiar</p>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-white/70 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Capítulo {nextChapterNumber}</h2>
            <span className="text-xs text-gray-400">{currentChapterWords.toLocaleString()} palabras</span>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Título del capítulo</label>
            <input
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              placeholder={"Chapter " + nextChapterNumber}
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Contenido</label>
            <RichTextEditor
              value={chapterContent}
              onChange={setChapterContent}
              placeholder="Escribe tu capítulo aquí..."
            />
          </div>

          {/* Toggle premium */}
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

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {loading ? "Publicando..." : "Publicar capítulo"}
        </button>
      </form>
    </div>
  );
}