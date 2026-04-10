import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, paddle_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.paddle_customer_id;

  if (!customerId) {
    const res = await fetch("https://api.paddle.com/customers", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.PADDLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        name: profile?.username ?? user.email,
        custom_data: { supabase_user_id: user.id },
      }),
    });
    const customerData = await res.json();
    customerId = customerData.data?.id;

    if (customerId) {
      await supabase.from("profiles").update({ paddle_customer_id: customerId }).eq("id", user.id);
    }
  }

  return NextResponse.json({
    customerId,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID,
  });
}