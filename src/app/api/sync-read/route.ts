import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { chapter_id, story_id, user_id, country, read_at } = await req.json();
    const supabase = createServerSupabase();

    await supabase.from("chapter_views").insert({
      chapter_id,
      story_id,
      user_id: user_id ?? null,
      country: country ?? null,
      viewed_at: read_at ?? new Date().toISOString(),
    });

    await supabase.from("story_views").insert({
      story_id,
      user_id: user_id ?? null,
      viewed_at: read_at ?? new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}