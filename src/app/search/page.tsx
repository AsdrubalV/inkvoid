import React from "react";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { StoryCard } from "@/components/StoryCard";

interface Props {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() ?? "";
  const supabase = createServerSupabase();

  if (!q) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center space-y-3">
        <p className="text-4xl">🔍</p>
        <p className="text-gray-500 text-sm">Escribe algo para buscar historias o autores.</p>
      </div>
    );
  }

  const [{ data: stories }, { data: profiles }] = await Promise.all([
    supabase
      .from("stories")
      .select("id, title, description, cover_url, category, tags, author_id")
      .ilike("title", "%" + q + "%")
      .limit(20),
    supabase
      .from("profiles")
      .select("id, username, bio, avatar_url")
      .ilike("username", "%" + q + "%")
      .limit(10),
  ]);

  const authorIds = (stories ?? []).map((s) => s.author_id);
  const { data: authorProfiles } = authorIds.length
    ? await supabase.from("profiles").select("id, username").in("id", authorIds)
    : { data: [] };

  const profileMap: Record<string, string> = {};
  (authorProfiles ?? []).forEach((p) => { profileMap[p.id] = p.username; });

  const totalResults = (stories?.length ?? 0) + (profiles?.length ?? 0);

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Resultados para <span className="text-gray-500">"{q}"</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">{totalResults} resultado{totalResults !== 1 ? "s" : ""} encontrado{totalResults !== 1 ? "s" : ""}</p>
      </div>

      {/* Historias */}
      {stories && stories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">📖 Historias</h2>
          {stories.map((s) => (
            <StoryCard
              key={s.id}
              id={s.id}
              title={s.title}
              description={s.description}
              coverUrl={s.cover_url}
              category={s.category}
              tags={Array.isArray(s.tags) ? s.tags : []}
              authorUsername={profileMap[s.author_id] ?? null}
            />
          ))}
        </div>
      )}

      {/* Autores */}
      {profiles && profiles.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">👤 Autores</h2>
          <div className="space-y-2">
            {profiles.map((p) => (
              <Link
                key={p.id}
                href={"/user/" + p.username}
                className="flex items-center gap-4 rounded-xl border border-border bg-white/70 p-4 hover:bg-gray-50 transition"
              >
                <div className="h-12 w-12 overflow-hidden rounded-full border border-border bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.username} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl text-gray-400">👤</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">@{p.username}</p>
                  {p.bio && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.bio}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {totalResults === 0 && (
        <div className="py-20 text-center space-y-3">
          <p className="text-4xl">😔</p>
          <p className="text-gray-500 text-sm">No encontramos resultados para <strong>"{q}"</strong>.</p>
          <Link href="/" className="inline-block text-xs text-gray-400 hover:text-black transition">← Volver al inicio</Link>
        </div>
      )}
    </div>
  );
}