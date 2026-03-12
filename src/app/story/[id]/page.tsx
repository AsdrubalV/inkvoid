import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabaseClient";

interface StoryPageProps {
  params: { id: string };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const supabase = createServerSupabase(cookies);

  const { data: story, error } = await supabase
    .from("stories")
    .select(
      `
      id,
      title,
      description,
      cover_url,
      category,
      tags,
      author_id,
      profiles!stories_author_id_fkey (
        username,
        bio
      ),
      likes:story_likes(count),
      bookmarks:story_bookmarks(count)
    `
    )
    .eq("id", params.id)
    .single();

  if (error || !story) return notFound();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, title, chapter_number, created_at")
    .eq("story_id", story.id)
    .order("chapter_number", { ascending: true });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: follow } =
    user &&
    (await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("followed_id", story.author_id)
      .maybeSingle());

  const { data: like } =
    user &&
    (await supabase
      .from("story_likes")
      .select("id")
      .eq("story_id", story.id)
      .eq("user_id", user.id)
      .maybeSingle());

  const { data: bookmark } =
    user &&
    (await supabase
      .from("story_bookmarks")
      .select("id")
      .eq("story_id", story.id)
      .eq("user_id", user.id)
      .maybeSingle());

  const likesCount = (story as any).likes?.[0]?.count ?? 0;
  const bookmarksCount = (story as any).bookmarks?.[0]?.count ?? 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[2.2fr,1.1fr]">
      <section className="space-y-4">
        <div className="flex gap-5">
          {story.cover_url && (
            <div className="h-44 w-32 flex-shrink-0 overflow-hidden rounded-md border border-border bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.cover_url}
                alt={story.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">{story.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <Link
                href={`/profile/${story.profiles?.username}`}
                className="rounded-full border border-border px-2 py-0.5 hover:bg-gray-50"
              >
                @{story.profiles?.username}
              </Link>
              {story.category && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px]">
                  {story.category}
                </span>
              )}
            </div>
            {story.description && (
              <p className="mt-2 max-w-xl text-sm text-gray-700">{story.description}</p>
            )}
            {story.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {story.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2 py-0.5 text-[11px] text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex gap-3 text-xs">
          <form action={`/story/${story.id}/like`} method="post">
            <button
              type="submit"
              className={`rounded-full border border-border px-3 py-1 ${
                like ? "bg-gray-900 text-white" : "hover:bg-gray-100"
              }`}
            >
              {likesCount} Like
            </button>
          </form>
          <form action={`/story/${story.id}/bookmark`} method="post">
            <button
              type="submit"
              className={`rounded-full border border-border px-3 py-1 ${
                bookmark ? "bg-gray-900 text-white" : "hover:bg-gray-100"
              }`}
            >
              {bookmarksCount} Bookmark
            </button>
          </form>
          <form action={`/profile/${story.profiles?.username}/follow`} method="post">
            <button
              type="submit"
              className={`rounded-full border border-border px-3 py-1 ${
                follow ? "bg-gray-900 text-white" : "hover:bg-gray-100"
              }`}
            >
              {follow ? "Following" : "Follow author"}
            </button>
          </form>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-white/70 p-4">
          <h2 className="mb-3 text-sm font-semibold">Chapters</h2>
          <div className="divide-y divide-border">
            {chapters?.length ? (
              chapters.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/chapter/${ch.id}`}
                  className="flex items-center justify-between py-2 text-sm hover:bg-gray-50"
                >
                  <span>
                    {ch.chapter_number}. {ch.title}
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-3 text-sm text-gray-500">No chapters yet.</p>
            )}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-xl border border-border bg-white/70 p-4 text-sm">
          <h2 className="mb-2 text-sm font-semibold">About the author</h2>
          <p className="text-xs text-gray-700">
            {story.profiles?.bio || "This author has not written a bio yet."}
          </p>
        </div>
      </aside>
    </div>
  );
}

