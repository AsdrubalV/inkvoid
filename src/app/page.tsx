import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import HeroBanner from "@/components/HeroBanner";
import StoryRow from "@/components/StoryRow";
import MoodboardRow from "@/components/MoodboardRow";
import ContinueReading from "@/components/ContinueReading";

export default async function HomePage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const { data: weekRanked } = await supabase.rpc("top_stories_by_views_week", { lim: 18 });
    const weekIds = (weekRanked ?? []).map((r: any) => r.story_id);

    let featuredStories: any[] = [];
    if (weekIds.length) {
      const { data } = await supabase
        .from("stories")
        .select("id, title, cover_url, category, views, profiles!stories_author_id_fkey(username)")
        .in("id", weekIds)
        .limit(18);
      featuredStories = weekIds
        .map((id: string) => data?.find((s: any) => s.id === id))
        .filter(Boolean);
    }

    if (!featuredStories.length) {
      const { data } = await supabase
        .from("stories")
        .select("id, title, cover_url, category, views, profiles!stories_author_id_fkey(username)")
        .order("created_at", { ascending: false })
        .limit(18);
      featuredStories = data ?? [];
    }

    const { count: totalStories } = await supabase
      .from("stories")
      .select("*", { count: "exact", head: true });

    const { count: totalAuthors } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    return (
      <div className="space-y-16 pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black px-8 py-16 text-white text-center space-y-6">
          <div className="absolute inset-0 flex gap-1 opacity-10 overflow-hidden">
            {featuredStories.slice(0, 9).map((s: any) => (
              s.cover_url && <img key={s.id} src={s.cover_url} alt="" className="h-full w-20 object-cover flex-shrink-0" />
            ))}
          </div>
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <p className="text-xs font-medium tracking-widest text-gray-400 uppercase">La plataforma de escritores y lectores</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">Tu historia merece<br />ser leída.</h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              InkVoid es el espacio donde escritores publican sus novelas y lectores descubren su próxima obsesión.
              Fantasía, romance, ciencia ficción, fanfiction y mucho más.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/signup" className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black hover:bg-gray-100 transition">Unirme gratis</Link>
              <Link href="/login" className="rounded-full border border-white/30 px-8 py-3 text-sm font-medium text-white hover:bg-white/10 transition">Ya tengo cuenta</Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: (totalStories ?? 0).toLocaleString(), label: "Historias publicadas" },
            { value: (totalAuthors ?? 0).toLocaleString(), label: "Autores registrados" },
            { value: "100%", label: "Gratis para leer" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-white/70 py-6 px-4 space-y-1">
              <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {featuredStories.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">🔥 Lo más leído esta semana</h2>
              <Link href="/signup" className="text-xs text-gray-500 hover:text-black">Ver todo →</Link>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {featuredStories.map((story: any) => (
                <Link key={story.id} href="/signup" className="group space-y-1.5">
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-border bg-gray-100">
                    {story.cover_url ? (
                      <img src={story.cover_url} alt={story.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400 p-2 text-center">{story.title}</div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium px-2 text-center">Regístrate para leer</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium leading-tight line-clamp-2">{story.title}</p>
                  {story.category && <span className="inline-block rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500">{story.category}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black p-6 text-white space-y-3">
            <p className="text-2xl">✍️</p>
            <h3 className="text-lg font-semibold">Para escritores</h3>
            <p className="text-sm text-gray-300 leading-relaxed">Publica tu novela, construye tu audiencia y monetiza tu trabajo. Soportamos todos los géneros — desde fantasía épica hasta fanfiction y romance.</p>
            <Link href="/signup" className="inline-block rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-gray-100 transition">Publicar mi historia</Link>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-6 space-y-3">
            <p className="text-2xl">📖</p>
            <h3 className="text-lg font-semibold">Para lectores</h3>
            <p className="text-sm text-gray-600 leading-relaxed">Descubre miles de historias únicas escritas por autores independientes. Comenta, dale like y sigue a tus autores favoritos.</p>
            <Link href="/signup" className="inline-block rounded-full bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition">Explorar historias</Link>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Explora por género</h2>
          <div className="flex flex-wrap gap-2">
            {["Fantasy", "Dark Fantasy", "Romance", "Fanfiction", "LitRPG", "Isekai", "Thriller", "Horror", "SciFi", "Supernatural", "Adventure", "Mystery", "Dystopian", "Erotic", "Mythology"].map((genre) => (
              <Link key={genre} href="/signup" className="rounded-full border border-border px-4 py-1.5 text-sm text-gray-700 hover:bg-black hover:text-white hover:border-black transition">{genre}</Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-black text-white text-center py-12 px-6 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">¿Listo para empezar?</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">Únete a InkVoid gratis. Lee, escribe y conecta con una comunidad apasionada por las historias.</p>
          <Link href="/signup" className="inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-black hover:bg-gray-100 transition">Crear mi cuenta gratis</Link>
        </div>
      </div>
    );
  }

  // ─── Vista autenticada ───────────────────────────────────────────────────

  const { data: progressData } = await supabase
    .from("reading_progress")
    .select("story_id, chapter_id, chapter_number, updated_at, stories(title), chapters(title)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(6);

  async function enrichStories(ids: string[]) {
    if (!ids.length) return [];
    const { data } = await supabase
      .from("stories")
      .select("id, title, cover_url, category, views, likes, profiles!stories_author_id_fkey(username)")
      .in("id", ids);
    return ids.map((id) => data?.find((s) => s.id === id)).filter(Boolean) as any[];
  }

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

  const categoryEmojis: Record<string, string> = {
    Fantasy: , Romance: , "Dark Fantasy": ,
    Isekai: , Horror: , Thriller: ",
  };

  return (
    <div className="space-y-4">
      <HeroBanner />

      {/* Continúa leyendo — mantiene StoryRow */}
      {progressData && progressData.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold tracking-tight">▶️ Continúa leyendo</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {progressData.map((p: any) => (
              <ContinueReading
                key={p.story_id}
                storyId={p.story_id}
                storyTitle={p.stories?.title ?? ""}
                chapterId={p.chapter_id}
                chapterNumber={p.chapter_number}
                chapterTitle={p.chapters?.title ?? ""}
                updatedAt={p.updated_at}
              />
            ))}
          </div>
        </section>
      )}

      <MoodboardRow title="Más leídas (total)"          stories={mostRead ?? []}        href="/trending?sort=views" />
      <MoodboardRow title="Más leídas hoy"              stories={storiesDay}            href="/trending?sort=views&period=day" />
      <MoodboardRow title="Más leídas esta semana"      stories={storiesWeek}           href="/trending?sort=views&period=week" />
      <MoodboardRow title="Más leídas este mes"         stories={storiesMonth}          href="/trending?sort=views&period=month" />
      <MoodboardRow title="Más leídas este año"         stories={storiesYear}           href="/trending?sort=views&period=year" />
      <MoodboardRow title="Más votadas"                 stories={mostLiked ?? []}       href="/trending?sort=likes" />
      <MoodboardRow title="Actualizadas recientemente"  stories={recentlyUpdated ?? []} href="/trending?sort=recent" />

      {categoryRows
        .filter((row) => row.stories.length > 0)
        .map((row) => (
          <MoodboardRow
            key={row.category}
            title={row.category}
            emoji={categoryEmojis[row.category] ?? "✦"}
            stories={row.stories}
            href={"/trending?category=" + encodeURIComponent(row.category)}
          />
        ))}
    </div>
  );
}