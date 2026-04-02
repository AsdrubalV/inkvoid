import { createServerSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  const { promotionId, eventType } = await req.json();

  if (!promotionId || !["impression", "click"].includes(eventType)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  await supabase.from("promotion_events").insert({
    promotion_id: promotionId,
    event_type: eventType,
  });

  if (eventType === "impression") {
    await supabase.rpc("increment_impressions", { promo_id: promotionId });
  } else if (eventType === "click") {
    await supabase.rpc("increment_clicks", { promo_id: promotionId });
  }

  return NextResponse.json({ ok: true });
}