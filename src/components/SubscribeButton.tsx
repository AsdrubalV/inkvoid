"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  mode: "checkout" | "portal";
}

export default function SubscribeButton({ mode }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/" + (mode === "checkout" ? "checkout" : "portal"), {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={
        mode === "checkout"
          ? "rounded-full bg-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition"
          : "rounded-full border border-border px-5 py-2 text-sm hover:bg-gray-50 disabled:opacity-60 transition"
      }
    >
      {loading
        ? "Cargando..."
        : mode === "checkout"
        ? "Suscribirme ahora"
        : "Gestionar suscripcion"}
    </button>
  );
}