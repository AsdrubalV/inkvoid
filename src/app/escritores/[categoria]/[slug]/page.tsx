import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createServerSupabase } from "@/lib/supabase/server";

interface Props { params: { categoria: string; slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("articles")
    .select("title, excerpt, cover_url")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();
  if (!data) return { title: "Artículo no encontrado — InkVoid" };
  return {
    title: data.title + " — InkVoid",
    description: data.excerpt ?? "",
    openGraph: {
      title: data.title,
      description: data.excerpt ?? "",
      images: data.cover_url ? [{ url: data.cover_url }] : [],
      type: "article",
      siteName: "InkVoid",
    },
  };
}

function renderContent(content: string) {
  return content.trim().split("\n").filter(Boolean).map((line, i) => {
    if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold mt-5 mb-1">{line.replace("### ", "")}</h3>;
    if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold mt-6 mb-2">{line.replace("## ", "")}</h2>;
    if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mt-6 mb-2">{line.replace("# ", "")}</h1>;
    if (line.startsWith("- ")) return <li key={i} className="ml-5 text-gray-700 list-disc">{line.replace("- ", "")}</li>;
    if (line.startsWith("![")) {
      const match = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (match) return <img key={i} src={match[2]} alt={match[1]} className="w-full rounded-xl my-4 border border-border" />;
    }
    if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-gray-900">{line.replace(/\*\*/g, "")}</p>;
    const boldLine = line.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    return <p key={i} className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: boldLine }} />;
  });
}

export default async function ArticuloPage({ params }: Props) {
  const supabase = createServerSupabase();
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .eq("categoria", params.categoria)
    .eq("published", true)
    .single();

  if (!article) return notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="space-y-2">
        <Link href={"/escritores/" + params.categoria} className="text-sm text-gray-400 hover:text-black transition">
          ← Volver
        </Link>
        <p className="text-xs text-gray-400">
          {new Date(article.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1 className="text-2xl font-bold tracking-tight leading-tight">{article.title}</h1>
        {article.excerpt && <p className="text-gray-500 text-base">{article.excerpt}</p>}
      </div>

      {article.cover_url && (
        <img src={article.cover_url} alt={article.title} className="w-full rounded-2xl border border-border object-cover max-h-96" />
      )}

      <article className="space-y-3 rounded-xl border border-border bg-white/70 px-6 py-5">
        {renderContent(article.content ?? "")}
      </article>

      <div className="rounded-2xl bg-gray-900 text-white p-6 space-y-3">
        <h3 className="font-semibold">¿Listo para publicar tu historia?</h3>
        <p className="text-sm text-gray-300">Únete a InkVoid y comparte tu escritura con miles de lectores.</p>
        <Link href="/signup" className="inline-block rounded-full bg-white text-black px-5 py-2 text-sm font-medium hover:bg-gray-100 transition">
          Crear cuenta gratis
        </Link>
      </div>
    </div>
  );
}