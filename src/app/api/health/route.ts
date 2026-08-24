import { NextResponse } from "next/server";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

/** Verifies the public Supabase connection without exposing tenant data or secrets. */
export async function GET() {
  try {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("restaurants").select("id").limit(1);

    if (error) {
      return NextResponse.json({ status: "unavailable" }, { status: 503 });
    }

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "not_configured" }, { status: 503 });
  }
}
