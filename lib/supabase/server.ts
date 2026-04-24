import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const cookieStore = cookies();
  const { url, anon } = getSupabaseEnv();
  if (!url || !anon) {
    throw new Error(
      "Supabase server client requested but env vars are missing."
    );
  }

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // set() throws in Server Components — safe to ignore when middleware
          // refreshes the session.
        }
      },
    },
  });
}
