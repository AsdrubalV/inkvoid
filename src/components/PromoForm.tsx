"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PACKAGES = [
  { label: "Básico", impressions: 1000, price: 2.99 },
  { label: "Estándar", impressions: 5000, price: 9.99, popular: true },
  { label: "Pro", impressions: 15000, price: 24.99 },
  { label: "Premium", impressions: 50000, price: 59.99 },
];

interface Story {
  id: string;
  title: string;
  cover_url: string | null;
}

interface Props {
  stories: Story[];
  authorId: string;
}

export default function PromoForm({ stories, authorId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [selectedPkg, setSelectedPkg] = useState(1);
  const [selectedStory, setSelectedStory] = useState(stories[0]?.id ?? "");
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleDesktopChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setDesktopFile(file);
    if (file) setDesktopPreview(URL.createObjectURL(file));
  }

  function handleMobileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setMobileFile(file);
    if (file) setMobilePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file: File, name: string): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = "promotions/" + authorId + "/" + name + "-" + Date.now() + "." + ext;
    const { data, error } = await supabase.storage
      .from("covers")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(data.path);
    return publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!desktopFile || !mobileFile) { setError("Debes subir ambas imágenes."); return; }
    if (!selectedStory) { setError("Selecciona una historia."); return; }
    setError("");
    setLoading(true);

    try {
      const [desktopUrl, mobileUrl] = await Promise.all([
        uploadImage(desktopFile, "desktop"),
        uploadImage(mobileFile, "mobile"),
      ]);

      const pkg = PACKAGES[selectedPkg];

      const { error: insertError } = await supabase.from("promotions").insert({
        author_id: authorId,
        story_id: selectedStory,
        image_desktop_url: desktopUrl,
        image_mobile_url: mobileUrl,
        impressions_purchased: pkg.impressions,
        price_paid: pkg.price,
        status: "pending",
      });

      if (insertError) throw insertError;

      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Error al crear campaña.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center space-y-3">
        <p className="text-2xl">🎉</p>
        <h3 className="font-semibold text-green-800">¡Campaña creada!</h3>
        <p className="text-sm text-green-700">
          Tu campaña está pendiente de pago. En cuanto se active el sistema de pagos podrás completar la compra y tu banner aparecerá en la página principal.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white/70 p-6 space-y-6">
      <h2 className="text-base font-semibold">Crear nueva campaña</h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Seleccionar historia */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Historia a promocionar *</label>
          <select
            value={selectedStory}
            onChange={(e) => setSelectedStory(e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
            required
          >
            {stories.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        {/* Seleccionar paquete */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Paquete *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PACKAGES.map((pkg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedPkg(i)}
                className={"rounded-xl border p-3 text-left transition " + (
                  selectedPkg === i ? "border-black bg-black text-white" : "border-border bg-white hover:border-gray-400"
                )}
              >
                <p className={"text-xs font-semibold " + (selectedPkg === i ? "text-white" : "text-gray-900")}>{pkg.label}</p>
                <p className={"text-[10px] " + (selectedPkg === i ? "text-gray-400" : "text-gray-500")}>{pkg.impressions.toLocaleString()} imp.</p>
                <p className={"text-sm font-bold mt-1 " + (selectedPkg === i ? "text-white" : "text-gray-900")}>${pkg.price}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Imágenes */}
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Desktop — horizontal */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Banner web (horizontal) *
              <span className="text-gray-400 font-normal ml-1">— recomendado 1200×400px</span>
            </label>
            <label className="cursor-pointer block">
              <div className="h-24 w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 hover:border-black transition flex items-center justify-center">
                {desktopPreview ? (
                  <img src={desktopPreview} alt="desktop" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center space-y-1">
                    <p className="text-xl">🖥️</p>
                    <p className="text-[10px] text-gray-400">Click para subir</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleDesktopChange} className="hidden" required />
            </label>
          </div>

          {/* Mobile — cuadrado */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Banner móvil (cuadrado) *
              <span className="text-gray-400 font-normal ml-1">— recomendado 600×600px</span>
            </label>
            <label className="cursor-pointer block">
              <div className="h-24 w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-gray-50 hover:border-black transition flex items-center justify-center">
                {mobilePreview ? (
                  <img src={mobilePreview} alt="mobile" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center space-y-1">
                    <p className="text-xl">📱</p>
                    <p className="text-[10px] text-gray-400">Click para subir</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleMobileChange} className="hidden" required />
            </label>
          </div>
        </div>

        {/* Resumen */}
        <div className="rounded-xl bg-gray-50 border border-border p-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Paquete</span>
            <span className="font-medium">{PACKAGES[selectedPkg].label} — {PACKAGES[selectedPkg].impressions.toLocaleString()} impresiones</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total a pagar</span>
            <span className="font-bold">${PACKAGES[selectedPkg].price}</span>
          </div>
          <p className="text-[10px] text-gray-400 pt-1">
            El pago se completará cuando se active el sistema de pagos. Tu campaña quedará en estado "pendiente" hasta entonces.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-black py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition"
        >
          {loading ? "Creando campaña..." : "Crear campaña — $" + PACKAGES[selectedPkg].price}
        </button>
      </form>
    </div>
  );
}