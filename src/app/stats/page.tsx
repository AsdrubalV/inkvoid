import React from "react";
import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";

export default async function StatsPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Historias del autor
  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, cover_url")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (!stories?.length) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center space-y-4">
        <p className="text-4xl">📊</p>
        <h1 className="text-xl font-semibold">Estadísticas</h1>
        <p className="text-sm text-gray-500">Aún no tienes historias publicadas.</p>
        <Link href="/publish/new" className="inline-block rounded-full bg-black px-5 py-2 text-sm text-white hover:bg-gray-800 transition">
          Crear primera historia →
        </Link>
      </div>
    );
  }

  const storyIds = stories.map((s) => s.id);

  // Vistas totales por historia
  const { data: viewsByStory } = await supabase
    .from("story_views")
    .select("story_id")
    .in("story_id", storyIds);

  const viewsMap: Record<string, number> = {};
  (viewsByStory ?? []).forEach((v) => {
    viewsMap[v.story_id] = (viewsMap[v.story_id] ?? 0) + 1;
  });

  // Likes por historia
  const { data: likesByStory } = await supabase
    .from("story_likes")
    .select("story_id")
    .in("story_id", storyIds);

  const likesMap: Record<string, number> = {};
  (likesByStory ?? []).forEach((l) => {
    likesMap[l.story_id] = (likesMap[l.story_id] ?? 0) + 1;
  });

  // Bookmarks por historia
  const { data: bookmarksByStory } = await supabase
    .from("story_bookmarks")
    .select("story_id")
    .in("story_id", storyIds);

  const bookmarksMap: Record<string, number> = {};
  (bookmarksByStory ?? []).forEach((b) => {
    bookmarksMap[b.story_id] = (bookmarksMap[b.story_id] ?? 0) + 1;
  });

  // Vistas por capítulo
  const { data: chapterViewsData } = await supabase
    .from("chapter_views")
    .select("chapter_id, story_id")
    .in("story_id", storyIds);

  const chapterViewsMap: Record<string, number> = {};
  (chapterViewsData ?? []).forEach((v) => {
    chapterViewsMap[v.chapter_id] = (chapterViewsMap[v.chapter_id] ?? 0) + 1;
  });

  // Capítulos por historia
  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, title, chapter_number, story_id")
    .in("story_id", storyIds)
    .order("chapter_number", { ascending: true });

  // País de origen — top 5
  const { data: countriesData } = await supabase
    .from("story_views")
    .select("country")
    .in("story_id", storyIds)
    .not("country", "is", null);

  const countryCount: Record<string, number> = {};
  (countriesData ?? []).forEach((v) => {
    if (v.country) countryCount[v.country] = (countryCount[v.country] ?? 0) + 1;
  });
  const topCountries = Object.entries(countryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Crecimiento mensual — últimos 6 meses
  const { data: monthlyViews } = await supabase
    .from("story_views")
    .select("viewed_at")
    .in("story_id", storyIds)
    .gte("viewed_at", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

  const monthlyMap: Record<string, number> = {};
  (monthlyViews ?? []).forEach((v) => {
    const month = new Date(v.viewed_at).toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
    monthlyMap[month] = (monthlyMap[month] ?? 0) + 1;
  });
  const monthlyEntries = Object.entries(monthlyMap).slice(-6);

  const totalViews = Object.values(viewsMap).reduce((a, b) => a + b, 0);
  const totalLikes = Object.values(likesMap).reduce((a, b) => a + b, 0);
  const totalBookmarks = Object.values(bookmarksMap).reduce((a, b) => a + b, 0);
  const maxMonthly = Math.max(...monthlyEntries.map(([, v]) => v), 1);
  const maxCountry = topCountries[0]?.[1] ?? 1;

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">📊 Estadísticas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Solo tú puedes ver estos datos</p>
        </div>
        <Link href="/publish/manage" className="text-sm text-gray-500 hover:text-black transition">
          ← Mis historias
        </Link>
      </div>

      {/* Totales globales */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Vistas totales", value: totalViews, emoji: "👁️" },
          { label: "Likes totales", value: totalLikes, emoji: "❤️" },
          { label: "Guardados", value: totalBookmarks, emoji: "🔖" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-white/70 p-4 text-center space-y-1">
            <p className="text-2xl">{stat.emoji}</p>
            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Crecimiento mensual */}
      {monthlyEntries.length > 0 && (
        <div className="rounded-xl border border-border bg-white/70 p-5 space-y-4">
          <h2 className="text-sm font-semibold">📈 Vistas últimos 6 meses</h2>
          <div className="flex items-end gap-2 h-32">
            {monthlyEntries.map(([month, count]) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500">{count}</span>
                <div
                  className="w-full rounded-t bg-black transition-all"
                  style={{ height: Math.max((count / maxMonthly) * 96, 4) + "px" }}
                />
                <span className="text-[10px] text-gray-400">{month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* País de origen */}
      {topCountries.length > 0 && (
        <div className="rounded-xl border border-border bg-white/70 p-5 space-y-4">
          <h2 className="text-sm font-semibold">🌍 Top países de lectores</h2>
          <div className="space-y-2">
            {topCountries.map(([country, count]) => (
              <div key={country} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-700">{country}</span>
                  <span className="text-gray-500">{count} vistas</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-black transition-all"
                    style={{ width: (count / maxCountry) * 100 + "%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Por historia */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">📚 Por historia</h2>
        {stories.map((story) => {
          const storyChapters = (chapters ?? []).filter((c) => c.story_id === story.id);
          return (
            <div key={story.id} className="rounded-xl border border-border bg-white/70 overflow-hidden">
              <div className="flex items-center gap-4 p-4 border-b border-border">
                {story.cover_url ? (
                  <img src={story.cover_url} alt={story.title} className="h-14 w-10 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="h-14 w-10 rounded bg-gray-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm">{story.title}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    <span>👁️ {(viewsMap[story.id] ?? 0).toLocaleString()} vistas</span>
                    <span>❤️ {(likesMap[story.id] ?? 0).toLocaleString()} likes</span>
                    <span>🔖 {(bookmarksMap[story.id] ?? 0).toLocaleString()} guardados</span>
                  </div>
                </div>
              </div>

              {storyChapters.length > 0 && (
                <div className="divide-y divide-border">
                  {storyChapters.map((ch) => (
                    <div key={ch.id} className="flex items-center justify-between px-4 py-2">
                      <span className="text-xs text-gray-600 truncate">
                        {ch.chapter_number}. {ch.title}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-4">
                        👁️ {(chapterViewsMap[ch.id] ?? 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}