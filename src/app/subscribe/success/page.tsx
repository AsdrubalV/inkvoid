import Link from "next/link";

export default function SubscribeSuccessPage() {
  return (
    <div className="mx-auto max-w-md py-20 text-center space-y-6">
      <div className="text-5xl">🎉</div>
      <h1 className="text-2xl font-bold tracking-tight">Bienvenido a Premium</h1>
      <p className="text-gray-500 text-sm">
        Tu suscripcion se ha activado correctamente. Ya tienes acceso a todo el contenido exclusivo de InkVoid.
      </p>
      <Link href="/" className="inline-block rounded-full bg-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition">
        Explorar contenido premium
      </Link>
    </div>
  );
}