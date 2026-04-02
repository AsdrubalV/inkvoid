"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  "Terror", "Fantasy", "Dark Fantasy", "SciFi", "Dark SciFi",
  "Isekai", "LitRPG", "Paranormal", "Fanfiction", "Action",
  "Mystery", "Regression", "Post Apocalyptic", "Zombie",
  "Supernatural", "Adventure", "Psychological Horror",
  "Cosmic Horror", "Thriller", "Crime", "Dystopian",
  "Survival", "Urban Fantasy", "Mythology", "Historical Fantasy",
  "Erotic", "Comedy", "Romance"
];

const LANGUAGES = ["Español", "English", "Português", "Français", "Deutsch", "日本語", "中文"];

export default function EditStoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const storyId = params.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("Español");
  const [status, setStatus] = useState("ongoing");
  const [isAdult, setIsAdult] = useState(false);
  const [audiobookUrl, setAudiobookUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: story, error } = await supabase
        .from("stories")
        .select("id, title, description, category, tags, language, status, is_adult, cover_url, audiobook_url, author_id")
        .eq("id", storyId)
        .single();

      if (error || !story) { router.push("/publish/manage"); return; }
      if (story.author_id !== user.id) { router.push("/publish/manage"); return; }

      setTitle(story.title ?? "");
      setDescription(story.description ?? "");
      setCategory(story.category ?? "");
      setTags(Array.isArray(story.tags) ? story.tags.join(", ") : (story.tags ?? ""));
      setLanguage(story.language ?? "Español");
      setStatus(story.status ?? "ongoing");
      setIsAdult(story.is_adult ?? false);
      setAudiobookUrl(story.audiobook_url ?? "");
      setCurrentCoverUrl(story.cover_url ?? null);
      setCoverPreview(story.cover_url ?? null);
      setLoadingData(false);
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
    setSuccess(false);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

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
          title: title.trim(),
          description: description.trim(),
          category,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          language,
          status,
          is_adult: isAdult,
          cover_url: coverUrl,
          audiobook_url: audiobookUrl.trim() || null,
        })
        .eq("id", storyId);

      if (updateError) throw updateError;
      setSuccess(true);
      setCurrentCoverUrl(coverUrl);
      setCoverFile(null);
    } catch (err: any) {
      setError(err.message ?? "Error al guardar cambios");
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-black">
          ← Volver
        </button>
        <h1 className="text-2xl font-semibold tracking-tight">Editar historia</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-white/70 p-6">
        <div className="grid gap-6 sm:grid-cols-[1fr,160px]">
          <div className="space-y-4">

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Título *</label>
              <input
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Descripción</label>
              <textarea
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Categoría *</label>
                <select
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Selecciona</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Idioma *</label>
                <select
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Estado</label>
                <select
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="ongoing">En progreso</option>
                  <option value="completed">Completa</option>
                  <option value="hiatus">En hiatus</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Contenido adulto</label>
                <div className="flex items-center gap-2 h-10">
                  <button
                    type="button"
                    onClick={() => setIsAdult(!isAdult)}
                    className={"relative inline-flex h-6 w-11 items-center rounded-full transition-colors " + (isAdult ? "bg-red-500" : "bg-gray-200")}
                  >
                    <span className={"inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform " + (isAdult ? "translate-x-6" : "translate-x-1")} />
                  </button>
                  <span className="text-xs text-gray-600">{isAdult ? "Contenido adulto" : "Apto para todos"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Tags</label>
              <input
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="magic, academy, slow burn (separados por comas)"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                URL del audiolibro
                <span className="ml-1 text-gray-400 font-normal">— solo premium</span>
              </label>
              <input
                type="url"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                value={audiobookUrl}
                onChange={(e) => setAudiobookUrl(e.target.value)}
                placeholder="https://drive.google.com/... o https://soundcloud.com/..."
              />
              <p className="text-[10px] text-gray-400">
                Sube tu MP3 a Google Drive, Dropbox o SoundCloud y pega el link. Solo accesible para suscriptores premium.
              </p>
            </div>

          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Portada</label>
            <label className="cursor-pointer block">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 hover:border-black transition flex items-center justify-center">
                {coverPreview ? (
                  <img src={coverPreview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center space-y-1 px-2">
                    <p className="text-2xl">🖼️</p>
                    <p className="text-[10px] text-gray-400">Click para cambiar</p>
                    <p className="text-[9px] text-gray-300">600×900 JPG/PNG</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">Cambios guardados correctamente.</p>}

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
            onClick={() => router.push("/publish/manage")}
            className="rounded-full border border-border px-6 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}