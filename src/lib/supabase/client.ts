import { createBrowserClient } from "@supabase/ssr";

function requiredPublicEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/**
 * Creates a browser-safe client backed by cookies so Server Components can
 * validate the same authenticated session. Service-role credentials are never used here.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    requiredPublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredPublicEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  );
}
