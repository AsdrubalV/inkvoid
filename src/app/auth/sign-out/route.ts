import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createServerSupabase();
  await supabase.auth.signOut();

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "inkvoid.ink";
  const proto = request.headers.get("x-forwarded-proto") ?? "https";

  return NextResponse.redirect(`${proto}://${host}/`);
}