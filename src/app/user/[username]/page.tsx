import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { StoryCard } from "@/components/StoryCard";
import Image from "next/image";

interface Props {
  params: {
    username: string;
  };
}

export default async function UserProfile({ params }: Props) {

  const supabase = createServerSupabase();
  const username = params.username;

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      bio,
      avatar_url,
      banner_url,
      amazon_url,
      patreon_url,
      tiktok_url,
      website_url
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
        </div>

      </div>

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
  );
}