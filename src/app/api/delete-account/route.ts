import { createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    // Borrar datos del usuario en orden correcto
    await supabase.from("notifications").delete().eq("user_id", user.id);
    await supabase.from("direct_messages").delete().eq("sender_id", user.id);
    await supabase.from("direct_messages").delete().eq("receiver_id", user.id);
    await supabase.from("profile_messages").delete().eq("user_id", user.id);
    await supabase.from("story_likes").delete().eq("user_id", user.id);
    await supabase.from("story_bookmarks").delete().eq("user_id", user.id);
    await supabase.from("story_views").delete().eq("user_id", user.id);
    await supabase.from("chapter_views").delete().eq("user_id", user.id);
    await supabase.from("reading_progress").delete().eq("user_id", user.id);
    await supabase.from("paragraph_reactions").delete().eq("user_id", user.id);
    await supabase.from("follows").delete().eq("follower_id", user.id);
    await supabase.from("follows").delete().eq("author_id", user.id);

    // Borrar capítulos y historias
    const { data: stories } = await supabase
      .from("stories")
      .select("id")
      .eq("author_id", user.id);

    if (stories?.length) {
      const storyIds = stories.map((s) => s.id);
      await supabase.from("chapters").delete().in("story_id", storyIds);
      await supabase.from("story_views").delete().in("story_id", storyIds);
      await supabase.from("story_likes").delete().in("story_id", storyIds);
      await supabase.from("story_bookmarks").delete().in("story_id", storyIds);
      await supabase.from("stories").delete().in("id", storyIds);
    }

    // Borrar perfil
    await supabase.from("profiles").delete().eq("id", user.id);

    // Cerrar sesión
    await supabase.auth.signOut();

    // Borrar usuario de auth (requiere service role key)
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await adminClient.auth.admin.deleteUser(user.id);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}