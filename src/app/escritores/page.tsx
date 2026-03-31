import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recursos para Escritores — InkVoid",
  description: "Guías, consejos, concursos y recursos para escritores. Aprende a escribir mejores historias y a crecer tu audiencia en InkVoid.",
  openGraph: {
    title: "Recursos para Escritores — InkVoid",
    description: "Guías, consejos, concursos y recursos para escritores.",
    siteName: "InkVoid",
  },
};

const CATEGORIES = [
  {
    slug: "guias",
    title: "Guías para escritores",
    description: "Aprende técnicas de escritura, narrativa y cómo desarrollar tu estilo único.",
    emoji: "✍️",
    color: "bg-blue-50 border-blue-200",
  },
  {
    slug: "concursos",
    title: "Concursos de escritura",
    description: "Participa en concursos, gana reconocimiento y lleva tu escritura al siguiente nivel.",
    emoji: "🏆",
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    slug: "recursos",
    title: "Recursos y herramientas",
    description: "Herramientas, plantillas y recursos para ayudarte en tu proceso creativo.",
    emoji: "🛠️",
    color: "bg-green-50 border-green-200",
  },
  {
    slug: "noticias",
    title: "Noticias de InkVoid",
    description: "Últimas novedades, actualizaciones y anuncios de la plataforma.",
    emoji: "📢",
    color: "bg-purple-50 border-purple-200",
  },
  {
    slug: "entrevistas",
    title: "Entrevistas a autores",
    description: "Conoce las historias detrás de los escritores más destacados de InkVoid.",
    emoji: "🎙️",
    color: "bg-rose-50 border-rose-200",
  },
];

export default function EscritoresPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 py-8">

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Centro de escritores</h1>
        <p className="text-gray-500 text-lg max-w-2xl">
          Todo lo que necesitas para crecer como escritor: guías, recursos, concursos y la comunidad de InkVoid.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={"/escritores/" + cat.slug}
            className={"rounded-2xl border p-6 space-y-3 hover:shadow-sm transition " + cat.color}
          >
            <div className="text-3xl">{cat.emoji}</div>
            <div>
              <h2 className="font-semibold text-gray-900">{cat.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
            </div>
            <span className="text-xs font-medium text-gray-500">Ver artículos →</span>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl bg-gray-900 text-white p-8 space-y-4">
        <h2 className="text-xl font-bold">¿Eres escritor en InkVoid?</h2>
        <p className="text-gray-300 text-sm max-w-xl">
          Publica tus historias, conecta con lectores de todo el mundo y empieza a monetizar tu contenido cuando alcances los requisitos.
        </p>
        <div className="flex gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-white text-black px-5 py-2 text-sm font-medium hover:bg-gray-100 transition"
          >
            Crear cuenta gratis
          </Link>
          <Link
            href="/publish"
            className="rounded-full border border-white/30 px-5 py-2 text-sm font-medium hover:bg-white/10 transition"
          >
            Publicar historia
          </Link>
        </div>
      </div>

    </div>
  );
}