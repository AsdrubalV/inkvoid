import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("paddle_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.paddle_customer_id) {
    return NextResponse.json({ error: "No hay suscripcion activa" }, { status: 400 });
  }

  const res = await fetch(
    "https://api.paddle.com/customers/" + profile.paddle_customer_id + "/portal-sessions",
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.PADDLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );

  const data = await res.json();
  const url = data.data?.urls?.general?.overview;

  return NextResponse.json({ url });
}