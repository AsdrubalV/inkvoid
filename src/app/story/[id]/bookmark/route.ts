import { createServerSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const storyId = params.id;

  const { data: existing } = await supabase
    .from("story_bookmarks")
    .select("id")
    .eq("story_id", storyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("story_bookmarks").delete().eq("story_id", storyId).eq("user_id", user.id);
  } else {
    await supabase.from("story_bookmarks").insert({ story_id: storyId, user_id: user.id });
  }

  return NextResponse.redirect(new URL("/story/" + storyId, req.url));
}