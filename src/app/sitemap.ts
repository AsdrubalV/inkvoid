import { createClient } from "@supabase/supabase-js";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: stories } = await supabase
    .from("stories")
    .select("id, updated_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("username, updated_at")
    .limit(500);

  const storyUrls = (stories ?? []).map((s) => ({
    url: "https://inkvoid.ink/story/" + s.id,
    lastModified: new Date(s.updated_at ?? Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const profileUrls = (profiles ?? []).map((p) => ({
    url: "https://inkvoid.ink/user/" + p.username,
    lastModified: new Date(p.updated_at ?? Date.now()),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: "https://inkvoid.ink",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://inkvoid.ink/trending",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...storyUrls,
    ...profileUrls,
  ];
}