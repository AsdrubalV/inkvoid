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
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setMyUsername(data?.username ?? null));

    supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle()
      .then(({ data }) => setHasSubscription(!!data));
  }, [user]);

  if (loading || !user || myUsername !== profileUsername) return null;

  return (
    <div className="space-y-4">

      {/* Banner suscripción */}
      {!hasSubscription && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <p className="text-xs font-semibold text-amber-800">InkVoid Premium</p>
          <p className="text-xs text-amber-700">Accede a capitulos exclusivos, contenido extra y audiolibros por solo $5.99/mes.</p>
          <Link href="/subscribe" className="block text-center rounded-full bg-amber-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition">
            Suscribirme ahora
          </Link>
        </div>
      )}

      {hasSubscription && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <p className="text-xs font-semibold text-amber-800">Premium activo</p>
          <p className="text-xs text-amber-700">Tienes acceso completo a todo el contenido exclusivo de InkVoid.</p>
          <Link href="/subscribe" className="block text-center rounded-full border border-amber-300 px-4 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition">
            Gestionar suscripcion
          </Link>
        </div>
      )}

      <div className="rounded-xl border border-border bg-white/70 p-4 space-y-3">
        <h2 className="text-sm font-semibold">Panel de autor</h2>
        <p className="text-xs text-gray-500">Gestiona tu contenido publicado.</p>
        <div className="space-y-2">
          <Link href="/publish/manage" className="flex items-center w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            Mis historias
          </Link>
          <Link href="/publish/new" className="flex items-center w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            Nueva historia
          </Link>
          <Link href="/publish" className="flex items-center w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            Nuevo capitulo
          </Link>
          <Link href="/stats" className="flex items-center w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            Estadisticas
          </Link>
          <Link href="/biblioteca" className="flex items-center w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            Biblioteca offline
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white/70 p-4 space-y-3">
        <h2 className="text-sm font-semibold">Servicios</h2>
        <div className="space-y-2">
          <Link href="/mensajes" className="flex items-center w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            Mis mensajes
          </Link>
          <Link href="/services/legal" className="flex items-center w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            Servicios legales
          </Link>
          <Link href="/services/editorial" className="flex items-center w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            Servicios editoriales
          </Link>
          <Link href="/promocionarme" className="flex items-center w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            Promocionarme
          </Link>
          <Link href="/mis-ganancias" className="flex items-center w-full rounded-lg border border-border px-3 py-2 text-sm hover:bg-gray-50 transition">
            Mis ganancias
          </Link>
        </div>
      </div>
    </div>
  );
}