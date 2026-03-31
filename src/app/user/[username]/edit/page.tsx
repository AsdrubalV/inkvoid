import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { StoryCard } from "@/components/StoryCard";
import EditProfileButton from "@/components/EditProfileButton";
import ManageStoriesButton from "@/components/ManageStoriesButton";
import ProfileMessages from "@/components/ProfileMessages";
import ProfileTabs from "@/components/ProfileTabs";
import Link from "next/link";
import { Suspense } from "react";

interface Props {
  params: { username: string };
  searchParams: { tab?: string };
}

const TIER_STYLES: Record<string, string> = {
  bronze:   "border-amber-300 bg-amber-50 text-amber-800",
  silver:   "border-gray-300 bg-gray-50 text-gray-600",
  gold:     "border-yellow-300 bg-yellow-50 text-yellow-800",
  platinum: "border-purple-300 bg-purple-50 text-purple-800",
};

const TIER_DOT: Record<string, string> = {
  bronze:   "bg-amber-400",
  silver:   "bg-gray-400",
  gold:     "bg-yellow-400",
  platinum: "bg-purple-400",
};

export default async function UserProfile({ params, searchParams }: Props) {
  const supabase = createServerSupabase();
  const username = params.username;
  const activeTab = searchParams.tab ?? "stories";

  const { data: profile } = await supabase
    .from("profiles")
    .select(`id, username, bio, avatar_url, banner_url, amazon_url, patreon_url, tiktok_url, website_url`)
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

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, description, cover_url, category, tags")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false });

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

  const { data: followData } = user && !isOwner
    ? await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("author_id", profile.id)
        .maybeSingle()
    : { data: null };

  const isFollowing = !!followData;

  // Badges inline
  const { data: storiesForBadges } = await supabase
    .from("stories")
    .select("id, views, likes")
    .eq("author_id", profile.id);

  const { count: totalChapters } = await supabase
    .from("chapters")
    .select("*", { count: "exact", head: true })
    .eq("author_id", profile.id);

  const totalViews = (storiesForBadges ?? []).reduce((sum, s) => sum + (s.views ?? 0), 0);
  const totalLikesForBadge = (storiesForBadges ?? []).reduce((sum, s) => sum + (s.likes ?? 0), 0);

  const badges: { label: string; tier: string }[] = [];
  if (totalViews >= 100000) badges.push({ label: "100K Lectores", tier: "platinum" });
  else if (totalViews >= 10000) badges.push({ label: "10K Lectores", tier: "gold" });
  else if (totalViews >= 1000) badges.push({ label: "1K Lectores", tier: "silver" });
  else if (totalViews >= 100) badges.push({ label: "100 Lectores", tier: "bronze" });

  if (totalLikesForBadge >= 10000) badges.push({ label: "10K Likes", tier: "platinum" });
  else if (totalLikesForBadge >= 1000) badges.push({ label: "1K Likes", tier: "gold" });
  else if (totalLikesForBadge >= 100) badges.push({ label: "100 Likes", tier: "silver" });
  else if (totalLikesForBadge >= 10) badges.push({ label: "10 Likes", tier: "bronze" });

  if ((totalChapters ?? 0) >= 100) badges.push({ label: "100 Capítulos", tier: "platinum" });
  else if ((totalChapters ?? 0) >= 50) badges.push({ label: "50 Capítulos", tier: "gold" });
  else if ((totalChapters ?? 0) >= 10) badges.push({ label: "10 Capítulos", tier: "silver" });
  else if ((totalChapters ?? 0) >= 1) badges.push({ label: "Primer capítulo", tier: "bronze" });

  if ((followersCount ?? 0) >= 1000) badges.push({ label: "1K Seguidores", tier: "platinum" });
  else if ((followersCount ?? 0) >= 100) badges.push({ label: "100 Seguidores", tier: "gold" });
  else if ((followersCount ?? 0) >= 10) badges.push({ label: "10 Seguidores", tier: "silver" });
  else if ((followersCount ?? 0) >= 1) badges.push({ label: "Primer seguidor", tier: "bronze" });

  let historial: any[] = [];
  let bookmarks: any[] = [];
  let siguiendo: any[] = [];

  if (isOwner) {
    const { data: views } = await supabase
      .from("story_views")
      .select("story_id, viewed_at")
      .eq("user_id", profile.id)
      .order("viewed_at", { ascending: false })
      .limit(60);

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
      <div className="relativ