import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import HeroBanner from "@/components/HeroBanner";
import StoryRow from "@/components/StoryRow";

export default async function HomePage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

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
                <p className="text-sm text-gray-500">Miles de historias te esperan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Helpers para enriquecer IDs con datos de stories ──────────────────
  async function enrichStories(ids: string[]) {
    if (!ids.length) return [];
    const { data } = await supabase
      .from("stories")
      .select("id, title, cover_url, category, views, likes, profiles!stories_author_id_fkey(username)")
      .in("id", ids);
    // Preservar el orden del ranking
    return ids.map((id) => data?.find((s) => s.id === id)).filter(Boolean) as any[];
  }

  // ─── Top por período usando las funciones SQL que creamos ───────────────
  const [dayIds, weekIds, monthIds, yearIds] = await Promise.all([
    supabase.rpc("top_stories_by_views_day",   { lim: 12 }),
    supabase.rpc("top_stories_by_views_week",  { lim: 12 }),
    supabase.rpc("top_stories_by_views_month", { lim: 12 }),
    supabase.rpc("top_stories_by_views_year",  { lim: 12 }),
  ]);

  const [storiesDay, storiesWeek, storiesMonth, storiesYear] = await Promise.all([
    enrichStories((dayIds.data   ?? []).map((r: any) => r.story_id)),
    enrichStories((weekIds.data  ?? []).map((r: any) => r.story_id)),
    enrichStories((monthIds.data ?? []).map((r: any) => r.story_id)),
    enrichStories((yearIds.data  ?? []).map((r: any) => r.story_id)),
  ]);

  // ─── Queries estándar ───────────────────────────────────────────────────
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

      <HeroBanner />

      <StoryRow title="📖 Más leídas (total)"        stories={mostRead ?? []}      href="/trending?sort=views" />
      <StoryRow title="🔥 Más leídas hoy"            stories={storiesDay}          href="/trending?sort=views&period=day" />
      <StoryRow title="📈 Más leídas esta semana"    stories={storiesWeek}         href="/trending?sort=views&period=week" />
      <StoryRow title="🗓️ Más leídas este mes"       stories={storiesMonth}        href="/trending?sort=views&period=month" />
      <StoryRow title="🏆 Más leídas este año"       stories={storiesYear}         href="/trending?sort=views&period=year" />
      <StoryRow title="❤️ Más votadas"               stories={mostLiked ?? []}     href="/trending?sort=likes" />
      <StoryRow title="🆕 Actualizadas recientemente" stories={recentlyUpdated ?? []} href="/trending?sort=recent" />

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