import { createServerSupabase } from "@/lib/supabase/server";
import TrendingFilters from "@/components/TrendingFilters";
import TrendingGrid from "@/components/TrendingGrid";

const ALL_CATEGORIES = [
  "Terror", "Fantasy", "Dark Fantasy", "SciFi", "Dark SciFi",
  "Isekai", "LitRPG", "Paranormal", "Fanfiction", "Action",
  "Mystery", "Regression", "Post Apocalyptic", "Zombie",
  "Supernatural", "Adventure", "Psychological Horror",
  "Cosmic Horror", "Thriller", "Crime", "Dystopian",
  "Survival", "Urban Fantasy", "Mythology", "Historical Fantasy", "Erotic"
];

interface Props {
  searchParams: { sort?: string; period?: string; category?: string; page?: string };
}

export default async function TrendingPage({ searchParams }: Props) {
  const supabase = createServerSupabase();
  const sort     = searchParams.sort     ?? "views";
  const period   = searchParams.period   ?? "all";
  const category = searchParams.category ?? "";
  const page     = parseInt(searchParams.page ?? "1");
  const pageSize = 36;
  const offset   = (page - 1) * pageSize;

  let stories: any[] = [];

  if (sort === "views" && period !== "all") {
    const fnMap: Record<string, string> = {
      day:   "top_stories_by_views_day",
      week:  "top_stories_by_views_week",
      month: "top_stories_by_views_month",
      year:  "top_stories_by_views_year",
    };
    const fn = fnMap[period];
    if (fn) {
      const { data: ranked } = await supabase.rpc(fn, { lim: pageSize + offset });
      const ids = (ranked ?? []).slice(offset, offset + pageSize).map((r: any) => r.story_id);
      if (ids.length) {
        let q = supabase
          .from("stories")
          .select("id, title, cover_url, category, views, likes, profiles!stories_author_id_fkey(username)")
          .in("id", ids);
        if (category) q = q.eq("category", category);
        const { data } = await q;
        stories = ids
          .map((id: string) => data?.find((s: any) => s.id === id))
          .filter(Boolean);
      }
    }
  } else {
    let q = supabase
      .from("stories")
      .select("id, title, cover_url, category, views, likes, profiles!stories_author_id_fkey(username)");

    if (category) q = q.eq("category", category);

    if (sort === "likes")       q = q.order("likes",           { ascending: false });
    else if (sort === "recent") q = q.order("last_chapter_at", { ascending: false });
    else if (sort === "new")    q = q.order("created_at",      { ascending: false });
    else                        q = q.order("views",           { ascending: false });

    q = q.range(offset, offset + pageSize - 1);
    const { data } = await q;
    stories = data ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trending</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ranked by views, likes, comments and recent chapter activity.
        </p>
      </div>

      <TrendingFilters
        categories={ALL_CATEGORIES}
        currentSort={sort}
        currentPeriod={period}
        currentCategory={category}
      />

      <TrendingGrid stories={stories} />

      <Pagination
        page={page}
        hasMore={stories.length === pageSize}
        sort={sort}
        period={period}
        category={category}
      />
    </div>
  );
}

function Pagination({ page, hasMore, sort, period, category }: {
  page: number; hasMore: boolean; sort: string; period: string; category: string;
}) {
  const base = `/trending?sort=${sort}&period=${period}${category ? `&category=${encodeURIComponent(category)}` : ""}`;
  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      {page > 1 && (
        
          href={`${base}&page=${page - 1}`}
          className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-gray-50"
        >
          ← Anterior
        </a>
      )}
      <span className="text-sm text-gray-500">Página {page}</span>
      {hasMore && (
        
          href={`${base}&page=${page + 1}`}
          className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-gray-50"
        >
          Siguiente →
        </a>
      )}
    </div>
  );
}
