import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Reads NEXT_PUBLIC_* env vars — see
 * .env.example. Safe to call multiple times; @supabase/ssr handles
 * singleton behavior internally per the official Next.js integration.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
