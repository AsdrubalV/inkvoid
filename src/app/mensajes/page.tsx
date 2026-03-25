import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MensajesPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Traer todos los mensajes donde el usuario es sender o receiver
  const { data: messages } = await supabase
    .from("direct_messages")
    .select("id, sender_id, receiver_id, content, read, created_at")
    .or("sender_id.eq." + user.id + ",receiver_id.eq." + user.id)
    .order("created_at", { ascending: false });

  // Agrupar por conversación (el otro usuario)
  const conversationsMap: Record<string, {
    otherId: string;
    lastMessage: string;
    lastAt: string;
    unread: number;
  }> = {};

  (messages ?? []).forEach((m) => {
    const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
    if (!conversationsMap[otherId]) {
      conversationsMap[otherId] = {
        otherId,
        lastMessage: m.content,
        lastAt: m.created_at,
        unread: 0,
      };
    }
    if (!m.read && m.receiver_id === user.id) {
      conversationsMap[otherId].unread++;
    }
  });

  const conversations = Object.values(conversationsMap);

  // Traer perfiles de los otros usuarios
  const otherIds = conversations.map((c) => c.otherId);
  const { data: profiles } = otherIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", otherIds)
    : { data: [] };

  const profileMap: Record<string, any> = {};
  (profiles ?? []).forEach((p) => { profileMap[p.id] = p; });

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mensajes</h1>
        <p className="text-sm text-gray-500 mt-1">Tus conversaciones privadas</p>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white/70 py-16 text-center space-y-3">
          <p className="text-4xl">💬</p>
          <p className="text-gray-600 text-sm font-medium">No tienes mensajes aún</p>
          <p className="text-gray-400 text-xs">
            Visita el perfil de un autor para enviarle un mensaje directo.
          </p>
          <Link href="/trending" className="inline-block mt-2 rounded-full bg-black px-5 py-2 text-xs font-medium text-white hover:bg-gray-800 transition">
            Explorar autores
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white/70 overflow-hidden divide-y divide-border">
          {conversations.map((conv) => {
            const profile = profileMap[conv.otherId];
            if (!profile) return null;
            return (
              <Link
                key={conv.otherId}
                href={"/mensajes/" + profile.username}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition"
              >
                <div className="h-12 w-12 overflow-hidden rounded-full border border-border bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl text-gray-400">👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={"text-sm " + (conv.unread > 0 ? "font-bold text-black" : "font-medium text-gray-800")}>
                      @{profile.username}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(conv.lastAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white text-[10px] font-bold">
                    {conv.unread}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}