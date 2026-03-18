import React from "react";
import Link from "next/link";

const INFO_PAGES: Record<string, { title: string; emoji: string; content: string }> = {
  faq: {
    title: "Preguntas frecuentes",
    emoji: "❓",
    content: "Estamos preparando una lista completa de preguntas frecuentes para ayudarte a sacar el máximo provecho de InkVoid.",
  },
  "publishing-rules": {
    title: "Reglas de publicación",
    emoji: "📖",
    content: "Las reglas de publicación de InkVoid están siendo redactadas para garantizar una comunidad segura y creativa para todos los autores y lectores.",
  },
  "monetization-rules": {
    title: "Reglas de monetización",
    emoji: "💰",
    content: "Estamos definiendo las políticas de monetización para que los autores puedan generar ingresos de forma justa y transparente.",
  },
};

interface Props {
  params: { page: string };
}

export default function InfoPage({ params }: Props) {
  const info = INFO_PAGES[params.page];
  const title = info?.title ?? "Información";
  const emoji = info?.emoji ?? "📄";
  const content = info?.content ?? "Esta página estará disponible próximamente.";

  return (
    <div className="mx-auto max-w-lg py-20 text-center space-y-4">
      <div className="text-5xl">{emoji}</div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-gray-500 text-sm">{content}</p>
      <p className="text-gray-400 text-xs">Estamos trabajando en esto. Vuelve pronto.</p>
      <Link
        href="/"
        className="inline-block mt-4 rounded-full border border-border px-5 py-2 text-sm hover:bg-gray-50 transition"
      >
        ← Volver al inicio
      </Link>
    </div>
  );
}