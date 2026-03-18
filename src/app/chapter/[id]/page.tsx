import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import CommentsSection from "./comments";

interface ChapterPageProps {
  params: { id: string };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const supabase = createServerSupabase();

  const { data: chapter, error } = await supabase
    .from("chapters")
    .select("id, title, content_html, chapter_number, story_id, is_premium")
    .eq("id", params.id)
    .single();

  if (error || !chapter) return notFound();

  const { data: story } = await supabase
    .from("stories")
    .select("id, title")
    .eq("id", chapter.story_id)
    .maybeSingle();

  const { data: { user } } = await supabase.auth.getUser();

  // Verificar suscripción activa
  let hasSubscription = false;
  if (user && chapter.is_premium) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    hasSubscription = !!sub;
  }

  const isLocked = chapter.is_premium && !hasSubscription;

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
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">
            {chapter.chapter_number}. {chapter.title}
          </h1>
          {chapter.is_premium && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              👑 Premium
            </span>
          )}
        </div>
      </header>

      {isLocked ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-4">
          <div className="text-4xl">👑</div>
          <h2 className="text-lg font-semibold">Capítulo exclusivo para suscriptores</h2>
          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            Este capítulo es exclusivo para miembros de InkVoid. Suscríbete para acceder a todo el contenido premium de la plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {user ? (
              <Link
                href="/subscribe"
                className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
              >
                Suscribirme ahora
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full border border-border px-6 py-2 text-sm hover:bg-gray-50 transition"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
          <Link href={"/story/" + chapter.story_id} className="block text-xs text-gray-400 hover:text-black transition">
            ← Volver a la historia
          </Link>
        </div>
      ) : (
        <>
          <article
            className="prose prose-sm max-w-none rounded-xl border border-border bg-white/70 px-5 py-4"
            dangerouslySetInnerHTML={{ __html: chapter.content_html }}
          />
          <CommentsSection chapterId={chapter.id} currentUserId={user?.id ?? null} />
        </>
      )}
    </div>
  );
}