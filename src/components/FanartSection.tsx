"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Fanart {
  id: string;
  image_url: string;
  created_at: string;
  user_id: string;
  profiles: { username: string } | null;
}

interface Props {
  chapterId: string;
  storyId: string;
  currentUserId: string | null;
}

export default function FanartSection({ chapterId, storyId, currentUserId }: Props) {
  const supabase = createClient();
  const [fanarts, setFanarts] = useState<Fanart[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Fanart | null>(null);

  useEffect(() => { loadFanarts(); }, [chapterId]);

  async function loadFanarts() {
    const { data } = await supabase
      .from("fanarts")
      .select("id, image_url, created_at, user_id, profiles(username)")
      .eq("chapter_id", chapterId)
      .order("created_at", { ascending: false });
    setFanarts((data as any) ?? []);
  }

  async function handleUpload() {
    if (!file || !currentUserId) return;
    setUploading(true);
    setError("");
    try {
      const ext = file.name.split(".").pop();
      const path = "fanarts/" + chapterId + "/" + crypto.randomUUID() + "." + ext;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("covers")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (storageError) throw storageError;
      const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(storageData.path);

      const { error: insertError } = await supabase.from("fanarts").insert({
        chapter_id: chapterId,
        story_id: storyId,
        user_id: currentUserId,
        image_url: publicUrl,
      });
      if (insertError) throw insertError;

      setFile(null);
      setPreview(null);
      await loadFanarts();
    } catch (err: any) {
      setError(err.message ?? "Error al subir fanart.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    await supabase.from("fanarts").delete().eq("id", id);
    setFanarts((prev) => prev.filter((f) => f.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          Fanart
          {fanarts.length > 0 && (
            <span className="ml-2 text-xs text-gray-400 font-normal">{fanarts.length}</span>
          )}
        </h2>
      </div>

      {/* Upload */}
      {currentUserId ? (
        <div className="rounded-xl border border-border bg-white/70 p-4 space-y-3">
          <p className="text-xs text-gray-500">¿Hiciste un fanart de este capítulo? ¡Compártelo!</p>
          <label className="cursor-pointer block">
            <div className="h-32 w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 hover:border-black transition flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="preview" className="h-full w-full object-contain" />
              ) : (
                <div className="text-center space-y-1">
                  <p className="text-2xl">🎨</p>
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
                setFile(f);
                if (f) setPreview(URL.createObjectURL(f));
              }}
            />
          </label>
          {file && (
            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="rounded-full bg-black px-5 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition"
              >
                {uploading ? "Subiendo..." : "Publicar fanart"}
              </button>
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="rounded-full border border-border px-5 py-1.5 text-xs hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          <a href="/login" className="underline hover:text-black">Inicia sesión</a> para compartir tu fanart.
        </p>
      )}

      {/* Galería */}
      {fanarts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {fanarts.map((fanart) => (
            <div
              key={fanart.id}
              className="group relative rounded-xl overflow-hidden border border-border cursor-pointer"
              onClick={() => setSelected(fanart)}
            >
              <div className="aspect-square">
                <img
                  src={fanart.image_url}
                  alt="fanart"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2">
                <p className="text-[11px] text-white font-medium truncate">
                  @{fanart.profiles?.username ?? "usuario"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white/70 py-8 text-center">
          <p className="text-2xl mb-2">🎨</p>
          <p className="text-sm text-gray-400">Aún no hay fanarts. ¡Sé el primero!</p>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-w-lg w-full space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.image_url}
              alt="fanart"
              className="w-full rounded-2xl"
            />
            <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between">
              <p className="text-sm font-medium">
                @{selected.profiles?.username ?? "usuario"}
              </p>
              <div className="flex items-center gap-3">
                <p className="text-xs text-gray-400">
                  {new Date(selected.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                {selected.user_id === currentUserId && (
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="w-full rounded-full border border-white/30 py-2 text-sm text-white hover:bg-white/10 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}