import Link from "next/link";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createServerSupabase();

  const { data: recentStories } = await supabase
    .from("stories")
    .select(
      `
      id,
      title,
      description,
      cover_url,
      category,
      created_at,
      profiles!stories_author_id_fkey (
        username
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: trendingStories } = await supabase
    .from("trending_stories")
    .select("*")
    .limit(6);

  return (
    <div className="grid gap-10 lg:grid-cols-[2fr,1.1fr]">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Latest updates</h1>
        <div className="space-y-3 rounded-xl border border-border bg-white/70 p-4">
          {recentStories?.length ? (
            recentStories.map((story: any) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="flex gap-4 rounded-lg p-3 hover:bg-gray-50"
              >
                {story.cover_url && (
                  <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={story.cover_url}
                      alt={story.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-semibold leading-tight">{story.title}</h2>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">{story.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                    <span>{story.category}</span>
                    <span>•</span>
                    <span>{story.profiles?.username}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500">No stories yet. Be the first to publish.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Trending</h2>
        <div className="space-y-2 rounded-xl border border-border bg-white/70 p-4">
          {trendingStories?.length ? (
            trendingStories.map((s: any) => (
              <Link
                key={s.story_id}
                href={`/story/${s.story_id}`}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-gray-50"
              >
                <span className="truncate">{s.title}</span>
                <span className="ml-3 text-[11px] text-gray-500">
                  score {(s as any).score?.toFixed?.(0) ?? ""}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500">Trending stories will appear here.</p>
          )}
        </div>
      </section>
    </div>
  );
}