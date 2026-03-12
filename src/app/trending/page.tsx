import Link from "next/link";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function TrendingPage() {
  const supabase = createServerSupabase(cookies);

  const { data: stories } = await supabase
    .from("trending_stories")
    .select("*")
    .limit(30);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Trending</h1>
      <p className="text-sm text-gray-600">
        Ranked by views, likes, comments and recent chapter activity.
      </p>
      <div className="mt-4 space-y-2 rounded-xl border border-border bg-white/70 p-4">
        {stories?.length ? (
          stories.map((s, index) => (
            <Link
              key={s.story_id}
              href={`/story/${s.story_id}`}
              className="flex items-center gap-4 rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              <div className="w-6 text-xs font-semibold text-gray-500">{index + 1}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="truncate text-sm font-semibold">{s.title}</h2>
                  <span className="text-[11px] text-gray-500">
                    score {(s as any).score?.toFixed?.(0) ?? ""}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                  <span>{s.category}</span>
                  <span>•</span>
                  <span>{(s as any).author_username}</span>
                  <span>•</span>
                  <span>{(s as any).views} views</span>
                  <span>•</span>
                  <span>{(s as any).likes} likes</span>
                  <span>•</span>
                  <span>{(s as any).comments} comments</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-gray-500">No trending stories yet.</p>
        )}
      </div>
    </div>
  );
}

