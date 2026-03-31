"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountButton() {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "loading">("idle");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  async function handleDelete() {
    if (confirmation !== "ELIMINAR") {
      setError("Escribe ELIMINAR para confirmar.");
      return;
    }
    setStep("loading");
    setError("");

    try {
      const res = await fetch("/api/delete-account", { method: "POST" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Error al eliminar cuenta.");
      setStep("confirm");
    }
  }

  if (step === "idle") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-red-700">Zona de peligro</h3>
          <p className="text-xs text-red-600 mt-0.5">
            Eliminar tu cuenta borrará permanentemente todos tus datos, historias y capítulos. Esta acción no se puede deshacer.
          </p>
        </div>
        <button
          onClick={() => setStep("confirm")}
          className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
        >
          Eliminar mi cuenta
        </button>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-red-700">¿Estás seguro?</h3>
          <p className="text-xs text-red-600 mt-0.5">
            Esta acción eliminará permanentemente tu cuenta, todas tus historias, capítulos y datos. No hay vuelta atrás.
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-red-700">
            Escribe <strong>ELIMINAR</strong> para confirmar:
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-400"
            placeholder="ELIMINAR"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition"
          >
            Confirmar eliminación
          </button>
          <button
            onClick={() => { setStep("idle"); setConfirmation(""); setError(""); }}
            className="rounded-full border border-border px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
      <p className="text-sm text-red-600">Eliminando cuenta...</p>
    </div>
  );
}