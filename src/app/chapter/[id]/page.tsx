import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import CommentsSection from "./comments";

interface ChapterPageProps {
  params: { id: string };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const supabase = createServerSupabase();

  const { data: chapter, error } = await supabase
    .from("chapters")
    .select(`
      id,
      title,
      content_html,
      chapter_number,
      story_id
    `)
    .eq("id", params.id)
    .single();

  if (error || !chapter) return notFound();

  const { data: story } = await supabase
    .from("stories")
    .select("id, title")
    .eq("id", chapter.story_id)
    .maybeSingle();

  const { data: { user } } = await supabase.auth.getUser();

  try {
    await supabase.from("story_views").insert({
      story_id: chapter.story_id,
      user_id: user?.id ?? null,
    });
  } catch (_) {}

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2 border-b border-border pb-4">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          {story?.title}
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          {chapter.chapter_number}. {chapter.title}
        </h1>
      </header>
      <article
        className="prose prose-sm max-w-none rounded-xl border border-border bg-white/70 px-5 py-4"
        dangerouslySetInnerHTML={{ __html: chapter.content_html }}
      />
      <CommentsSection chapterId={chapter.id} currentUserId={user?.id ?? null} />
    </div>
  );
}