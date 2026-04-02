import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";
import ExtrasManager from "@/components/ExtrasManager";

export default async function ExtrasManagePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: story } = await supabase
    .from("stories")
    .select("id, title, author_id")
    .eq("id", params.id)
    .single();

  if (!story) return notFound();
  if (story.author_id !== user.id) redirect("/story/" + params.id);

  const { data: extras } = await supabase
    .from("story_extras")
    .select("*")
    .eq("story_id", params.id)
    .order("order_index", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <div className="space-y-1">
        <Link href={"/story/" + story.id} className="text-sm text-gray-400 hover:text-black transition">
          ← {story.title}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Gestionar contenido extra</h1>
        <p className="text-sm text-gray-500">Añade mapas, arte, lore y videos exclusivos para suscriptores premium.</p>
      </div>
      <ExtrasManager storyId={story.id} authorId={user.id} initialExtras={extras ?? []} />
    </div>
  );
}