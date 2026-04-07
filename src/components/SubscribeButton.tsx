"use client";

interface Props {
  mode: "checkout" | "portal";
}

export default function SubscribeButton({ mode }: Props) {
  if (mode === "portal") {
    return (
      <button
        disabled
        className="rounded-full border border-border px-5 py-2 text-sm text-gray-400 cursor-not-allowed"
      >
        Gestionar suscripcion
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <button
        disabled
        className="w-full sm:w-auto rounded-full bg-gray-200 px-8 py-3 text-sm font-semibold text-gray-400 cursor-not-allowed"
      >
        Suscribirme ahora
      </button>
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        Los pagos estaran disponibles en las proximas horas. Vuelve pronto.
      </p>
    </div>
  );
}