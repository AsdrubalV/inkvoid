import { createServerSupabase } from "@/lib/supabase/server";
import TrendingFilters from "@/components/TrendingFilters";
import TrendingGrid from "@/components/TrendingGrid";
import TrendingPagination from "@/components/TrendingPagination";

const ALL_CATEGORIES = [
  "Terror", "Fantasy", "Dark Fantasy", "SciFi", "Dark SciFi",
  "Isekai", "LitRPG", "Paranormal", "Fanfiction", "Action",
  "Mystery", "Regression", "Post Apocalyptic", "Zombie",
  "Supernatural", "Adventure", "Psychological Horror",
  "Cosmic Horror", "Thriller", "Crime", "Dystopian",
  "Survival", "Urban Fantasy", "Mythology", "Historical Fantasy",
  "Erotic", "Comedy", "Romance"
];

interface Props {
  searchParams: {
    sort?: string; period?: string; category?: string; page?: string;
    tags?: string; excludeTags?: string; status?: string;
    language?: string; adult?: string; words?: string;
  };
}

export default async function TrendingPage({ searchParams }: Props) {
  const supabase = createServerSupabase();

  const sort         = searchParams.sort         ?? "views";
  const period       = searchParams.period       ?? "all";
  const category     = searchParams.category     ?? "";
  const page         = parseInt(searchParams.page ?? "1");
  const tagsParam    = searchParams.tags         ?? "";
  const excludeParam = searchParams.excludeTags  ?? "";
  const status       = searchParams.status       ?? "";
  const language     = searchParams.language     ?? "";
  const adult        = searchParams.adult        ?? "";
  const words        = searchParams.words        ?? "";

  const pageSize = 36;
  const offset   = (page - 1) * pageSize;

  const includeTags  = tagsParam    ? tagsParam.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)    : [];
  const excludeTags  = excludeParam ? excludeParam.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean) : [];
  const [wordsMin, wordsMax] = words ? words.split("-").map(Number) : [null, null];

  function applyCommonFilters(q: any) {
    if (category)          q = q.eq("category", category);
    if (status)            q = q.eq("status", status);
    if (language)          q = q.eq("language", language);
    if (adult === "true")  q = q.eq("is_adult", true);
    if (adult === "false") q = q.eq("is_adult", false);
    if (wordsMin !== null) q = q.gte("total_words", wordsMin);
    if (wordsMax !== null) q = q.lte("total_words", wordsMax);
    return q;
  }

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
          .select("id, title, cover_url, category, views, likes, tags, status, language, is_adult, total_words, profiles!stories_author_id_fkey(username)")
          .in("id", ids);
        q = applyCommonFilters(q);
        const { data } = await q;
        stories = ids
          .map((id: string) => data?.find((s: any) => s.id === id))
          .filter(Boolean);
      }
    }
  } else {
    let q = supabase
      .from("stories")
      .select("id, title, cover_url, category, views, likes, tags, status, language, is_adult, total_words, profiles!stories_author_id_fkey(username)");

    q = applyCommonFilters(q);

    if (sort === "likes")       q = q.order("likes",           { ascending: false });
    else if (sort === "recent") q = q.order("last_chapter_at", { ascending: false });
    else if (sort === "new")    q = q.order("created_at",      { ascending: false });
    else                        q = q.order("views",           { ascending: false });

    q = q.range(offset, offset + pageSize - 1);
    const { data } = await q;
    stories = data ?? [];
  }

  // Filtrar tags en memoria (Supabase no soporta array contains con texto)
  if (includeTags.length > 0) {
    stories = stories.filter((s) => {
      const storyTags = (Array.isArray(s.tags) ? s.tags : (s.tags ?? "").split(","))
        .map((t: string) => t.trim().toLowerCase());
      return includeTags.every((tag) => storyTags.includes(tag));
    });
  }

  if (excludeTags.length > 0) {
    stories = stories.filter((s) => {
      const storyTags = (Array.isArray(s.tags) ? s.tags : (s.tags ?? "").split(","))
        .map((t: string) => t.trim().toLowerCase());
      return !excludeTags.some((tag) => storyTags.includes(tag));
    });
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
        currentTags={tagsParam}
        currentExcludeTags={excludeParam}
        currentStatus={status}
        currentLanguage={language}
        currentAdult={adult}
        currentWords={words}
      />
      <TrendingGrid stories={stories} />
      <TrendingPagination
        page={page}
        hasMore={stories.length === pageSize}
        sort={sort}
        period={period}
        category={category}
      />
    </div>
  );
}