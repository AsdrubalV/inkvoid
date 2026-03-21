import { createServerSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { username: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", params.username)
    .maybeSingle();

  if (!targetProfile) return NextResponse.redirect(new URL("/", req.url));

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("followed_id", targetProfile.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("follows").delete().eq("follower_id", user.id).eq("followed_id", targetProfile.id);
  } else {
    await supabase.from("follows").insert({ follower_id: user.id, followed_id: targetProfile.id });
  }

  const referer = req.headers.get("referer") ?? "/";
  return NextResponse.redirect(new URL(referer, req.url));
}