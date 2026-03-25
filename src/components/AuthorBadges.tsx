import { createServerSupabase } from "@/lib/supabase/server";

interface Badge {
  label: string;
  description: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

interface Props {
  authorId: string;
}

function getBadges(stats: {
  totalViews: number;
  totalLikes: number;
  totalChapters: number;
  followers: number;
}): Badge[] {
  const badges: Badge[] = [];

  if (stats.totalViews >= 100000) {
    badges.push({ label: "100K Lectores", description: "Más de 100.000 lecturas", tier: "platinum" });
  } else if (stats.totalViews >= 10000) {
    badges.push({ label: "10K Lectores", description: "Más de 10.000 lecturas", tier: "gold" });
  } else if (stats.totalViews >= 1000) {
    badges.push({ label: "1K Lectores", description: "Más de 1.000 lecturas", tier: "silver" });
  } else if (stats.totalViews >= 100) {
    badges.push({ label: "100 Lectores", description: "Más de 100 lecturas", tier: "bronze" });
  }

  if (stats.totalLikes >= 10000) {
    badges.push({ label: "10K Likes", description: "Más de 10.000 likes", tier: "platinum" });
  } else if (stats.totalLikes >= 1000) {
    badges.push({ label: "1K Likes", description: "Más de 1.000 likes", tier: "gold" });
  } else if (stats.totalLikes >= 100) {
    badges.push({ label: "100 Likes", description: "Más de 100 likes", tier: "silver" });
  } else if (stats.totalLikes >= 10) {
    badges.push({ label: "10 Likes", description: "Más de 10 likes", tier: "bronze" });
  }

  if (stats.totalChapters >= 100) {
    badges.push({ label: "100 Capítulos", description: "Ha publicado 100 capítulos", tier: "platinum" });
  } else if (stats.totalChapters >= 50) {
    badges.push({ label: "50 Capítulos", description: "Ha publicado 50 capítulos", tier: "gold" });
  } else if (stats.totalChapters >= 10) {
    badges.push({ label: "10 Capítulos", description: "Ha publicado 10 capítulos", tier: "silver" });
  } else if (stats.totalChapters >= 1) {
    badges.push({ label: "Primer capítulo", description: "Publicó su primer capítulo", tier: "bronze" });
  }

  if (stats.followers >= 1000) {
    badges.push({ label: "1K Seguidores", description: "Más de 1.000 seguidores", tier: "platinum" });
  } else if (stats.followers >= 100) {
    badges.push({ label: "100 Seguidores", description: "Más de 100 seguidores", tier: "gold" });
  } else if (stats.followers >= 10) {
    badges.push({ label: "10 Seguidores", description: "Más de 10 seguidores", tier: "silver" });
  } else if (stats.followers >= 1) {
    badges.push({ label: "Primer seguidor", description: "Consiguió su primer seguidor", tier: "bronze" });
  }

  return badges;
}

const TIER_STYLES: Record<string, string> = {
  bronze:   "border-amber-300 bg-amber-50 text-amber-800",
  silver:   "border-gray-300 bg-gray-50 text-gray-600",
  gold:     "border-yellow-300 bg-yellow-50 text-yellow-800",
  platinum: "border-purple-300 bg-purple-50 text-purple-800",
};

const TIER_DOT: Record<string, string> = {
  bronze:   "bg-amber-400",
  silver:   "bg-gray-400",
  gold:     "bg-yellow-400",
  platinum: "bg-purple-400",
};

export default async function AuthorBadges({ authorId }: Props) {
  const supabase = createServerSupabase();

  const { data: stories } = await supabase
    .from("stories")
    .select("id, views, likes")
    .eq("author_id", authorId);

  const { count: totalChapters } = await supabase
    .from("chapters")
    .select("*", { count: "exact", head: true })
    .eq("author_id", authorId);

  const { count: followers } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("author_id", authorId);

  const totalViews = (stories ?? []).reduce((sum, s) => sum + (s.views ?? 0), 0);
  const totalLikes = (stories ?? []).reduce((sum, s) => sum + (s.likes ?? 0), 0);

  const badges = getBadges({
    totalViews,
    totalLikes,
    totalChapters: totalChapters ?? 0,
    followers: followers ?? 0,
  });

  const { data: weekRanked } = await supabase
    .rpc("top_stories_by_views_week", { lim: 10 });

  const storyIds = (stories ?? []).map((s) => s.id);
  const weekRankedIds = (weekRanked ?? []).map((r: any) => r.story_id);
  const isTopWeek = storyIds.some((id) => weekRankedIds.includes(id));
  const weekRank = isTopWeek
    ? weekRankedIds.findIndex((id: string) => storyIds.includes(id)) + 1
    : null;

  if (badges.length === 0 && !weekRank) return null;

  return (
    <div className="space-y-3">

      {/* Ranking semanal */}
      {weekRank && (
        <div className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <p className="text-xs font-semibold text-green-800">
            Top {weekRank} esta semana
          </p>
        </div>
      )}

      {/* Insignias */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, i) => (
            <div
              key={i}
              title={badge.description}
              className={"flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium " + TIER_STYLES[badge.tier]}
            >
              <div className={"h-1.5 w-1.5 rounded-full flex-shrink-0 " + TIER_DOT[badge.tier]} />
              {badge.label}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}