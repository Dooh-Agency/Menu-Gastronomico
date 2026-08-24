import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function safeNext(value: string | null) {
  return value?.startsWith("/") ? value : "/admin";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNext(requestUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!code || !url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.exchangeCodeForSession(code);
  return response;
}
