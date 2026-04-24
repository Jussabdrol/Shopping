"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const { url, anon } = getSupabaseEnv();
  if (!url || !anon) {
    throw new Error(
      "Supabase client requested but NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set."
    );
  }
  return createBrowserClient(url, anon);
}
