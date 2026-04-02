import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";

const MONTHLY_FEE = 5.99;
const STRIPE_FEE_FIXED = 0.30;
const STRIPE_FEE_PCT = 0.029;
const INKVOID_COMMISSION = 0.40;
const AUTHOR_POOL_PCT = 0.60;

function netPerSubscriber() {
  const stripe = MONTHLY_FEE * STRIPE_FEE_PCT + STRIPE_FEE_FIXED;
  return MONTHLY_FEE - stripe;
}

export default async function MisGananciasPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!profile) return notFound();

  // Total suscriptores activos en la plataforma
  const { count: totalSubscribers } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Lecturas pagadas del autor este mes
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: myReadsThisMonth } = await supabase
    .from("paid_reads")
    .select("*", { count: "exact", head: true })
    .eq("author_id", user.id)
    .gte("read_at", startOfMonth.toISOString());

  // Total lecturas pagadas en la plataforma este mes
  const { count: totalReadsThisMonth } = await supabase
    .from("paid_reads")
    .select("*", { count: "exact", head: true })
    .gte("read_at", startOfMonth.toISOString());

  // Lecturas pagadas del autor mes pasado
  const startOfLastMonth = new Date();
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
  startOfLastMonth.setDate(1);
  startOfLastMonth.setHours(0, 0, 0, 0);
  const endOfLastMonth = new Date();
  endOfLastMonth.setDate(0);
  endOfLastMonth.setHours(23, 59, 59, 999);

  const { count: myReadsLastMonth } = await supabase
    .from("paid_reads")
    .select("*", { count: "exact", head: true })
    .eq("author_id", user.id)
    .gte("read_at", startOfLastMonth.toISOString())
    .lte("read_at", endOfLastMonth.toISOString());

  const { count: totalReadsLastMonth } = await supabase
    .from("paid_reads")
    .select("*", { count: "exact", head: true })
    .gte("read_at", startOfLastMonth.toISOString())
    .lte("read_at", endOfLastMonth.toISOString());

  // Historias del autor con más lecturas pagadas
  const { data: topChapters } = await supabase
    .from("paid_reads")
    .select("chapter_id, story_id, chapters(title, chapter_number), stories(title)")
    .eq("author_id", user.id)
    .gte("read_at", startOfMonth.toISOString())
    .limit(10) as any;

  // Calcular estimados
  const poolThisMonth = (totalSubscribers ?? 0) * netPerSubscriber() * AUTHOR_POOL_PCT;
  const myShareThisMonth = totalReadsThisMonth && myReadsThisMonth
    ? (myReadsThisMonth / totalReadsThisMonth) * poolThisMonth
    : 0;

  const poolLastMonth = (totalSubscribers ?? 0) * netPerSubscriber() * AUTHOR_POOL_PCT;
  const myShareLastMonth = totalReadsLastMonth && myReadsLastMonth
    ? (myReadsLastMonth / totalReadsLastMonth) * poolLastMonth
    : 0;

  const valuePerRead = totalReadsThisMonth
    ? poolThisMonth / totalReadsThisMonth
    : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <div className="space-y-1">
        <Link href={"/user/" + profile.username} className="text-sm text-gray-400 hover:text-black transition">
          ← Volver al perfil
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Mis ganancias</h1>
        <p className="text-sm text-gray-500">Estimado basado en lecturas válidas registradas en InkVoid.</p>
      </div>

      {/* Banner Stripe pendiente */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <div className="text-amber-500 text-lg mt-0.5">⏳</div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Pagos próximamente</p>
          <p className="text-xs text-amber-700 mt-0.5">
            El sistema de pagos a autores se activará en las próximas semanas. Mientras tanto puedes ver tus estadísticas y el estimado de lo que ganarás.
          </p>
        </div>
      </div>

      {/* Cards principales */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Estimado este mes</p>
          <p className="text-3xl font-bold tracking-tight">${myShareThisMonth.toFixed(2)}</p>
          <p className="text-xs text-gray-400">{(myReadsThisMonth ?? 0).toLocaleString()} lecturas válidas</p>
        </div>
        <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Mes pasado</p>
          <p className="text-3xl font-bold tracking-tight">${myShareLastMonth.toFixed(2)}</p>
          <p className="text-xs text-gray-400">{(myReadsLastMonth ?? 0).toLocaleString()} lecturas válidas</p>
        </div>
        <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Valor por lectura</p>
          <p className="text-3xl font-bold tracking-tight">${valuePerRead.toFixed(3)}</p>
          <p className="text-xs text-gray-400">Basado en {(totalSubscribers ?? 0)} suscriptores</p>
        </div>
      </div>

      {/* Cómo funciona */}
      <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-4">
        <h2 className="text-sm font-semibold">¿Cómo se calculan las ganancias?</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="text-gray-400 font-mono text-xs mt-0.5 w-5 text-right">1</span>
            <p>Cada suscriptor paga <strong>${MONTHLY_FEE}</strong>/mes. Tras fees de Stripe, quedan <strong>${netPerSubscriber().toFixed(2)}</strong> netos.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-gray-400 font-mono text-xs mt-0.5 w-5 text-right">2</span>
            <p>El <strong>{(AUTHOR_POOL_PCT * 100).toFixed(0)}%</strong> de esos ingresos va a la pool de autores. InkVoid retiene el {(INKVOID_COMMISSION * 100).toFixed(0)}% para operar la plataforma.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-gray-400 font-mono text-xs mt-0.5 w-5 text-right">3</span>
            <p>La pool se divide entre el total de lecturas válidas del mes. Una lectura válida requiere <strong>scroll completo + mínimo 2 minutos</strong> de lectura.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-gray-400 font-mono text-xs mt-0.5 w-5 text-right">4</span>
            <p>Tu parte = <strong>(tus lecturas válidas / total lecturas plataforma) × pool total</strong>.</p>
          </div>
        </div>

        {/* Ejemplo en vivo */}
        <div className="rounded-xl bg-gray-50 border border-border p-4 space-y-2 text-xs text-gray-600">
          <p className="font-semibold text-gray-800">Ejemplo con números actuales:</p>
          <p>Pool este mes: <strong>${poolThisMonth.toFixed(2)}</strong> ({totalSubscribers ?? 0} suscriptores × ${netPerSubscriber().toFixed(2)} × 60%)</p>
          <p>Total lecturas plataforma: <strong>{(totalReadsThisMonth ?? 0).toLocaleString()}</strong></p>
          <p>Tus lecturas: <strong>{(myReadsThisMonth ?? 0).toLocaleString()}</strong></p>
          <p>Tu estimado: <strong>${myShareThisMonth.toFixed(2)}</strong></p>
        </div>
      </div>

      {/* Top capítulos este mes */}
      <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-4">
        <h2 className="text-sm font-semibold">Capítulos con más lecturas válidas este mes</h2>
        {myReadsThisMonth === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-gray-500 text-sm">Aún no tienes lecturas válidas este mes.</p>
            <p className="text-xs text-gray-400">Una lectura válida requiere que el lector haga scroll completo y pase al menos 2 minutos leyendo.</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Próximamente verás aquí el detalle por capítulo.</p>
        )}
      </div>

      {/* Conectar Stripe — deshabilitado */}
      <div className="rounded-2xl border border-border bg-gray-50 p-5 space-y-3 opacity-60">
        <h2 className="text-sm font-semibold">Conectar cuenta de pagos</h2>
        <p className="text-xs text-gray-500">
          Cuando los pagos se activen, podrás conectar tu cuenta de Stripe para recibir transferencias directas. Los pagos se realizan los primeros 5 días de cada mes.
        </p>
        <button disabled className="rounded-full bg-gray-300 px-5 py-2 text-xs font-medium text-gray-500 cursor-not-allowed">
          Próximamente
        </button>
      </div>
    </div>
  );
}