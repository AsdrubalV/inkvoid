import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createServerSupabase();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Esperar un momento para que el trigger cree el perfil
      await new Promise((res) => setTimeout(res, 1500));

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.username) {
        return NextResponse.redirect("https://inkvoid.ink/user/" + profile.username);
      }

      // Si no tiene username redirigir al home
      return NextResponse.redirect("https://inkvoid.ink");
    }
  }

  return NextResponse.redirect("https://inkvoid.ink" + next);
}