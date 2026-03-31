"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  amazon_url: string | null;
  patreon_url: string | null;
  tiktok_url: string | null;
  website_url: string | null;
}

export default function EditProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();

  const [bio, setBio] = useState(profile.bio ?? "");
  const [amazonUrl, setAmazonUrl] = useState(profile.amazon_url ?? "");
  const [patreonUrl, setPatreonUrl] = useState(profile.patreon_url ?? "");
  const [tiktokUrl, setTiktokUrl] = useState(profile.tiktok_url ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(profile.website_url ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(profile.banner_url);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setBannerFile(file);
    if (file) setBannerPreview(URL.createObjectURL(file));
  }

  async function uploadImage(file: File, folder: string): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = folder + "/" + profile.id + "/" + crypto.randomUUID() + "." + ext;
    const { data, error } = await supabase.storage
      .from("covers")
      .upload(path, file, { cacheControl: "3600", upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(data.path);
    return publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      let avatarUrl = profile.avatar_url;
      let bannerUrl = profile.banner_url;

      if (avatarFile) avatarUrl = await uploadImage(avatarFile, "avatars");
      if (bannerFile) bannerUrl = await uploadImage(bannerFile, "banners");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          bio,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          amazon_url: amazonUrl || null,
          patreon_url: patreonUrl || null,
          tiktok_url: tiktokUrl || null,
          website_url: websiteUrl || null,
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Error al guardar cambios.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-white/70 p-6">

      {/* Avatar y Banner */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Avatar</label>
          <label className="cursor-pointer block">
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-border bg-gray-50 hover:border-black transition flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover rounded-full" />
              ) : (
                <span className="text-2xl text-gray-300">👤</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
          <p className="text-[10px] text-gray-400">Click para cambiar</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Banner</label>
          <label className="cursor-pointer block">
            <div className="h-24 w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 hover:border-black transition flex items-center justify-center">
              {bannerPreview ? (
                <img src={bannerPreview} alt="banner" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400">Click para cambiar</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Biografía</label>
        <textarea
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Cuéntanos algo sobre ti..."
          maxLength={300}
        />
        <p className="text-[10px] text-gray-400 text-right">{bio.length}/300</p>
      </div>

      {/* Links */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-700">Links externos</h3>
        {[
          { label: "Amazon", value: amazonUrl, set: setAmazonUrl, placeholder: "https://amazon.com/..." },
          { label: "Patreon", value: patreonUrl, set: setPatreonUrl, placeholder: "https://patreon.com/..." },
          { label: "TikTok", value: tiktokUrl, set: setTiktokUrl, placeholder: "https://tiktok.com/@..." },
          { label: "Website", value: websiteUrl, set: setWebsiteUrl, placeholder: "https://..." },
        ].map((field) => (
          <div key={field.label} className="space-y-1">
            <label className="text-xs text-gray-600">{field.label}</label>
            <input
              type="url"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">✓ Cambios guardados correctamente.</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition"
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
```

**5. Agrega en `.env.local` y en Render:**
```
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key