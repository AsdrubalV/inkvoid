import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import PromoForm from "@/components/PromoForm";
import Link from "next/link";

export default async function PromocionarmePage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, cover_url")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  // Estadísticas por día para cada promoción activa
  const promotionIds = (promotions ?? []).map((p) => p.id);
  const { data: events } = promotionIds.length
    ? await supabase
        .from("promotion_events")
        .select("promotion_id, event_type, occurred_at")
        .in("promotion_id", promotionIds)
        .order("occurred_at", { ascending: true })
    : { data: [] };

  return (
    <div className="mx-auto max-w-4xl space-y-10 py-8">
      <div className="space-y-1">
        <Link href={"/user/" + profile?.username} className="text-sm text-gray-400 hover:text-black transition">
          ← Volver al perfil
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Promocionarme</h1>
        <p className="text-sm text-gray-500">Muestra tu historia en el banner principal de InkVoid y llega a miles de lectores.</p>
      </div>

      {/* Paquetes */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Paquetes disponibles</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Básico", impressions: 1000, price: 2.99 },
            { label: "Estándar", impressions: 5000, price: 9.99, popular: true },
            { label: "Pro", impressions: 15000, price: 24.99 },
            { label: "Premium", impressions: 50000, price: 59.99 },
          ].map((pkg) => (
            <div
              key={pkg.label}
              className={"rounded-2xl border p-5 space-y-3 " + (pkg.popular ? "border-black bg-black text-white" : "border-border bg-white/70")}
            >
              {pkg.popular && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Más popular</span>
              )}
              <div>
                <p className={"text-base font-bold " + (pkg.popular ? "text-white" : "text-gray-900")}>{pkg.label}</p>
                <p className={"text-xs mt-0.5 " + (pkg.popular ? "text-gray-400" : "text-gray-500")}>
                  {pkg.impressions.toLocaleString()} impresiones
                </p>
              </div>
              <p className={"text-2xl font-bold " + (pkg.popular ? "text-white" : "text-gray-900")}>
                ${pkg.price}
              </p>
              <p className={"text-[10px] " + (pkg.popular ? "text-gray-400" : "text-gray-400")}>
                ${(pkg.price / pkg.impressions * 1000).toFixed(2)} por cada 1.000 impresiones
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario nueva campaña */}
      {stories && stories.length > 0 ? (
        <PromoForm stories={stories} authorId={user.id} />
      ) : (
        <div className="rounded-2xl border border-border bg-white/70 p-8 text-center space-y-3">
          <p className="text-gray-500 text-sm">Necesitas publicar al menos una historia para crear una campaña.</p>
          <Link href="/publish/new" className="inline-block rounded-full bg-black px-5 py-2 text-xs font-medium text-white hover:bg-gray-800 transition">
            Publicar historia
          </Link>
        </div>
      )}

      {/* Mis campañas */}
      {promotions && promotions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold">Mis campañas</h2>
          <div className="space-y-4">
            {promotions.map((promo) => {
              const promoEvents = (events ?? []).filter((e) => e.promotion_id === promo.id);
              const impressionEvents = promoEvents.filter((e) => e.event_type === "impression");
              const clickEvents = promoEvents.filter((e) => e.event_type === "click");

              // Agrupar impresiones por día
              const byDay: Record<string, number> = {};
              impressionEvents.forEach((e) => {
                const day = new Date(e.occurred_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
                byDay[day] = (byDay[day] ?? 0) + 1;
              });

              const ctr = impressionEvents.length > 0
                ? ((clickEvents.length / impressionEvents.length) * 100).toFixed(2)
                : "0.00";

              const costPerClick = clickEvents.length > 0
                ? (promo.price_paid / clickEvents.length).toFixed(2)
                : "—";

              const remainingPct = Math.round(
                ((promo.impressions_purchased - promo.impressions_used) / promo.impressions_purchased) * 100
              );

              return (
                <div key={promo.id} className="rounded-2xl border border-border bg-white/70 overflow-hidden">
                  {/* Header campaña */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      {promo.image_desktop_url && (
                        <img src={promo.image_desktop_url} alt="banner" className="h-10 w-20 object-cover rounded-lg border border-border" />
                      )}
                      <div>
                        <p className="text-sm font-semibold">Campaña #{promo.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(promo.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <span className={"rounded-full px-3 py-1 text-xs font-medium " + (
                      promo.status === "active" ? "bg-green-100 text-green-700" :
                      promo.status === "pending" ? "bg-amber-100 text-amber-700" :
                      promo.status === "completed" ? "bg-gray-100 text-gray-500" :
                      "bg-red-100 text-red-600"
                    )}>
                      {promo.status === "active" ? "Activa" :
                       promo.status === "pending" ? "Pendiente de pago" :
                       promo.status === "completed" ? "Completada" : "Pausada"}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border">
                    <div className="p-4 space-y-0.5">
                      <p className="text-xs text-gray-500">Impresiones usadas</p>
                      <p className="text-xl font-bold">{promo.impressions_used.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">de {promo.impressions_purchased.toLocaleString()}</p>
                    </div>
                    <div className="p-4 space-y-0.5">
                      <p className="text-xs text-gray-500">Clicks</p>
                      <p className="text-xl font-bold">{clickEvents.length.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">CTR: {ctr}%</p>
                    </div>
                    <div className="p-4 space-y-0.5">
                      <p className="text-xs text-gray-500">Costo por click</p>
                      <p className="text-xl font-bold">{costPerClick === "—" ? "—" : "$" + costPerClick}</p>
                      <p className="text-[10px] text-gray-400">Invertido: ${promo.price_paid}</p>
                    </div>
                    <div className="p-4 space-y-0.5">
                      <p className="text-xs text-gray-500">Restante</p>
                      <p className="text-xl font-bold">{remainingPct}%</p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full bg-black rounded-full transition-all" style={{ width: remainingPct + "%" }} />
                      </div>
                    </div>
                  </div>

                  {/* Impresiones por día */}
                  {Object.keys(byDay).length > 0 && (
                    <div className="px-5 py-4 border-t border-border space-y-2">
                      <p className="text-xs font-medium text-gray-700">Impresiones por día</p>
                      <div className="flex items-end gap-1 h-16">
                        {Object.entries(byDay).slice(-14).map(([day, count]) => {
                          const max = Math.max(...Object.values(byDay));
                          const height = max > 0 ? Math.round((count / max) * 100) : 0;
                          return (
                            <div key={day} className="flex-1 flex flex-col items-center gap-1" title={day + ": " + count}>
                              <div className="w-full bg-black rounded-sm" style={{ height: height + "%" }} />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400">
                        {Object.keys(byDay).slice(-14).filter((_, i, arr) => i === 0 || i === arr.length - 1).map((day) => (
                          <span key={day}>{day}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}