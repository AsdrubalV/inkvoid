import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import CommentsSection from "./comments";
import ReaderSettings from "@/components/ReaderSettings";

interface ChapterPageProps {
  params: { id: string };
}

async function getCountryFromIP(ip: string): Promise<string | null> {
  try {
    if (!ip || ip === "127.0.0.1" || ip === "::1") return null;
    const res = await fetch("http://ip-api.com/json/" + ip + "?fields=country", { next: { revalidate: 86400 } });
    const data = await res.json();
    return data.country ?? null;
  } catch { return null; }
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

  const { data: allChapters } = await supabase
    .from("chapters")
    .select("id, chapter_number")
    .eq("story_id", chapter.story_id)
    .order("chapter_number", { ascending: true });

  const currentIndex = allChapters?.findIndex((c) => c.id === chapter.id) ?? -1;
  const prevChapter = currentIndex > 0 ? allChapters?.[currentIndex - 1] : null;
  const nextChapter = allChapters && currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  const { data: { user } } = await supabase.auth.getUser();

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

  const headersList = headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headersList.get("x-real-ip") ?? "unknown";
  const country = await getCountryFromIP(ip);

  try {
    await supabase.from("story_views").insert({ story_id: chapter.story_id, user_id: user?.id ?? null, country });
  } catch (_) {}

  try {
    await supabase.from("chapter_views").insert({ chapter_id: chapter.id, story_id: chapter.story_id, user_id: user?.id ?? null, country });
  } catch (_) {}

  if (user && !isLocked) {
    try {
      await supabase.from("reading_progress").upsert({
        user_id: user.id,
        story_id: chapter.story_id,
        chapter_id: chapter.id,
        chapter_number: chapter.chapter_number,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,story_id" });
    } catch (_) {}
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      <header className="space-y-2 border-b border-border pb-4">
        <Link href={"/story/" + chapter.story_id} className="text-xs uppercase tracking-wide text-gray-500 hover:text-black transition">
          ← {story?.title}
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">
            {chapter.chapter_number}. {chapter.title}
          </h1>
          {chapter.is_premium && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              Premium
            </span>
          )}
        </div>
      </header>

      {isLocked ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-4">
          <h2 className="text-lg font-semibold">Capítulo exclusivo para suscriptores</h2>
          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            Este capítulo es exclusivo para miembros de InkVoid. Suscríbete para acceder a todo el contenido premium.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {user ? (
              <Link href="/subscribe" className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition">
                Suscribirme ahora
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition">
                  Iniciar sesión
                </Link>
                <Link href="/signup" className="rounded-full border border-border px-6 py-2 text-sm hover:bg-gray-50 transition">
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
          <ReaderSettings
            content={chapter.content_html}
            chapterId={chapter.id}
            currentUserId={user?.id ?? null}
          />

          <div className="flex items-center justify-between pt-2">
            {prevChapter ? (
              <Link href={"/chapter/" + prevChapter.id} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-gray-50 transition">
                ← Capítulo {prevChapter.chapter_number}
              </Link>
            ) : <div />}
            <Link href={"/story/" + chapter.story_id} className="text-xs text-gray-400 hover:text-black transition">
              Índice
            </Link>
            {nextChapter ? (
              <Link href={"/chapter/" + nextChapter.id} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-gray-50 transition">
                Capítulo {nextChapter.chapter_number} →
              </Link>
            ) : <div />}
          </div>

          {/* Banner registro para usuarios no logueados */}
          {!user && (
            <div className="rounded-2xl border border-border bg-gray-900 text-white p-6 text-center space-y-3">
              <h3 className="font-semibold text-base">¿Te está gustando la historia?</h3>
              <p className="text-sm text-gray-300 max-w-sm mx-auto">
                Crea una cuenta gratis para guardar tu progreso, dar like y seguir a tus autores favoritos.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
                <Link
                  href="/signup"
                  className="rounded-full bg-white text-black px-6 py-2 text-sm font-medium hover:bg-gray-100 transition"
                >
                  Crear cuenta gratis
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-white/30 px-6 py-2 text-sm text-white hover:bg-white/10 transition"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
          )}

          <CommentsSection chapterId={chapter.id} currentUserId={user?.id ?? null} />
        </>
      )}
    </div>
  );
}