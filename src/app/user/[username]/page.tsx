import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { StoryCard } from "@/components/StoryCard";
import EditProfileButton from "@/components/EditProfileButton";
import ManageStoriesButton from "@/components/ManageStoriesButton";
import ProfileMessages from "@/components/ProfileMessages";
import ProfileTabs from "@/components/ProfileTabs";
import Link from "next/link";

interface Props {
  params: { username: string };
  searchParams: { tab?: string };
}

export default async function UserProfile({ params, searchParams }: Props) {
  const supabase = createServerSupabase();
  const username = params.username;
  const activeTab = searchParams.tab ?? "stories";

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      id, username, bio, avatar_url, banner_url,
      amazon_url, patreon_url, tiktok_url, website_url
    `)
    .eq("username", username)
    .single();

  if (!profile) return notFound();

  const { data: { user } } = await supabase.auth.getUser();

  let currentUserId: string | null = null;
  let isOwner = false;

  if (user) {
    currentUserId = user.id;
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    isOwner = myProfile?.username === username;
  }

  // ── Historias publicadas ──────────────────────────────────────────────
  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, description, cover_url, category, tags")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false });

  // ── Estadísticas ──────────────────────────────────────────────────────
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("author_id", profile.id);

  const storyIds = (stories ?? []).map((s) => s.id);
  const { count: totalLikes } = storyIds.length
    ? await supabase
        .from("story_likes")
        .select("*", { count: "exact", head: true })
        .in("story_id", storyIds)
    : { count: 0 };

  // ── Follow status ─────────────────────────────────────────────────────
  const { data: followData } = user && !isOwner
    ? await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("author_id", profile.id)
        .maybeSingle()
    : { data: null };

  const isFollowing = !!followData;

  // ── Datos de tabs (solo si es el dueño) ───────────────────────────────
  let historial: any[] = [];
  let bookmarks: any[] = [];
  let siguiendo: any[] = [];

  if (isOwner) {
    // Historial — últimas 20 historias únicas vistas
    const { data: views } = await supabase
      .from("story_views")
      .select("story_id, viewed_at")
      .eq("user_id", profile.id)
      .order("viewed_at", { ascending: false })
      .limit(60);

    // Deduplicar por story_id
    const seenIds = new Set<string>();
    const uniqueViews = (views ?? []).filter((v) => {
      if (seenIds.has(v.story_id)) return false;
      seenIds.add(v.story_id);
      return true;
    }).slice(0, 20);

    if (uniqueViews.length) {
      const { data: historialStories } = await supabase
        .from("stories")
        .select("id, title, description, cover_url, category, tags, profiles!stories_author_id_fkey(username)")
        .in("id", uniqueViews.map((v) => v.story_id));
      historial = uniqueViews
        .map((v) => historialStories?.find((s) => s.id === v.story_id))
        .filter(Boolean);
    }

    // Bookmarks
    const { data: bookmarkData } = await supabase
      .from("story_bookmarks")
      .select("story_id, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (bookmarkData?.length) {
      const { data: bookmarkStories } = await supabase
        .from("stories")
        .select("id, title, description, cover_url, category, tags, profiles!stories_author_id_fkey(username)")
        .in("id", bookmarkData.map((b) => b.story_id));
      bookmarks = bookmarkData
        .map((b) => bookmarkStories?.find((s) => s.id === b.story_id))
        .filter(Boolean);
    }

    // Siguiendo
    const { data: followingData } = await supabase
      .from("follows")
      .select("author_id")
      .eq("follower_id", profile.id)
      .limit(40);

    if (followingData?.length) {
      const { data: followingProfiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio")
        .in("id", followingData.map((f) => f.author_id));
      siguiendo = followingProfiles ?? [];
    }
  }

  return (
    <div className="space-y-8">

      {/* Banner */}
      <div className="relative h-56 w-full overflow-hidden rounded-xl bg-gray-200">
        {profile.banner_url ? (
          <img src={profile.banner_url} alt="banner" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-gray-800 to-gray-600" />
        )}
        <EditProfileButton profileUsername={username} />
      </div>

      {/* Layout dos columnas */}
      <div className="grid gap-8 lg:grid-cols-[1fr,260px]">

        {/* Columna izquierda */}
        <div className="space-y-8">

          {/* Avatar + info */}
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 overflow-hidden rounded-full border border-border bg-gray-100 flex-shrink-0 flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl text-gray-400">👤</span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold">@{profile.username}</h1>
                  <p className="text-gray-600 text-sm mt-0.5">
                    {profile.bio || "This author has not written a bio yet."}
                  </p>
                </div>
                {user && !isOwner && (
                  <form action={"/profile/" + username + "/follow"} method="post">
                    <button
                      type="submit"
                      className={"rounded-full border px-4 py-1.5 text-xs font-medium transition " + (isFollowing ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-700" : "border-border text-gray-700 hover:bg-gray-100")}
                    >
                      {isFollowing ? "Siguiendo" : "Seguir"}
                    </button>
                  </form>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-5 pt-1 text-sm">
                <div className="text-center">
                  <p className="font-semibold">{(stories?.length ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Historias</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{(followersCount ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Seguidores</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{(totalLikes ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Likes</p>
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-3 pt-1 text-xs text-gray-500">
                {profile.patreon_url && <a href={profile.patreon_url} target="_blank" rel="noopener noreferrer" className="hover:text-black">Patreon</a>}
                {profile.amazon_url && <a href={profile.amazon_url} target="_blank" rel="noopener noreferrer" className="hover:text-black">Amazon</a>}
                {profile.tiktok_url && <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer" className="hover:text-black">TikTok</a>}
                {profile.website_url && <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-black">Website</a>}
              </div>
            </div>
          </div>

          {/* Tabs — solo visibles para el dueño */}
          {isOwner && (
            <ProfileTabs
              username={username}
              activeTab={activeTab}
              counts={{
                stories: stories?.length ?? 0,
                historial: historial.length,
                bookmarks: bookmarks.length,
                siguiendo: siguiendo.length,
              }}
            />
          )}

          {/* Contenido según tab */}
          {activeTab === "stories" || !isOwner ? (
            <div className="space-y-4">
              {!isOwner && <h2 className="text-lg font-semibold">Stories</h2>}
              {stories?.length ? (
                stories.map((s: any) => (
                  <StoryCard
                    key={s.id}
                    id={s.id}
                    title={s.title}
                    description={s.description}
                    coverUrl={s.cover_url}
                    category={s.category}
                    tags={Array.isArray(s.tags) ? s.tags : []}
                    authorUsername={profile.username}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-sm">No hay historias publicadas aún.</p>
              )}
            </div>
          ) : activeTab === "historial" ? (
            <div className="space-y-4">
              {historial.length ? (
                historial.map((s: any) => (
                  <StoryCard
                    key={s.id}
                    id={s.id}
                    title={s.title}
                    description={s.description}
                    coverUrl={s.cover_url}
                    category={s.category}
                    tags={Array.isArray(s.tags) ? s.tags : []}
                    authorUsername={s.profiles?.username}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-border bg-white/70 py-10 text-center space-y-2">
                  <p className="text-3xl">📖</p>
                  <p className="text-sm text-gray-500">No has leído ninguna historia aún.</p>
                  <Link href="/trending" className="inline-block text-xs text-black underline hover:no-underline">
                    Explorar historias
                  </Link>
                </div>
              )}
            </div>
          ) : activeTab === "bookmarks" ? (
            <div className="space-y-4">
              {bookmarks.length ? (
                bookmarks.map((s: any) => (
                  <StoryCard
                    key={s.id}
                    id={s.id}
                    title={s.title}
                    description={s.description}
                    coverUrl={s.cover_url}
                    category={s.category}
                    tags={Array.isArray(s.tags) ? s.tags : []}
                    authorUsername={s.profiles?.username}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-border bg-white/70 py-10 text-center space-y-2">
                  <p className="text-3xl">🔖</p>
                  <p className="text-sm text-gray-500">No tienes historias guardadas.</p>
                  <Link href="/trending" className="inline-block text-xs text-black underline hover:no-underline">
                    Explorar historias
                  </Link>
                </div>
              )}
            </div>
          ) : activeTab === "siguiendo" ? (
            <div className="space-y-3">
              {siguiendo.length ? (
                siguiendo.map((author: any) => (
                  <Link
                    key={author.id}
                    href={"/user/" + author.username}
                    className="flex items-center gap-4 rounded-xl border border-border bg-white/70 p-4 hover:bg-gray-50 transition"
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-full border border-border bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      {author.avatar_url ? (
                        <img src={author.avatar_url} alt={author.username} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xl text-gray-400">👤</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">@{author.username}</p>
                      {author.bio && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{author.bio}</p>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-border bg-white/70 py-10 text-center space-y-2">
                  <p className="text-3xl">👥</p>
                  <p className="text-sm text-gray-500">No sigues a ningún autor aún.</p>
                  <Link href="/trending" className="inline-block text-xs text-black underline hover:no-underline">
                    Descubrir autores
                  </Link>
                </div>
              )}
            </div>
          ) : null}

          {/* Tablón de mensajes */}
          <ProfileMessages
            profileId={profile.id}
            currentUserId={currentUserId}
            isOwner={isOwner}
          />
        </div>

        {/* Columna derecha */}
        <aside className="space-y-4">
          <ManageStoriesButton profileUsername={username} />
        </aside>

      </div>
    </div>
  );
}