"use client";
import React from "react";

const SERVICE_NAMES: Record<string, string> = {
  messages: "Mis mensajes",
  legal: "Servicios legales",
  editorial: "Servicios editoriales",
  promote: "Promocionarme",
  earnings: "Mis ganancias",
};

interface Props {
  params: { service: string };
}

export default function ServicePage({ params }: Props) {
  const name = SERVICE_NAMES[params.service] ?? "Servicio";

  return (
    <div className="mx-auto max-w-lg py-20 text-center space-y-4">
      <div className="text-5xl">🚧</div>
      <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
      <p className="text-gray-500 text-sm leading-relaxed">
        Este servicio aún no está disponible, pero estará listo en las próximas semanas.
        Apreciamos tu paciencia mientras seguimos construyendo InkVoid.
      </p>
      <p className="text-xs text-gray-400">— El equipo de InkVoid</p>
      <button
        onClick={() => window.history.back()}
        className="inline-block mt-4 rounded-full border border-border px-5 py-2 text-sm hover:bg-gray-50 transition"
      >
        ← Volver
      </button>
    </div>
  );
}