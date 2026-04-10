
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.event_type;
    const data = body.data;

    if (eventType === "subscription.activated") {
      const customerId = data.customer_id;
      const subscriptionId = data.id;
      const status = data.status;
      const currentPeriodEnd = data.current_billing_period?.ends_at;

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("paddle_customer_id", customerId)
        .maybeSingle();

      if (profile) {
        await supabaseAdmin.from("subscriptions").upsert({
          user_id: profile.id,
          paddle_subscription_id: subscriptionId,
          paddle_customer_id: customerId,
          status: "active",
          price_id: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID,
          current_period_end: currentPeriodEnd,
        }, { onConflict: "user_id" });
      }
    }

    if (eventType === "subscription.canceled") {
      const subscriptionId = data.id;
      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("paddle_subscription_id", subscriptionId);
    }

    if (eventType === "subscription.updated") {
      const subscriptionId = data.id;
      const status = data.status;
      const currentPeriodEnd = data.current_billing_period?.ends_at;
      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: status === "active" ? "active" : "canceled",
          current_period_end: currentPeriodEnd,
        })
        .eq("paddle_subscription_id", subscriptionId);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}