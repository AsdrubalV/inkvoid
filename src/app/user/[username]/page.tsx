import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { StoryCard } from "@/components/StoryCard";
import EditProfileButton from "@/components/EditProfileButton";
import ManageStoriesButton from "@/components/ManageStoriesButton";

interface Props {
  params: { username: string };
}

export default async function UserProfile({ params }: Props) {
  const supabase = createServerSupabase();
  const username = params.username;

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      id, username, bio, avatar_url, banner_url,
      amazon_url, patreon_url, tiktok_url, website_url
    `)
    .eq("username", username)
    .single();

  if (!profile) return notFound();

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, description, cover_url, category, tags")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false });

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
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 overflow-hidden rounded-full border border-border bg-gray-100 flex-shrink-0 flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl text-gray-400">👤</span>
              )}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">@{profile.username}</h1>
              <p className="text-gray-600 text-sm">
                {profile.bio || "This author has not written a bio yet."}
              </p>
              <div className="flex flex-wrap gap-3 pt-1 text-xs text-gray-500">
                {profile.patreon_url && (
                  <a href={profile.patreon_url} target="_blank" rel="noopener noreferrer" className="hover:text-black">Patreon</a>
                )}
                {profile.amazon_url && (
                  <a href={profile.amazon_url} target="_blank" rel="noopener noreferrer" className="hover:text-black">Amazon</a>
                )}
                {profile.tiktok_url && (
                  <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer" className="hover:text-black">TikTok</a>
                )}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-black">Website</a>
                )}
              </div>
            </div>
          </div>

          {/* Historias */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Stories</h2>
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
              <p className="text-gray-500 text-sm">This author has not published stories yet.</p>
            )}
          </div>
        </div>

        {/* Columna derecha — solo visible para el dueño */}
        <aside className="space-y-4">
          <ManageStoriesButton profileUsername={username} />
        </aside>

      </div>
    </div>
  );
}