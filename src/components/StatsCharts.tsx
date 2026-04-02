"use client";
import { useRef, useState } from "react";

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  story_id: string;
}

interface Story {
  id: string;
  title: string;
  cover_url: string | null;
}

interface DailyView {
  date: string;
  count: number;
}

interface Props {
  stories: Story[];
  allChapters: Chapter[];
  chapterViewsMap: Record<string, number>;
  dailyViews: DailyView[];
  topCountries: [string, number][];
  totalViews: number;
}

// Retención vertical con scroll
function RetentionChart({ story, chapters, chapterViewsMap }: {
  story: Story;
  chapters: Chapter[];
  chapterViewsMap: Record<string, number>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const ch1Views = chapterViewsMap[chapters[0]?.id] ?? 1;
  const maxViews = Math.max(...chapters.map((c) => chapterViewsMap[c.id] ?? 0), 1);

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-300 uppercase tracking-wider">{story.title}</p>
      <div className="relative">
        <div
          ref={scrollRef}
          className="overflow-x-auto pb-2 scrollbar-thin"
          style={{ scrollbarColor: "#4b5563 transparent" }}
        >
          <div
            className="flex items-end gap-1.5"
            style={{ minWidth: Math.max(chapters.length * 28, 100) + "px", height: "140px", alignItems: "flex-end" }}
          >
            {chapters.map((ch) => {
              const views = chapterViewsMap[ch.id] ?? 0;
              const pct = Math.round((views / ch1Views) * 100);
              const barH = Math.max((views / maxViews) * 110, 3);
              const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : pct >= 25 ? "#f97316" : "#ef4444";

              return (
                <div key={ch.id} className="flex flex-col items-center gap-1 group" style={{ minWidth: "24px" }}>
                  <div className="relative flex flex-col items-center">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10">
                      <div className="rounded-lg bg-gray-700 px-2 py-1 text-[10px] text-white whitespace-nowrap shadow-lg">
                        Cap. {ch.chapter_number}: {views} vistas ({pct}%)
                      </div>
                      <div className="h-1.5 w-1.5 bg-gray-700 rotate-45 -mt-0.5" />
                    </div>
                    <div
                      className="w-4 rounded-t-sm transition-all"
                      style={{ height: barH + "px", backgroundColor: color }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-500">{ch.chapter_number}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Indicador de scroll */}
        {chapters.length > 20 && (
          <p className="text-[10px] text-gray-600 mt-1">← Desliza para ver más capítulos</p>
        )}
      </div>
      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500 inline-block" />≥80%</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-400 inline-block" />50-79%</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-orange-400 inline-block" />25-49%</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-500 inline-block" />{"<"}25%</span>
      </div>
    </div>
  );
}

// Daily performance
function DailyPerformance({ dailyViews }: { dailyViews: DailyView[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const last30 = dailyViews.slice(-30);
  const maxVal = Math.max(...last30.map((d) => d.count), 1);

  if (!last30.length) {
    return <p className="text-sm text-gray-500 py-8 text-center">Sin datos aún</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-0.5 h-28 relative">
        {last30.map((day, i) => {
          const barH = Math.max((day.count / maxVal) * 100, 2);
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center relative group cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {isHovered && (
                <div className="absolute bottom-full mb-1 z-10 flex flex-col items-center">
                  <div className="rounded-lg bg-gray-700 px-2 py-1 text-[10px] text-white whitespace-nowrap shadow-lg">
                    {day.date}: {day.count} vistas
                  </div>
                  <div className="h-1.5 w-1.5 bg-gray-700 rotate-45 -mt-0.5" />
                </div>
              )}
              <div
                className={"w-full rounded-t-sm transition-all " + (isHovered ? "bg-indigo-400" : "bg-indigo-600")}
                style={{ height: barH + "%" }}
              />
            </div>
          );
        })}
      </div>
      {/* Eje X — solo primero, mitad y último */}
      <div className="flex justify-between text-[9px] text-gray-500 px-0.5">
        <span>{last30[0]?.date}</span>
        <span>{last30[Math.floor(last30.length / 2)]?.date}</span>
        <span>{last30[last30.length - 1]?.date}</span>
      </div>
    </div>
  );
}

export default function StatsCharts({ stories, allChapters, chapterViewsMap, dailyViews, topCountries, totalViews }: Props) {
  const maxCountry = topCountries[0]?.[1] ?? 1;

  return (
    <div className="space-y-4">

      {/* Daily Performance */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Daily performance</h2>
            <p className="text-xs text-gray-500">Vistas por día — últimos 30 días</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Total período</p>
            <p className="text-sm font-bold">{dailyViews.slice(-30).reduce((a, b) => a + b.count, 0).toLocaleString()}</p>
          </div>
        </div>
        <DailyPerformance dailyViews={dailyViews} />
      </div>

      {/* Tráfico por país mejorado */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Tráfico por país</h2>
          <p className="text-xs text-gray-500">Origen de tus lectores</p>
        </div>
        {topCountries.length > 0 ? (
          <div className="space-y-3">
            {topCountries.map(([country, count]) => {
              const pct = Math.round((count / totalViews) * 100);
              return (
                <div key={country} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-medium">{country}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{count.toLocaleString()} vistas</span>
                      <span className="text-gray-400 font-semibold w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-indigo-400 transition-all"
                      style={{ width: (count / maxCountry) * 100 + "%" }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-[10px] text-gray-600 pt-1">
              * El país se detecta automáticamente por IP al momento de la visita.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center">Sin datos de país aún</p>
        )}
      </div>

      {/* Retención por capítulo — barras verticales con scroll */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 space-y-6">
        <div>
          <h2 className="text-sm font-semibold">Tasa de retención por capítulo</h2>
          <p className="text-xs text-gray-500">% de lectores que continúan leyendo respecto al capítulo 1. Pasa el cursor sobre una barra para ver el detalle.</p>
        </div>
        {stories.map((story) => {
          const storyChapters = allChapters.filter((c) => c.story_id === story.id);
          if (!storyChapters.length) return null;
          return (
            <RetentionChart
              key={story.id}
              story={story}
              chapters={storyChapters}
              chapterViewsMap={chapterViewsMap}
            />
          );
        })}
      </div>

    </div>
  );
}