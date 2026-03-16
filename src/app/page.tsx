import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  // Si NO hay sesión, mostrar landing/signup
  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center max-w-5xl w-full px-4">
          
          {/* Columna izquierda: bienvenida + signup */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight leading-tight">
                Un lugar para leer,<br />escribir y descubrir.
              </h1>
              <p className="text-gray-500 text-lg">
                InkVoid es donde las historias encuentran a sus lectores. Únete y empieza a explorar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 text-center"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 text-center"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          {/* Columna derecha: imagen */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-border">
              <Image
                src="/inkvoidlogo4.png"
                alt="Bienvenido a InkVoid"
                fill
                className="object-contain p-10 opacity-20"
                priority
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 space-y-3">
                <p className="text-5xl">📖</p>
                <p className="text-xl font-semibold text-gray-700">Historias que importan</p>
                <p className="text-sm text-gray-500">
                  Miles de historias te esperan. Encuentra tu próxima lectura favorita.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Si HAY sesión, mostrar el contenido normal
  const { data: recentStories } = await supabase
    .from("stories")
    .select(`
      id,
      title,
      description,
      cover_url,
      category,
      created_at,
      profiles!stories_author_id_fkey (
        username
      )
    `)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: trendingStories } = await supabase
    .from("trending_stories")
    .select("*")
    .limit(6);

  return (
    <div className="grid gap-10 lg:grid-cols-[2fr,1.1fr]">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Latest updates</h1>
        <div className="space-y-3 rounded-xl border border-border bg-white/70 p-4">
          {recentStories?.length ? (
            recentStories.map((story: any) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="flex gap-4 rounded-lg p-3 hover:bg-gray-50"
              >
                {story.cover_url && (
                  <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border bg-gray-100">
                    <img
                      src={story.cover_url}
                      alt={story.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-semibold leading-tight">{story.title}</h2>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">{story.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                    <span>{story.category}</span>
                    <span>•</span>
                    <span>{(story.profiles as any)?.username}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500">No stories yet. Be the first to publish.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Trending</h2>
        <div className="space-y-2 rounded-xl border border-border bg-white/70 p-4">
          {trendingStories?.length ? (
            trendingStories.map((s: any) => (
              <Link
                key={s.story_id}
                href={`/story/${s.story_id}`}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-50"
              >
                <span className="truncate">{s.title}</span>
                <span className="ml-3 text-[11px] text-gray-500">
                  score {s.score?.toFixed?.(0) ?? ""}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500">Trending stories will appear here.</p>
          )}
        </div>
      </section>
    </div>
  );
}