"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const supabase = createClient();

  const [bio, setBio] = useState("");
  const [amazonUrl, setAmazonUrl] = useState("");
  const [patreonUrl, setPatreonUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, bio, avatar_url, banner_url, amazon_url, patreon_url, tiktok_url, website_url")
        .eq("username", username)
        .single();

      if (!profile || profile.id !== user.id) {
        router.push("/user/" + username);
        return;
      }

      setUserId(user.id);
      setBio(profile.bio ?? "");
      setAmazonUrl(profile.amazon_url ?? "");
      setPatreonUrl(profile.patreon_url ?? "");
      setTiktokUrl(profile.tiktok_url ?? "");
      setWebsiteUrl(profile.website_url ?? "");
      setAvatarPreview(profile.avatar_url ?? null);
      setBannerPreview(profile.banner_url ?? null);
      setLoadingData(false);
    }
    load();
  }, [username]);

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (s: string | null) => void
  ) {
    const file = e.target.files?.[0] ?? null;
    setFile(file);
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function uploadImage(file: File, folder: string): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = folder + "/" + userId + "/" + crypto.randomUUID() + "." + ext;
    const { data, error } = await supabase.storage
      .from("covers")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(data.path);
    return publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const updates: Record<string, string> = {
        bio,
        amazon_url: amazonUrl,
        patreon_url: patreonUrl,
        tiktok_url: tiktokUrl,
        website_url: websiteUrl,
      };

      if (avatarFile) {
        updates.avatar_url = await uploadImage(avatarFile, "avatars");
      }
      if (bannerFile) {
        updates.banner_url = await uploadImage(bannerFile, "banners");
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (updateError) throw updateError;

      router.push("/user/" + username);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Error al guardar");
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
        <h1 className="text-2xl font-semibold tracking-tight">Edit profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Banner */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Banner</label>
          <label className="cursor-pointer block">
            <div className="relative h-40 w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 hover:border-black transition flex items-center justify-center">
              {bannerPreview ? (
                <img src={bannerPreview} alt="banner preview" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center space-y-1">
                  <p className="text-2xl">🖼️</p>
                  <p className="text-xs text-gray-400">Click para subir banner</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setBannerFile, setBannerPreview)} className="hidden" />
          </label>
        </div>

        {/* Avatar */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Foto de perfil</label>
          <label className="cursor-pointer block w-fit">
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-border bg-gray-50 hover:border-black transition flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar preview" className="h-full w-full object-cover rounded-full" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setAvatarFile, setAvatarPreview)} className="hidden" />
          </label>
          <p className="text-[11px] text-gray-400">Click en la imagen para cambiarla</p>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Bio</label>
          <textarea
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
            rows={4}
            placeholder="Cuéntanos sobre ti..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* Links */}
        <div className="space-y-3 rounded-xl border border-border bg-white/70 p-4">
          <h2 className="text-sm font-semibold">Links</h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Patreon</label>
            <input
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              placeholder="https://patreon.com/tu-usuario"
              value={patreonUrl}
              onChange={(e) => setPatreonUrl(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Amazon</label>
            <input
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              placeholder="https://amazon.com/author/tu-usuario"
              value={amazonUrl}
              onChange={(e) => setAmazonUrl(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">TikTok</label>
            <input
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              placeholder="https://tiktok.com/@tu-usuario"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Website</label>
            <input
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              placeholder="https://tu-sitio.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
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
            className="rounded-full border border-border px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>

      </form>
    </div>
  );
}