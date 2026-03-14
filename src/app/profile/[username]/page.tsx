import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { StoryCard } from "@/components/StoryCard";
import Image from "next/image";
import Link from "next/link";

interface ProfilePageProps {
  params: { username: string };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createServerSupabase();

  // Buscar perfil por ID en lugar de username
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, bio, avatar_url")
    .eq("id", params.username)
    .single();

  if (!profile) return notFound();

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, description, cover_url, category, tags")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">

      {/* HERO */}
      <div className="relative h-56 w-full overflow-hidden rounded-xl bg-gray-200">
        <Image
          src="/imagen1.jpg"
          alt="banner"
          fill
          className="object-cover"
        />
      </div>

      {/* HEADER PERFIL */}
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

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-3 gap-8">

        {/* LINKS AUTOR */}
        <div className="space-y-4">

          <h3 className="text-sm font-semibold">Author Links</h3>

          <a
            href="#"
            className="block rounded-lg border p-3 hover:bg-gray-50"
          >
            Amazon
          </a>

          <a
            href="#"
            className="block rounded-lg border p-3 hover:bg-gray-50"
          >
            Patreon
          </a>

          <a
            href="#"
            className="block rounded-lg border p-3 hover:bg-gray-50"
          >
            TikTok
          </a>

        </div>

        {/* HISTORIAS */}
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

      {/* MENSAJES */}
      <div className="space-y-3">

        <h2 className="text-lg font-semibold">Community Messages</h2>

        <div className="rounded-lg border p-4 text-sm text-gray-600">
          This section will contain messages from the author to the community.
        </div>

      </div>

    </div>
  );
}
