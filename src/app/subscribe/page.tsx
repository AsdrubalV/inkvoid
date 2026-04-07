import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";
import SubscribeButton from "@/components/SubscribeButton";

export default async function SubscribePage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const isActive = !!sub;

  return (
    <div className="mx-auto max-w-2xl py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">InkVoid Premium</h1>
        <p className="text-gray-500">Accede a todo el contenido exclusivo de la plataforma</p>
      </div>

      {isActive ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center space-y-4">
          <p className="text-2xl">✓</p>
          <h2 className="text-lg font-semibold text-green-800">Ya eres suscriptor Premium</h2>
          <p className="text-sm text-green-700">
            Tu suscripción está activa hasta el{" "}
            {sub?.current_period_end
              ? new Date(sub.current_period_end).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
              : "—"}
          </p>
          <SubscribeButton mode="portal" />
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white/70 p-8 space-y-6">
          <div className="space-y-4">
            {[
              { icon: "📖", title: "Capítulos premium", desc: "Accede a capítulos exclusivos que los autores reservan para suscriptores." },
              { icon: "✦", title: "Contenido extra", desc: "Mapas, arte de personajes, lore exclusivo y videos de tus historias favoritas." },
              { icon: "🎵", title: "Audiolibros", desc: "Escucha las novelas narradas directamente en la plataforma." },
              { icon: "❤️", title: "Apoya a los autores", desc: "El 60% de tu suscripción va directamente al pool de ganancias de los escritores." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-gray-50 border border-border p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-2xl">$5.99</p>
              <p className="text-xs text-gray-500">por mes · cancela cuando quieras</p>
            </div>
            <SubscribeButton mode="checkout" />
          </div>

          <p className="text-[11px] text-center text-gray-400">
            Pago seguro procesado por Stripe. Cancela en cualquier momento desde tu perfil.
          </p>
        </div>
      )}

      <div className="text-center">
        <Link href="/" className="text-sm text-gray-400 hover:text-black transition">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}