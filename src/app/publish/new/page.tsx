"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  "Terror", "Fantasy", "Dark Fantasy", "SciFi", "Dark SciFi",
  "Isekai", "LitRPG", "Paranormal", "Fanfiction", "Action",
  "Mystery", "Regression", "Post Apocalyptic", "Zombie",
  "Supernatural", "Adventure", "Psychological Horror",
  "Cosmic Horror", "Thriller", "Crime", "Dystopian",
  "Survival", "Urban Fantasy", "Mythology", "Historical Fantasy", "Erotic"
];

export default function NewStoryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      let coverUrl: string | null = null;
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

      const { data: story, error: storyError } = await supabase
        .from("stories")
        .insert({
          title,
          description,
          category,
          cover_url: coverUrl,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          author_id: user.id,
        })
        .select("id")
        .single();

      if (storyError) throw storyError;

      // Ir directo a agregar el primer capítulo
      router.push("/publish/chapter?story=" + story.id + "&first=true");
    } catch (err: any) {
      setError(err.message ?? "Error al publicar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-black">← Volver</button>
        <h1 className="text-2xl font-semibold tracking-tight">Nueva historia</h1>
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

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Categoría *</label>
              <select
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
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
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="magic, academy, slow burn (separados por comas)"
              />
            </div>

          </div>

          {/* Cover */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Portada</label>
            <label className="cursor-pointer block">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 hover:border-black transition flex items-center justify-center">
                {coverPreview ? (
                  <img src={coverPreview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center space-y-1 px-2">
                    <p className="text-2xl">🖼️</p>
                    <p className="text-[10px] text-gray-400">Click para subir</p>
                    <p className="text-[9px] text-gray-300">600×900 JPG/PNG</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Continuar → Agregar primer capítulo"}
        </button>

      </form>
    </div>
  );
}