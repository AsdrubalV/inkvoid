"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const ADMIN_ID = "1e0f8e32-62b5-4c46-882a-1e2041343cd7";

interface Banner {
  id: string;
  src: string;
  src_mobile: string | null;
  alt: string;
  href: string | null;
  active: boolean;
  order_index: number;
  created_at: string;
}

export default function BannersAdminPage() {
  const supabase = createClient();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form nuevo banner
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [newAlt, setNewAlt] = useState("");
  const [newHref, setNewHref] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    const { data } = await supabase
      .from("banners")
      .select("*")
      .order("order_index", { ascending: true });
    setBanners(data ?? []);
    setLoading(false);
  }

  async function uploadImage(file: File, name: string): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = "banners/" + name + "-" + Date.now() + "." + ext;
    const { data, error } = await supabase.storage
      .from("covers")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(data.path);
    return publicUrl;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!desktopFile) { setError("La imagen de escritorio es obligatoria."); return; }
    setError("");
    setSaving(true);

    try {
      const desktopUrl = await uploadImage(desktopFile, "desktop");
      const mobileUrl = mobileFile ? await uploadImage(mobileFile, "mobile") : null;

      const maxOrder = banners.length ? Math.max(...banners.map((b) => b.order_index)) : 0;

      const { error: insertError } = await supabase.from("banners").insert({
        src: desktopUrl,
        src_mobile: mobileUrl,
        alt: newAlt || "Banner",
        href: newHref || null,
        active: true,
        order_index: maxOrder + 1,
      });

      if (insertError) throw insertError;

      setSuccess("Banner creado correctamente.");
      setDesktopFile(null);
      setDesktopPreview(null);
      setMobileFile(null);
      setMobilePreview(null);
      setNewAlt("");
      setNewHref("");
      setShowForm(false);
      await loadBanners();
    } catch (err: any) {
      setError(err.message ?? "Error al crear banner.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(banner: Banner) {
    await supabase.from("banners").update({ active: !banner.active }).eq("id", banner.id);
    await loadBanners();
  }

  async function deleteBanner(id: string) {
    if (!confirm("¿Eliminar este banner?")) return;
    await supabase.from("banners").delete().eq("id", id);
    await loadBanners();
  }

  async function moveUp(banner: Banner) {
    const prev = banners.find((b) => b.order_index < banner.order_index);
    if (!prev) return;
    await supabase.from("banners").update({ order_index: banner.order_index }).eq("id", prev.id);
    await supabase.from("banners").update({ order_index: prev.order_index }).eq("id", banner.id);
    await loadBanners();
  }

  async function moveDown(banner: Banner) {
    const next = [...banners].reverse().find((b) => b.order_index > banner.order_index);
    if (!next) return;
    await supabase.from("banners").update({ order_index: banner.order_index }).eq("id", next.id);
    await supabase.from("banners").update({ order_index: next.order_index }).eq("id", banner.id);
    await loadBanners();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/escritores/admin" className="text-sm text-gray-400 hover:text-black transition">
            ← Panel admin
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">Gestionar banners</h1>
          <p className="text-sm text-gray-500 mt-0.5">Controla qué aparece en el carrusel principal de InkVoid.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 transition"
        >
          {showForm ? "Cancelar" : "+ Nuevo banner"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      {/* Formulario nuevo banner */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-white/70 p-6 space-y-5">
          <h2 className="text-sm font-semibold">Nuevo banner</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">
                Imagen escritorio (horizontal) *
                <span className="text-gray-400 font-normal ml-1">1200×400px recomendado</span>
              </label>
              <label className="cursor-pointer block">
                <div className="h-24 w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 hover:border-black transition flex items-center justify-center">
                  {desktopPreview ? (
                    <img src={desktopPreview} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center space-y-1">
                      <p className="text-xl">🖥️</p>
                      <p className="text-[10px] text-gray-400">Click para subir</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setDesktopFile(f);
                    if (f) setDesktopPreview(URL.createObjectURL(f));
                  }}
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">
                Imagen móvil (opcional)
                <span className="text-gray-400 font-normal ml-1">600×600px recomendado</span>
              </label>
              <label className="cursor-pointer block">
                <div className="h-24 w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 hover:border-black transition flex items-center justify-center">
                  {mobilePreview ? (
                    <img src={mobilePreview} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center space-y-1">
                      <p className="text-xl">📱</p>
                      <p className="text-[10px] text-gray-400">Click para subir</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setMobileFile(f);
                    if (f) setMobilePreview(URL.createObjectURL(f));
                  }}
                />
              </label>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Texto alternativo</label>
              <input
                type="text"
                value={newAlt}
                onChange={(e) => setNewAlt(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                placeholder="Descripción del banner"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Link (URL)</label>
              <input
                type="text"
                value={newHref}
                onChange={(e) => setNewHref(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                placeholder="/story/... o https://..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition"
          >
            {saving ? "Subiendo..." : "Crear banner"}
          </button>
        </form>
      )}

      {/* Lista de banners */}
      {loading ? (
        <p className="text-sm text-gray-400">Cargando banners...</p>
      ) : banners.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white/70 p-10 text-center">
          <p className="text-gray-500 text-sm">No hay banners. Crea el primero.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white/70 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-gray-400 uppercase tracking-wider">
                <th className="text-left px-4 py-3">Banner</th>
                <th className="text-left px-4 py-3">Link</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">Orden</th>
                <th className="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {banners.map((banner, idx) => (
                <tr key={banner.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={banner.src}
                        alt={banner.alt}
                        className="h-10 w-20 object-cover rounded-lg border border-border flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs font-medium text-gray-700 truncate max-w-[150px]">{banner.alt}</p>
                        {banner.src_mobile && (
                          <p className="text-[10px] text-gray-400">+ versión móvil</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 truncate max-w-[120px]">
                    {banner.href ?? "Sin link"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(banner)}
                      className={"rounded-full px-2 py-0.5 text-[11px] font-medium transition " + (banner.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}
                    >
                      {banner.active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveUp(banner)}
                        disabled={idx === 0}
                        className="rounded px-1.5 py-0.5 text-xs border border-border hover:bg-gray-100 disabled:opacity-30 transition"
                      >
                        ↑
                      </button>
                      <span className="text-xs text-gray-400 w-4 text-center">{banner.order_index}</span>
                      <button
                        onClick={() => moveDown(banner)}
                        disabled={idx === banners.length - 1}
                        className="rounded px-1.5 py-0.5 text-xs border border-border hover:bg-gray-100 disabled:opacity-30 transition"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}