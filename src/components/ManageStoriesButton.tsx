"use client";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface Props {
  profileUsername: string;
}

export default function ManageStoriesButton({ profileUsername }: Props) {
  const { user, loading } = useAuth();
  const supabase = createClient();
  const [myUsername, setMyUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setMyUsername(data?.username ?? null));
  }, [user]);

  if (loading || !user || myUsername !== profileUsername) return null;

  return (
    <div className="space-y-4">

      {/* Panel de autor */}
      <div className="rounded-xl border border-border bg-white/70 p-4 space-y-3">
        <h2 className="text-sm font-semibold">Panel de autor</h2>
        <p className="text-xs text-gray-500">Gestiona tu contenido publicado.</p>
        <div className="space-y-2">
          <Link href="/publish/manage" className="flex items-center gap-2 w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            📚 Mis historias
          </Link>
          <Link href="/publish/new" className="flex items-center gap-2 w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            ✍️ Nueva historia
          </Link>
          <Link href="/publish" className="flex items-center gap-2 w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            📄 Nuevo capítulo
          </Link>
        </div>
      </div>

      {/* Servicios */}
      <div className="rounded-xl border border-border bg-white/70 p-4 space-y-3">
        <h2 className="text-sm font-semibold">Servicios</h2>
        <div className="space-y-2">
          <Link href="/services/messages" className="flex items-center gap-2 w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            💬 Mis mensajes
          </Link>
          <Link href="/services/legal" className="flex items-center gap-2 w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            ⚖️ Servicios legales
          </Link>
          <Link href="/services/editorial" className="flex items-center gap-2 w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            📝 Servicios editoriales
          </Link>
          <Link href="/services/promote" className="flex items-center gap-2 w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            🚀 Promocionarme
          </Link>
          <Link href="/services/earnings" className="flex items-center gap-2 w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            💰 Mis ganancias
          </Link>
        </div>
      </div>

    </div>
  );
}