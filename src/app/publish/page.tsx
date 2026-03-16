import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PublishPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Historias del autor para el flujo de "agregar capítulo"
  const { data: myStories } = await supabase
    .from("stories")
    .select("id, title, cover_url")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Publicar</h1>
        <p className="text-sm text-gray-500">¿Qué quieres hacer hoy?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Nueva historia */}
        <Link
          href="/publish/new"
          className="group rounded-2xl border border-border bg-white/70 p-6 hover:border-black hover:shadow-sm transition space-y-3"
        >
          <div className="text-3xl">✍️</div>
          <div>
            <p className="font-semibold">Nueva historia</p>
            <p className="text-sm text-gray-500 mt-1">
              Crea una historia nueva con su portada, descripción y primer capítulo.
            </p>
          </div>
          <p className="text-xs text-black font-medium group-hover:underline">Comenzar →</p>
        </Link>

        {/* Agregar capítulo */}
        <div className="rounded-2xl border border-border bg-white/70 p-6 space-y-3">
          <div className="text-3xl">📄</div>
          <div>
            <p className="font-semibold">Agregar capítulo</p>
            <p className="text-sm text-gray-500 mt-1">
              Continúa una historia que ya publicaste.
            </p>
          </div>
          {myStories && myStories.length > 0 ? (
            <div className="space-y-2 pt-1">
              {myStories.map((story) => (
                <Link
                  key={story.id}
                  href={"/publish/chapter?story=" + story.id}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 hover:bg-gray-50 transition"
                >
                  {story.cover_url ? (
                    <img
                      src={story.cover_url}
                      alt={story.title}
                      className="h-10 w-7 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-7 rounded bg-gray-100 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">{story.title}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Aún no tienes historias publicadas.</p>
          )}
        </div>
      </div>
    </div>
  );
}