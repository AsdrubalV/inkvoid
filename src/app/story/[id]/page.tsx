import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import OfflineButton from "@/components/OfflineButton";
import ContinueReading from "@/components/ContinueReading";
import ShareButtons from "@/components/ShareButtons";
import { Metadata } from "next";

interface StoryPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const supabase = createServerSupabase();
  const { data: story } = await supabase
    .from("stories")
    .select("title, description, cover_url, category, author_id")
    .eq("id", params.id)
    .single();

  if (!story) return { title: "Historia no encontrada — InkVoid" };

  const { data: author } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", story.author_id)
    .maybeSingle();

  const description = story.description
    ? story.description.slice(0, 160)
    : "Lee " + story.title + " en InkVoid, la plataforma de historias en español.";

  return {
    title: story.title + " — " + (author?.username ?? "InkVoid"),
    description,
    openGraph: {
      title: story.title,
      description,
      images: story.cover_url ? [{ url: story.cover_url }] : [],
      type: "book",
      siteName: "InkVoid",
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
      images: story.cover_url ? [story.cover_url] : [],
    },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const supabase = createServerSupabase();

  const { data: story, error } = await supabase
    .from("stories")
    .select("id, title, description, cover_url, category, tags, author_id")
    .eq("id", params.id)
    .single();

  if (error || !story) return notFound();

  const { data: authorProfile } = await supabase
    .from("profiles")
    .select("username, bio")
    .eq("id", story.author_id)
    .maybeSingle();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, title, chapter_number, created_at")
    .eq("story_id", story.id)
    .order("chapter_number", { ascending: true });

  const { data: { user } } = await supabase.auth.getUser();

  let hasSubscription = false;
  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    hasSubscription = !!sub;
  }

  const { count: extrasCount } = await supabase
    .from("story_extras")
    .select("*", { count: "exact", head: true })
    .eq("story_id", story.id);

  const hasExtras = (extrasCount ?? 0) > 0;
  const isAuthor = user?.id === story.author_id;

  try {
    await supabase.from("story_views").insert({
      story_id: params.id,
      user_id: user?.id ?? null,
    });
  } catch (_) {}

  const { count: likesCount } = await supabase
    .from("story_likes")
    .select("*", { count: "exact", head: true })
    .eq("story_id", params.id);

  const { count: bookmarksCount } = await supabase
    .from("story_bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("story_id", params.id);

  const { data: follow } = user
    ? await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("followed_id", story.author_id)
        .maybeSingle()
    : { data: null };

  const { data: like } = user
    ? await supabase
        .from("story_likes")
        .select("id")
        .eq("story_id", story.id)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const { data: bookmark } = user
    ? await supabase
        .from("story_bookmarks")
        .select("id")
        .eq("story_id", story.id)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const { data: progress } = user
    ? await supabase
        .from("reading_progress")
        .select("chapter_id, chapter_number, updated_at, chapters(title)")
        .eq("user_id", user.id)
        .eq("story_id", params.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="grid gap-8 lg:grid-cols-[2.2fr,1.1fr]">
      <section className="space-y-4">

        {progress && (
          <ContinueReading
            storyId={story.id}
            storyTitle={story.title}
            chapterId={progress.chapter_id}
            chapterNumber={progress.chapter_number}
            chapterTitle={(progress.chapters as any)?.title ?? ""}
            updatedAt={progress.updated_at}
          />
        )}

        <div className="flex gap-5">
          {story.cover_url && (
            <div className="h-44 w-32 flex-shrink-0 overflow-hidden rounded-md border border-border bg-gray-100">
              <img src={story.cover_url} alt={story.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">{story.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <Link href={"/user/" + authorProfile?.username} className="rounded-full border border-border px-2 py-0.5 hover:bg-gray-50">
                @{authorProfile?.username}
              </Link>
              {story.category && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px]">{story.category}</span>
              )}
            </div>
            {story.description && (
              <p className="mt-2 max-w-xl text-sm text-gray-700">{story.description}</p>
            )}
            {(Array.isArray(story.tags) && story.tags.length) ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {(story.tags as string[]).map((tag) => (
                  <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <form action={"/story/" + story.id + "/like"} method="post">
            <button type="submit" className={"rounded-full border border-border px-3 py-1 " + (like ? "bg-gray-900 text-white" : "hover:bg-gray-100")}>
              {likesCount ?? 0} Like
            </button>
          </form>
          <form action={"/story/" + story.id + "/bookmark"} method="post">
            <button type="submit" className={"rounded-full border border-border px-3 py-1 " + (bookmark ? "bg-gray-900 text-white" : "hover:bg-gray-100")}>
              {bookmarksCount ?? 0} Bookmark
            </button>
          </form>
          <form action={"/profile/" + authorProfile?.username + "/follow"} method="post">
            <button type="submit" className={"rounded-full border border-border px-3 py-1 " + (follow ? "bg-gray-900 text-white" : "hover:bg-gray-100")}>
              {follow ? "Following" : "Follow author"}
            </button>
          </form>
          <OfflineButton storyId={story.id} storyTitle={story.title} />

          {(hasExtras || isAuthor) && (
            <Link
              href={"/story/" + story.id + "/extras"}
              className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-amber-700 hover:bg-amber-100 transition font-medium"
            >
              Contenido extra {hasSubscription || isAuthor ? "" : "· Premium"}
            </Link>
          )}

          {isAuthor && (
            <Link
              href={"/story/" + story.id + "/extras/manage"}
              className="rounded-full border border-border px-3 py-1 text-gray-500 hover:bg-gray-50 transition"
            >
              Gestionar extras
            </Link>
          )}
        </div>

        {/* Botones de compartir */}
        <ShareButtons title={story.title} storyId={story.id} />

        <div className="mt-4 rounded-xl border border-border bg-white/70 p-4">
          <h2 className="mb-3 text-sm font-semibold">Chapters</h2>
          <div className="divide-y divide-border">
            {chapters?.length ? (
              chapters.map((ch) => (
                <Link
                  key={ch.id}
                  href={"/chapter/" + ch.id}
                  className={"flex items-center justify-between py-2 text-sm hover:bg-gray-50 " + (progress?.chapter_number === ch.chapter_number ? "font-semibold text-green-700" : "")}
                >
                  <span>{ch.chapter_number}. {ch.title}</span>
                  {progress?.chapter_number === ch.chapter_number && (
                    <span className="text-[10px] text-green-600 bg-green-50 rounded-full px-2 py-0.5">
                      Aqui dejaste
                    </span>
                  )}
                </Link>
              ))
            ) : (
              <p className="py-3 text-sm text-gray-500">No hay capitulos aun.</p>
            )}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-xl border border-border bg-white/70 p-4 text-sm">
          <h2 className="mb-2 text-sm font-semibold">Sobre el autor</h2>
          <p className="text-xs text-gray-700">
            {authorProfile?.bio || "Este autor aun no ha escrito una biografia."}
          </p>
        </div>

        {(hasExtras || isAuthor) && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
            <p className="text-xs font-semibold text-amber-800">Contenido exclusivo</p>
            <p className="text-xs text-amber-700">
              Este autor ha publicado mapas, arte y lore exclusivo para suscriptores premium.
            </p>
            <Link
              href={"/story/" + story.id + "/extras"}
              className="block text-center rounded-full bg-amber-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition"
            >
              Ver contenido extra
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}