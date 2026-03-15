import { createServerSupabase } from "@/lib/supabase/server";
import { StoryCard } from "@/components/StoryCard";
import Image from "next/image";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = createServerSupabase();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return <div style={{ padding: 40 }}>User not logged in</div>;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      email,
      bio,
      avatar_url,
      banner_url,
      amazon_url,
      patreon_url,
      tiktok_url,
      website_url
    `)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return <div style={{ padding: 40 }}>Database error: {error.message}</div>;
  }

  if (!profile) {
    return <div style={{ padding: 40 }}>Profile not found in database</div>;
  }

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, description, cover_url, category, tags")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">

      <div className="relative h-56 w-full overflow-hidden rounded-xl bg-gray-200">
        <Image
          src={profile.banner_url || "/imagen1.jpg"}
          alt="banner"
          fill
          className="object-cover"
        />
      </div>

      <div className="flex items-center gap-6">

        <div className="relative h-24 w-24 overflow-hidden rounded-full border">
          <Image
            src={profile.avatar_url || "/default-avatar.png"}
            alt="avatar"
            fill
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="text-2xl font-semibold">@{profile.username}</h1>

          <p className="text-gray-600 text-sm">
            {profile.bio || "This author has not written a bio yet."}
          </p>

          <Link
            href="/settings"
            className="inline-block mt-2 rounded-md border px-3 py-1 text-sm hover:bg-gray-100"
          >
            Edit profile
          </Link>
        </div>

      </div>

      <div className="grid grid-cols-3 gap-8">

        <div className="space-y-4">

          <h3 className="text-sm font-semibold">Author Links</h3>

          {profile.amazon_url && (
            <a href={profile.amazon_url} target="_blank" className="block rounded-lg border p-3 hover:bg-gray-50">
              Amazon
            </a>
          )}

          {profile.patreon_url && (
            <a href={profile.patreon_url} target="_blank" className="block rounded-lg border p-3 hover:bg-gray-50">
              Patreon
            </a>
          )}

          {profile.tiktok_url && (
            <a href={profile.tiktok_url} target="_blank" className="block rounded-lg border p-3 hover:bg-gray-50">
              TikTok
            </a>
          )}

          {profile.website_url && (
            <a href={profile.website_url} target="_blank" className="block rounded-lg border p-3 hover:bg-gray-50">
              Website
            </a>
          )}

        </div>

        <div className="col-span-2 space-y-4">

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
                tags={s.tags}
                authorUsername={profile.username}
              />
            ))
          ) : (
            <p className="text-gray-500 text-sm">
              This author has not published stories yet.
            </p>
          )}

        </div>

      </div>

    </div>
  );
}