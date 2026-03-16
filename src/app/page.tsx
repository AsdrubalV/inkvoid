import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import HeroBanner from "@/components/HeroBanner";
import StoryRow from "@/components/StoryRow";

export default async function HomePage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  // ─── Landing para usuarios no autenticados ───────────────────────────────
  if (!user) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center max-w-5xl w-full px-4">
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
              <Link href="/signup" className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 text-center">
                Crear cuenta gratis
              </Link>
              <Link href="/login" className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 text-center">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-border">
              <Image src="/inkvoidlogo4.png" alt="Bienvenido a InkVoid" fill className="object-contain p-10 opacity-20" priority />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 space-y-3">
                <p className="text-5xl">📖</p>
                <p className="text-xl font-semibold text-gray-700">Historias que importan</p>
                <p className="text-sm text-gray-500">Miles de historias te esperan. Encuentra tu próxima lectura favorita.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Queries para usuario autenticado ────────────────────────────────────

  const { data: mostRead } = await supabase
    .from("stories")
    .select("id, title, cover_url, category, views, likes, profiles!stories_author_id_fkey(username)")
    .order("views", { ascending: false })
    .limit(12);

  const { data: mostLiked } = await supabase
    .from("stories")
    .select("id, title, cover_url, category, views, likes, profiles!stories_author_id_fkey(username)")
    .order("likes", { ascending: false })
    .limit(12);

  const { data: recentlyUpdated } = await supabase
    .from("stories")
    .select("id, title, cover_url, category, views, likes, profiles!stories_author_id_fkey(username)")
    .order("last_chapter_at", { ascending: false })
    .limit(12);

  // Una fila por cada categoría destacada
  const featuredCategories = ["Fantasy", "Romance", "Dark Fantasy", "Isekai", "Horror", "Thriller"];
  const categoryRows = await Promise.all(
    featuredCategories.map(async (cat) => {
      const { data } = await supabase
        .from("stories")
        .select("id, title, cover_url, category, views, likes, profiles!stories_author_id_fkey(username)")
        .eq("category", cat)
        .order("views", { ascending: false })
        .limit(12);
      return { category: cat, stories: data ?? [] };
    })
  );

  return (
    <div className="space-y-10">

      {/* Hero Banner */}
      <HeroBanner />

      {/* Más leídas */}
      <StoryRow
        title="📖 Más leídas"
        stories={mostRead ?? []}
        href="/trending?sort=views"
      />

      {/* Más votadas */}
      <StoryRow
        title="❤️ Más votadas"
        stories={mostLiked ?? []}
        href="/trending?sort=likes"
      />

      {/* Actualizadas recientemente */}
      <StoryRow
        title="🆕 Actualizadas recientemente"
        stories={recentlyUpdated ?? []}
        href="/trending?sort=recent"
      />

      {/* Filas por categoría */}
      {categoryRows
        .filter((row) => row.stories.length > 0)
        .map((row) => (
          <StoryRow
            key={row.category}
            title={`✦ ${row.category}`}
            stories={row.stories}
            href={`/trending?category=${encodeURIComponent(row.category)}`}
          />
        ))}

    </div>
  );
}