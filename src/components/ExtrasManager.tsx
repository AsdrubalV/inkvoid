"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Extra {
  id: string;
  type: "image" | "lore" | "video";
  title: string;
  description: string | null;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  order_index: number;
}

interface Props {
  storyId: string;
  authorId: string;
  initialExtras: Extra[];
}

export default function ExtrasManager({ storyId, authorId, initialExtras }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [extras, setExtras] = useState<Extra[]>(initialExtras);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<"image" | "lore" | "video">("image");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setTitle(""); setDescription(""); setContent("");
    setVideoUrl(""); setImageFile(null); setImagePreview(null);
    setError(""); setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("El título es obligatorio."); return; }
    if (type === "image" && !imageFile) { setError("Selecciona una imagen."); return; }
    if (type === "video" && !videoUrl.trim()) { setError("Ingresa la URL del video."); return; }
    if (type === "lore" && !content.trim()) { setError("Escribe el contenido del lore."); return; }

    setLoading(true);
    setError("");

    try {
      let imageUrl: string | null = null;

      if (type === "image" && imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = "extras/" + storyId + "/" + crypto.randomUUID() + "." + ext;
        const { data: storageData, error: storageError } = await supabase.storage
          .from("covers")
          .upload(path, imageFile, { cacheControl: "3600", upsert: false });
        if (storageError) throw storageError;
        const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(storageData.path);
        imageUrl = publicUrl;
      }

      const maxOrder = extras.length ? Math.max(...extras.map((e) => e.order_index)) : 0;

      const { data: newExtra, error: insertError } = await supabase
        .from("story_extras")
        .insert({
          story_id: storyId,
          author_id: authorId,
          type,
          title: title.trim(),
          description: description.trim() || null,
          content: type === "lore" ? content.trim() : null,
          image_url: imageUrl,
          video_url: type === "video" ? videoUrl.trim() : null,
          order_index: maxOrder + 1,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setExtras((prev) => [...prev, newExtra as Extra]);
      resetForm();
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Error al guardar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este elemento?")) return;
    await supabase.from("story_extras").delete().eq("id", id);
    setExtras((prev) => prev.filter((e) => e.id !== id));
    router.refresh();
  }

  const typeIcons = { image: "🖼️", lore: "📖", video: "🎬" };
  const typeLabels = { image: "Imagen / Arte", lore: "Lore / Texto", video: "Video" };

  return (
    <div className="space-y-6">

      {/* Botón agregar */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
      >
        {showForm ? "Cancelar" : "+ Agregar contenido extra"}
      </button>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white/70 p-5 space-y-5">
          <h2 className="text-sm font-semibold">Nuevo contenido extra</h2>

          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Tipo de contenido *</label>
            <div className="grid grid-cols-3 gap-2">
              {(["image", "lore", "video"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={"rounded-xl border p-3 text-center transition " + (type === t ? "border-black bg-black text-white" : "border-border bg-white hover:border-gray-400")}
                >
                  <p className="text-xl">{typeIcons[t]}</p>
                  <p className={"text-xs mt-1 " + (type === t ? "text-white" : "text-gray-700")}>{typeLabels[t]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              placeholder={type === "image" ? "Mapa del reino de Arath" : type === "lore" ? "Historia del Imperio Caído" : "Tráiler oficial"}
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Descripción (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              placeholder="Breve descripción del contenido"
            />
          </div>

          {/* Campos específicos por tipo */}
          {type === "image" && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Imagen *</label>
              <label className="cursor-pointer block">
                <div className="h-40 w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 hover:border-black transition flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="h-full w-full object-contain" />
                  ) : (
                    <div className="text-center space-y-1">
                      <p className="text-3xl">🖼️</p>
                      <p className="text-xs text-gray-400">Click para subir imagen</p>
                      <p className="text-[10px] text-gray-300">JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setImageFile(f);
                    if (f) setImagePreview(URL.createObjectURL(f));
                  }}
                />
              </label>
            </div>
          )}

          {type === "lore" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Contenido *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black resize-y font-mono"
                placeholder="Escribe el lore, historia del mundo, descripción de personajes..."
              />
              <p className="text-[10px] text-gray-400">{content.length} caracteres</p>
            </div>
          )}

          {type === "video" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">URL del video *</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
              />
              <p className="text-[10px] text-gray-400">Soporta YouTube y Vimeo</p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-full border border-border px-6 py-2 text-sm hover:bg-gray-50 transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de extras existentes */}
      {extras.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Contenido publicado ({extras.length})</h2>
          <div className="rounded-xl border border-border bg-white/70 overflow-hidden divide-y divide-border">
            {extras.map((extra) => (
              <div key={extra.id} className="flex items-center gap-4 px-4 py-3">
                <span className="text-xl flex-shrink-0">{typeIcons[extra.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{extra.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{typeLabels[extra.type]}</p>
                </div>
                {extra.image_url && (
                  <img src={extra.image_url} alt={extra.title} className="h-10 w-10 rounded-lg object-cover border border-border flex-shrink-0" />
                )}
                <button
                  onClick={() => handleDelete(extra.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition flex-shrink-0"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
          <Link
            href={"/story/" + storyId + "/extras"}
            className="inline-block text-xs text-black underline hover:no-underline"
          >
            Ver como lo ven los lectores →
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white/70 py-12 text-center space-y-3">
          <p className="text-4xl">✦</p>
          <p className="text-gray-500 text-sm">Aún no has añadido contenido extra.</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Añade mapas, arte de personajes, lore del mundo o trailers. Solo los suscriptores premium podrán verlo.
          </p>
        </div>
      )}
    </div>
  );
}