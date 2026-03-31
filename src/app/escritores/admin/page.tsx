import React from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";

const ADMIN_ID = "1e0f8e32-62b5-4c46-882a-1e2041343cd7";

export default async function AdminPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== ADMIN_ID) redirect("/");

  const { data: articles } = await supabase
    .from("articles")
    .select("id, slug, title, categoria, published, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Panel de artículos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona el contenido de /escritores</p>
        </div>
        <Link
          href="/escritores/admin/nuevo"
          className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 transition"
        >
          + Nuevo artículo
        </Link>
      </div>

      {!articles?.length ? (
        <div className="rounded-2xl border border-border bg-white/70 p-10 text-center space-y-3">
          <p className="text-gray-500 text-sm">No hay artículos aún.</p>
          <Link href="/escritores/admin/nuevo" className="inline-block text-xs text-black underline">
            Crear primer artículo →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white/70 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-gray-400 uppercase tracking-wider">
                <th className="text-left px-4 py-3">Título</th>
                <th className="text-left px-4 py-3">Categoría</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium truncate max-w-[250px]">{a.title}</td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{a.categoria}</td>
                  <td className="px-4 py-3">
                    <span className={"rounded-full px-2 py-0.5 text-[11px] font-medium " + (a.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                      {a.published ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(a.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={"/escritores/admin/editar/" + a.id}
                      className="text-xs text-black underline hover:no-underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}