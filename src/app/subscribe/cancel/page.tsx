import Link from "next/link";

export default function SubscribeCancelPage() {
  return (
    <div className="mx-auto max-w-md py-20 text-center space-y-6">
      <div className="text-5xl">😔</div>
      <h1 className="text-2xl font-bold tracking-tight">Suscripcion cancelada</h1>
      <p className="text-gray-500 text-sm">
        No se ha realizado ningun cargo. Puedes suscribirte cuando quieras.
      </p>
      <Link href="/subscribe" className="inline-block rounded-full bg-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition">
        Volver a intentarlo
      </Link>
    </div>
  );
}