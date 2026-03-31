"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
 
const CATEGORIES = ["guias", "concursos", "recursos", "noticias", "entrevistas"];
 
interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  categoria: string;
  published: boolean;
}
 
interface Props {
  authorId: string;
  article?: Article;
}
 
export default function ArticleEditor({ authorId, article }: Props) {
  const router = useRouter();
  const supabase = createClient();
 
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [categoria, setCategoria] = useState(article?.categoria ?? "guias");
  const [published, setPublished] = useState(article?.published ?? false);
  const [coverUrl, setCoverUrl] = useState<string | null>(article?.cover_url ?? null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(article?.cover_url ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
 
  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);
  }
 
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    if (!article) setSlug(generateSlug(e.target.value));
  }
 
  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setCoverFile(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
  }
 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
 
    try {
      let finalCoverUrl = coverUrl;
 
      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const path = "articles/" + crypto.randomUUID() + "." + ext;
        const { data: storageData, error: storageError } = await supabase.storage
          .from("covers")
          .upload(path, coverFile, { cacheControl: "3600", upsert: false });
        if (storageError) throw storageError;
        const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(storageData.path);
        finalCoverUrl = publicUrl;
      }
 
      if (article) {
        const { error: updateError } = await supabase
          .from("articles")
          .update({
            title,
            slug,
            excerpt,
            content,
            categoria,
            published,
            cover_url: finalCoverUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", article.id);
        if (updateError) throw updateError;
        setSuccess("Artículo actualizado correctamente.");
      } else {
        const { error: insertError } = await supabase
          .from("articles")
          .insert({
            title,
            slug,
            excerpt,
            content,
            categoria,
            published,
            cover_url: finalCoverUrl,
            author_id: authorId,
          });
        if (insertError) throw insertError;
        setSuccess("Artículo creado correctamente.");
        if (published) router.push("/escritores/" + categoria + "/" + slug);
        else router.push("/escritores/admin");
      }
    } catch (err: any) {
      setError(err.message ?? "Error al guardar artículo.");
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
 
      {/* Portada */}
      <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-3">
        <h2 className="text-sm font-semibold">Imagen de portada</h2>
        <label className="cursor-pointer block">
          <div className="relative h-48 w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 hover:border-black transition flex items-center justify-center">
            {coverPreview ? (
              <img src={coverPreview} alt="cover" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center space-y-1">
                <p className="text-3xl">🖼️</p>
                <p className="text-xs text-gray-400">Click para subir imagen</p>
                <p className="text-[10px] text-gray-300">JPG, PNG — recomendado 1200x630px</p>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
        </label>
        {coverPreview && (
          <button
            type="button"
            onClick={() => { setCoverPreview(null); setCoverFile(null); setCoverUrl(null); }}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Eliminar imagen
          </button>
        )}
      </div>
 
      {/* Metadatos */}
      <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-4">
        <h2 className="text-sm font-semibold">Información del artículo</h2>
 
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Título *</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            required
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
            placeholder="Cómo escribir un primer capítulo que enganche..."
          />
        </div>
 
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Slug (URL)</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">/escritores/{categoria}/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
 
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
 
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Estado</label>
            <div className="flex items-center gap-2 h-10">
              <button
                type="button"
                onClick={() => setPublished(!published)}
                className={"relative inline-flex h-6 w-11 items-center rounded-full transition-colors " + (published ? "bg-green-500" : "bg-gray-200")}
              >
                <span className={"inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform " + (published ? "translate-x-6" : "translate-x-1")} />
              </button>
              <span className="text-xs text-gray-600">{published ? "Publicado" : "Borrador"}</span>
            </div>
          </div>
        </div>
 
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Resumen (excerpt)</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black resize-none"
            placeholder="Breve descripción del artículo para SEO y previews..."
            maxLength={300}
          />
          <p className="text-[10px] text-gray-400 text-right">{excerpt.length}/300</p>
        </div>
      </div>
 
      {/* Contenido */}
      <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Contenido</h2>
          <span className="text-[10px] text-gray-400">Soporta Markdown: ## Título, **negrita**, - lista</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={25}
          className="w-full rounded-lg border border-border bg-white px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-black font-mono resize-y"
          placeholder="## Introducción&#10;&#10;Escribe aquí el contenido de tu artículo."
        />
        <div className="flex flex-wrap gap-2 text-[10px] text-gray-400">
          <span>## Título H2</span>
          <span>•</span>
          <span>### Título H3</span>
          <span>•</span>
          <span>**negrita**</span>
          <span>•</span>
          <span>- lista</span>
          <span>•</span>
          <span>![alt](url) imagen</span>
        </div>
      </div>
 
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
 
      <div className="flex gap-3 flex-wrap">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition"
        >
          {loading ? "Guardando..." : article ? "Actualizar artículo" : "Crear artículo"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/escritores/admin")}
          className="rounded-full border border-border px-6 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        {article && (
          <a
            href={"/escritores/" + article.categoria + "/" + article.slug}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border px-6 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Ver artículo
          </a>
        )}
      </div>
    </form>
  );
}