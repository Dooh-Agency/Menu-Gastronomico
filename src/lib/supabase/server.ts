import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function publicCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase public environment variables are not configured.");
  return { url, key };
}

/** Creates a request-scoped client that carries the authenticated user's session. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, key } = publicCredentials();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot persist refreshed cookies; proxy.ts handles that case.
        }
      },
    },
  });
}
