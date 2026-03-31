import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createServerSupabase } from "@/lib/supabase/server";

const CATEGORIES: Record<string, { title: string; description: string; emoji: string }> = {
  guias:       { title: "Guías para escritores",    description: "Aprende técnicas de escritura, narrativa y cómo desarrollar tu estilo único.", emoji: "✍️" },
  concursos:   { title: "Concursos de escritura",   description: "Participa en concursos, gana reconocimiento y lleva tu escritura al siguiente nivel.", emoji: "🏆" },
  recursos:    { title: "Recursos y herramientas",  description: "Herramientas, plantillas y recursos para ayudarte en tu proceso creativo.", emoji: "🛠️" },
  noticias:    { title: "Noticias de InkVoid",      description: "Últimas novedades, actualizaciones y anuncios de la plataforma.", emoji: "📢" },
  entrevistas: { title: "Entrevistas a autores",    description: "Conoce las historias detrás de los escritores más destacados de InkVoid.", emoji: "🎙️" },
};

interface Props { params: { categoria: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = CATEGORIES[params.categoria];
  if (!cat) return { title: "No encontrado — InkVoid" };
  return {
    title: cat.title + " — InkVoid",
    description: cat.description,
    openGraph: { title: cat.title + " — InkVoid", description: cat.description, siteName: "InkVoid" },
  };
}

export default async function CategoriaPage({ params }: Props) {
  const cat = CATEGORIES[params.categoria];
  if (!cat) return notFound();

  const supabase = createServerSupabase();
  const { data: articles } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, cover_url, created_at")
    .eq("categoria", params.categoria)
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <div className="space-y-2">
        <Link href="/escritores" className="text-sm text-gray-400 hover:text-black transition">
          ← Centro de escritores
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{cat.emoji}</span>
          <h1 className="text-2xl font-bold tracking-tight">{cat.title}</h1>
        </div>
        <p className="text-gray-500">{cat.description}</p>
      </div>

      {articles?.length ? (
        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={"/escritores/" + params.categoria + "/" + article.slug}
              className="block rounded-2xl border border-border bg-white/70 hover:shadow-sm hover:border-gray-300 transition overflow-hidden"
            >
              {article.cover_url && (
                <img src={article.cover_url} alt={article.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-5 space-y-2">
                <p className="text-[11px] text-gray-400">
                  {new Date(article.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <h2 className="font-semibold text-gray-900 leading-snug">{article.title}</h2>
                {article.excerpt && <p className="text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>}
                <span className="text-xs font-medium text-black">Leer artículo →</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white/70 py-16 text-center space-y-3">
          <p className="text-4xl">📝</p>
          <p className="text-gray-500 text-sm">Próximamente habrá artículos en esta sección.</p>
          <Link href="/escritores" className="inline-block text-xs text-black underline">Ver otras categorías</Link>
        </div>
      )}
    </div>
  );
}