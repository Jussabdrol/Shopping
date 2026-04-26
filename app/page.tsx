import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { RemoteAppShell } from "@/components/RemoteAppShell";
import { getAuthMode, getSessionFromCookies } from "@/lib/auth";
import { loadAll } from "@/lib/data/pgApi";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (getAuthMode() === "local") {
    return <AppShell />;
  }

  const authenticated = await getSessionFromCookies();
  if (!authenticated) {
    redirect("/login");
  }

  const initial = await loadAll();
  return <RemoteAppShell initial={initial} />;
}
