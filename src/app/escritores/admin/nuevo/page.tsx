import React from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import ArticleEditor from "@/components/ArticleEditor";

const ADMIN_ID = "1e0f8e32-62b5-4c46-882a-1e2041343cd7";

export default async function NuevoArticuloPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== ADMIN_ID) redirect("/");

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Nuevo artículo</h1>
      <ArticleEditor authorId={ADMIN_ID} />
    </div>
  );
}