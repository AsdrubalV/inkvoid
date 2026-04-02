import { createServerSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { chapterId, storyId, authorId } = await req.json();

  if (!chapterId || !storyId || !authorId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const { error } = await supabase
    .from("paid_reads")
    .insert({ chapter_id: chapterId, story_id: storyId, user_id: user.id, author_id: authorId });

  if (error && !error.message.includes("duplicate") && !error.code?.includes("23505")) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}