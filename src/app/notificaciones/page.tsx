import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NotificacionesPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Marcar todas como leídas al entrar
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notificaciones</h1>
        <p className="text-sm text-gray-500 mt-1">Tu actividad reciente en InkVoid</p>
      </div>

      {!notifications?.length ? (
        <div className="rounded-2xl border border-border bg-white/70 py-16 text-center space-y-3">
          <p className="text-4xl">🔕</p>
          <p className="text-gray-600 text-sm font-medium">No tienes notificaciones aún</p>
          <p className="text-gray-400 text-xs">
            Sigue a tus autores favoritos para recibir alertas cuando publiquen.
          </p>
          <Link
            href="/trending"
            className="inline-block mt-2 rounded-full bg-black px-5 py-2 text-xs font-medium text-white hover:bg-gray-800 transition"
          >
            Explorar historias
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white/70 overflow-hidden divide-y divide-border">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.url ?? "/"}
              className="flex gap-4 px-5 py-4 hover:bg-gray-50 transition"
            >
              <div className="text-xl flex-shrink-0 mt-0.5">
                {n.type === "new_chapter" ? "📖" : "🔔"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                {n.body && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                )}
                <p className="text-[11px] text-gray-400 mt-1">
                  {new Date(n.created_at).toLocaleDateString("es-ES", {
                    day: "numeric", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}