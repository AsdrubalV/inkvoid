import React from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";
import StatsCharts from "@/components/StatsCharts";

export default async function StatsPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, cover_url, created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (!stories?.length) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center space-y-4">
        <h1 className="text-xl font-semibold text-white">Estadísticas</h1>
        <p className="text-sm text-gray-400">Aún no tienes historias publicadas.</p>
        <Link href="/publish/new" className="inline-block rounded-full bg-white px-5 py-2 text-sm font-medium text-black hover:bg-gray-100 transition">
          Crear primera historia
        </Link>
      </div>
    );
  }

  const storyIds = stories.map((s) => s.id);

  const { data: allViews } = await supabase
    .from("story_views")
    .select("story_id, user_id, viewed_at")
    .in("story_id", storyIds);

  const viewsMap: Record<string, number> = {};
  const uniqueViewsMap: Record<string, Set<string>> = {};
  (allViews ?? []).forEach((v) => {
    viewsMap[v.story_id] = (viewsMap[v.story_id] ?? 0) + 1;
    if (v.user_id) {
      if (!uniqueViewsMap[v.story_id]) uniqueViewsMap[v.story_id] = new Set();
      uniqueViewsMap[v.story_id].add(v.user_id);
    }
  });

  const totalViews = Object.values(viewsMap).reduce((a, b) => a + b, 0);
  const totalUniqueViewers = new Set((allViews ?? []).filter((v) => v.user_id).map((v) => v.user_id)).size;

  const { data: allLikes } = await supabase
    .from("story_likes")
    .select("story_id")
    .in("story_id", storyIds);
  const likesMap: Record<string, number> = {};
  (allLikes ?? []).forEach((l) => { likesMap[l.story_id] = (likesMap[l.story_id] ?? 0) + 1; });
  const totalLikes = Object.values(likesMap).reduce((a, b) => a + b, 0);

  const { data: allBookmarks } = await supabase
    .from("story_bookmarks")
    .select("story_id")
    .in("story_id", storyIds);
  const bookmarksMap: Record<string, number> = {};
  (allBookmarks ?? []).forEach((b) => { bookmarksMap[b.story_id] = (bookmarksMap[b.story_id] ?? 0) + 1; });
  const totalBookmarks = Object.values(bookmarksMap).reduce((a, b) => a + b, 0);

  const { data: allChapters } = await supabase
    .from("chapters")
    .select("id, title, chapter_number, story_id")
    .in("story_id", storyIds)
    .order("chapter_number", { ascending: true });

  const chapterIds = (allChapters ?? []).map((c) => c.id);

  const { data: allComments } = chapterIds.length
    ? await supabase.from("comments").select("chapter_id, created_at").in("chapter_id", chapterIds)
    : { data: [] };

  const commentsPerStory: Record<string, number> = {};
  (allComments ?? []).forEach((c) => {
    const ch = (allChapters ?? []).find((ch) => ch.id === c.chapter_id);
    if (ch) commentsPerStory[ch.story_id] = (commentsPerStory[ch.story_id] ?? 0) + 1;
  });
  const totalComments = Object.values(commentsPerStory).reduce((a, b) => a + b, 0);

  const { data: followsData } = await supabase
    .from("follows")
    .select("created_at")
    .eq("author_id", user.id)
    .gte("created_at", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

  const followsMonthly: Record<string, number> = {};
  (followsData ?? []).forEach((f) => {
    const month = new Date(f.created_at).toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
    followsMonthly[month] = (followsMonthly[month] ?? 0) + 1;
  });

  const { data: chapterViewsData } = await supabase
    .from("chapter_views")
    .select("chapter_id, story_id, user_id")
    .in("story_id", storyIds);

  const chapterViewsMap: Record<string, number> = {};
  (chapterViewsData ?? []).forEach((v) => {
    chapterViewsMap[v.chapter_id] = (chapterViewsMap[v.chapter_id] ?? 0) + 1;
  });

  const readerChapterCount: Record<string, Set<string>> = {};
  (chapterViewsData ?? []).forEach((v) => {
    if (v.user_id) {
      if (!readerChapterCount[v.user_id]) readerChapterCount[v.user_id] = new Set();
      readerChapterCount[v.user_id].add(v.chapter_id);
    }
  });
  const avgChaptersPerReader =
    Object.keys(readerChapterCount).length > 0
      ? (Object.values(readerChapterCount).reduce((a, b) => a + b.size, 0) / Object.keys(readerChapterCount).length).toFixed(1)
      : "0";

  const monthlyMap: Record<string, number> = {};
  (allViews ?? []).forEach((v) => {
    if (!v.viewed_at) return;
    const month = new Date(v.viewed_at).toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
    monthlyMap[month] = (monthlyMap[month] ?? 0) + 1;
  });
  const monthlyEntries = Object.entries(monthlyMap).slice(-6);
  const maxMonthly = Math.max(...monthlyEntries.map(([, v]) => v), 1);

  // Daily views — últimos 30 días
  const dailyMap: Record<string, number> = {};
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  });
  last30Days.forEach((d) => { dailyMap[d] = 0; });
  (allViews ?? []).forEach((v) => {
    if (!v.viewed_at) return;
    const d = new Date(v.viewed_at);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff <= 29) {
      const label = d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
      dailyMap[label] = (dailyMap[label] ?? 0) + 1;
    }
  });
  const dailyViews = last30Days.map((date) => ({ date, count: dailyMap[date] ?? 0 }));

  const { data: countriesData } = await supabase
    .from("story_views")
    .select("country")
    .in("story_id", storyIds)
    .not("country", "is", null);
  const countryCount: Record<string, number> = {};
  (countriesData ?? []).forEach((v) => {
    if (v.country) countryCount[v.country] = (countryCount[v.country] ?? 0) + 1;
  });
  const topCountries = Object.entries(countryCount).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const storyComparison = stories
    .map((s) => ({
      id: s.id,
      title: s.title,
      cover_url: s.cover_url,
      views: viewsMap[s.id] ?? 0,
      uniqueViewers: uniqueViewsMap[s.id]?.size ?? 0,
      likes: likesMap[s.id] ?? 0,
      bookmarks: bookmarksMap[s.id] ?? 0,
      comments: commentsPerStory[s.id] ?? 0,
    }))
    .sort((a, b) => b.views - a.views);

  const maxViews = Math.max(...storyComparison.map((s) => s.views), 1);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-5xl space-y-6 py-8 px-4">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-sm text-gray-400 mt-0.5">Solo visible para ti</p>
          </div>
          <Link href="/publish/manage" className="text-sm text-gray-400 hover:text-white transition">
            Panel
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Vistas totales", value: totalViews.toLocaleString(), sub: totalUniqueViewers.toLocaleString() + " únicos" },
            { label: "Likes", value: totalLikes.toLocaleString(), sub: totalBookmarks.toLocaleString() + " guardados" },
            { label: "Comentarios", value: totalComments.toLocaleString(), sub: "en todos los capítulos" },
            { label: "Caps. por lector", value: avgChaptersPerReader, sub: "promedio" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl bg-gray-900 border border-gray-800 p-4 space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-3xl font-bold">{kpi.value}</p>
              <p className="text-xs text-gray-500">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Vistas mensuales + Seguidores */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Vistas mensuales</h2>
              <p className="text-xs text-gray-500">Últimos 6 meses</p>
            </div>
            {monthlyEntries.length > 0 ? (
              <div className="flex items-end gap-2 h-28">
                {monthlyEntries.map(([month, count]) => (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400">{count}</span>
                    <div className="w-full rounded-t bg-indigo-500" style={{ height: Math.max((count / maxMonthly) * 96, 4) + "px" }} />
                    <span className="text-[10px] text-gray-500">{month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-8 text-center">Sin datos aún</p>
            )}
          </div>

          <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Nuevos seguidores</h2>
              <p className="text-xs text-gray-500">Últimos 6 meses</p>
            </div>
            {Object.keys(followsMonthly).length > 0 ? (
              <div className="flex items-end gap-2 h-28">
                {Object.entries(followsMonthly).slice(-6).map(([month, count]) => {
                  const maxF = Math.max(...Object.values(followsMonthly), 1);
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-400">{count}</span>
                      <div className="w-full rounded-t bg-emerald-500" style={{ height: Math.max((count / maxF) * 96, 4) + "px" }} />
                      <span className="text-[10px] text-gray-500">{month}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-8 text-center">Sin datos aún</p>
            )}
          </div>
        </div>

        {/* Comparativa */}
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold">Comparativa de historias</h2>
            <p className="text-xs text-gray-500">Por vistas totales</p>
          </div>
          <div className="space-y-3">
            {storyComparison.map((s) => (
              <div key={s.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 truncate max-w-[70%]">{s.title}</span>
                  <span className="text-gray-400">{s.views} vistas</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-800">
                  <div className="h-1.5 rounded-full bg-violet-400" style={{ width: (s.views / maxViews) * 100 + "%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts client-side: Daily, Países, Retención */}
        <StatsCharts
          stories={stories}
          allChapters={allChapters ?? []}
          chapterViewsMap={chapterViewsMap}
          dailyViews={dailyViews}
          topCountries={topCountries}
          totalViews={totalViews}
        />

        {/* Tabla detalle */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-300">Detalle por historia</h2>
          <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Historia</th>
                  <th className="text-right px-4 py-3">Vistas</th>
                  <th className="text-right px-4 py-3">Únicos</th>
                  <th className="text-right px-4 py-3">Likes</th>
                  <th className="text-right px-4 py-3">Guardados</th>
                  <th className="text-right px-4 py-3">Comentarios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {storyComparison.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3">
                      <Link href={"/story/" + s.id} className="text-white hover:text-indigo-400 transition truncate block max-w-[200px]">
                        {s.title}
                      </Link>
                    </td>
                    <td className="text-right px-4 py-3 text-gray-300">{s.views.toLocaleString()}</td>
                    <td className="text-right px-4 py-3 text-gray-300">{s.uniqueViewers.toLocaleString()}</td>
                    <td className="text-right px-4 py-3 text-gray-300">{s.likes.toLocaleString()}</td>
                    <td className="text-right px-4 py-3 text-gray-300">{s.bookmarks.toLocaleString()}</td>
                    <td className="text-right px-4 py-3 text-gray-300">{s.comments.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}