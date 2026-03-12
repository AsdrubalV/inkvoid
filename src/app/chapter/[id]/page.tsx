import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabaseClient";
import CommentsSection from "./comments";

interface ChapterPageProps {
  params: { id: string };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const supabase = createServerSupabase(cookies());

  const { data: chapter, error } = await supabase
    .from("chapters")
    .select(
      `
      id,
      title,
      content_html,
      chapter_number,
      story:stories (
        id,
        title
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (error || !chapter) return notFound();

  await supabase.from("story_views").insert({
    story_id: chapter.story.id
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2 border-b border-border pb-4">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          {chapter.story.title}
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

