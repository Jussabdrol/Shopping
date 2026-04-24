import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SupabaseAppShell } from "@/components/SupabaseAppShell";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { configured } = getSupabaseEnv();

  if (!configured) {
    return <AppShell />;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <SupabaseAppShell userId={user.id} userEmail={user.email ?? null} />;
}
