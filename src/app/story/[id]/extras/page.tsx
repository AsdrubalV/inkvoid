import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import ExtrasViewer from "@/components/ExtrasViewer";

export default async function ExtrasPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();

  const { data: story } = await supabase
    .from("stories")
    .select("id, title, cover_url, author_id")
    .eq("id", params.id)
    .single();

  if (!story) return notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isAuthor = user?.id === story.author_id;

  // Verificar suscripción
  let hasSubscription = false;
  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    hasSubscription = !!sub;
  }

  const canAccess = isAuthor || hasSubscription;

  const { data: extras } = await supabase
    .from("story_extras")
    .select("*")
    .eq("story_id", params.id)
    .order("order_index", { ascending: true });

  const { data: authorProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", story.author_id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="space-y-1">
        <Link href={"/story/" + story.id} className="text-sm text-gray-400 hover:text-black transition">
          ← {story.title}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Contenido extra</h1>
          {isAuthor && (
            <Link
              href={"/story/" + story.id + "/extras/manage"}
              className="rounded-full border border-border px-4 py-1.5 text-xs font-medium hover:bg-gray-50 transition"
            >
              Gestionar extras
            </Link>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Contenido exclusivo de{" "}
          <Link href={"/user/" + authorProfile?.username} className="underline hover:text-black">
            @{authorProfile?.username}
          </Link>
        </p>
      </div>

      {!canAccess ? (
        /* Paywall */
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-10 text-center space-y-4">
          <p className="text-4xl">✦</p>
          <h2 className="text-lg font-semibold text-amber-900">Contenido exclusivo para suscriptores</h2>
          <p className="text-sm text-amber-700 max-w-md mx-auto">
            El autor ha publicado mapas, arte de personajes, lore y más contenido exclusivo. Suscríbete a InkVoid Premium para acceder.
          </p>

          {/* Preview borrosa de los extras */}
          {extras && extras.length > 0 && (
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mt-4">
              {extras.slice(0, 3).map((extra) => (
                <div key={extra.id} className="aspect-square rounded-xl overflow-hidden relative">
                  {extra.image_url ? (
                    <img src={extra.image_url} alt={extra.title} className="h-full w-full object-cover blur-md scale-110" />
                  ) : (
                    <div className="h-full w-full bg-amber-100 flex items-center justify-center">
                      <span className="text-2xl">{extra.type === "lore" ? "📖" : extra.type === "video" ? "🎬" : "🖼️"}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-amber-900/20 flex items-center justify-center">
                    <span className="text-white text-lg">🔒</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {user ? (
              <Link href="/subscribe" className="rounded-full bg-amber-500 px-6 py-2 text-sm font-medium text-white hover:bg-amber-600 transition">
                Suscribirme — $5.99/mes
              </Link>
            ) : (
              <>
                <Link href="/signup" className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition">
                  Crear cuenta
                </Link>
                <Link href="/login" className="rounded-full border border-border px-6 py-2 text-sm hover:bg-gray-50 transition">
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>
          <p className="text-xs text-amber-600">
            {extras?.length ?? 0} elementos de contenido exclusivo disponibles
          </p>
        </div>
      ) : (
        <ExtrasViewer extras={extras ?? []} storyId={story.id} />
      )}
    </div>
  );
}