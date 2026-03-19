"use client";
import { useEffect, useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  profiles: { username: string | null } | null;
}

interface Props {
  profileId: string;
  currentUserId: string | null;
  isOwner: boolean;
}

export default function ProfileMessages({ profileId, currentUserId, isOwner }: Props) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profile_messages")
        .select("id, content, created_at, user_id, profiles(username)")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(50);
      setMessages((data as Message[]) ?? []);
    })();
  }, [profileId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profile_messages")
        .insert({ profile_id: profileId, user_id: currentUserId, content })
        .select("id, content, created_at, user_id, profiles(username)")
        .single();
      if (error) throw error;
      setMessages((prev) => [data as Message, ...prev]);
      setContent("");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await supabase.from("profile_messages").delete().eq("id", id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-white/70 p-4">
      <h2 className="text-sm font-semibold">Mensajes del tablón</h2>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black resize-none"
            rows={3}
            placeholder="Deja un mensaje al autor..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">{content.length}/500</span>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {loading ? "Enviando..." : "Publicar"}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-gray-500">
          <a href="/login" className="underline hover:text-black">Inicia sesión</a> para dejar un mensaje.
        </p>
      )}

      <div className="divide-y divide-border">
        {messages.length ? (
          messages.map((m) => (
            <div key={m.id} className="py-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">
                  {m.profiles?.username ?? "Usuario"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">
                    {new Date(m.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {(isOwner || currentUserId === m.user_id) && (
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-[11px] text-gray-300 hover:text-red-500 transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{m.content}</p>
            </div>
          ))
        ) : (
          <p className="py-4 text-xs text-gray-400 text-center">Aún no hay mensajes. ¡Sé el primero!</p>
        )}
      </div>
    </div>
  );
}