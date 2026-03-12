import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabaseClient";
import { StoryCard } from "@/components/StoryCard";

interface ProfilePageProps {
  params: { username: string };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createServerSupabase();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, bio")
    .eq("username", params.username)
    .single();

  if (error || !profile) return notFound();

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, description, cover_url, category, tags")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-white/70 p-5">
        <h1 className="text-xl font-semibold">@{profile.username}</h1>
        <p className="mt-2 text-sm text-gray-700">
          {profile.bio || "This author has not written a bio yet."}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Stories</h2>
        <div className="space-y-3">
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
            <p className="text-sm text-gray-500">No stories yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

