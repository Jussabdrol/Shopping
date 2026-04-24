"use client";

import type { CategoryId } from "@/lib/constants";
import type { HistoryItem, Weeks } from "@/lib/types";

const MIGRATION_FLAG_KEY = "grocery-migrated-to-remote";

function safeRead<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function hasLocalData(): boolean {
  if (typeof localStorage === "undefined") return false;
  if (localStorage.getItem(MIGRATION_FLAG_KEY) === "1") return false;
  const weeks = safeRead<Weeks>("grocery-weeks");
  const history = safeRead<HistoryItem[]>("grocery-history");
  const anyWeek =
    weeks &&
    Object.values(weeks).some((wd) =>
      Object.values(wd ?? {}).some((list) => (list?.length ?? 0) > 0)
    );
  const anyHistory = history && history.length > 0;
  return Boolean(anyWeek || anyHistory);
}

export function collectLocalData(): { weeks: Weeks; history: HistoryItem[] } {
  const weeks = safeRead<Weeks>("grocery-weeks") ?? {};
  const history = safeRead<HistoryItem[]>("grocery-history") ?? [];
  const typedHistory: HistoryItem[] = history.map((h) => ({
    name: h.name,
    category: h.category as CategoryId,
  }));
  return { weeks, history: typedHistory };
}

export function markMigrated() {
  try {
    localStorage.setItem(MIGRATION_FLAG_KEY, "1");
    localStorage.removeItem("grocery-weeks");
    localStorage.removeItem("grocery-current-week");
    localStorage.removeItem("grocery-checked");
    localStorage.removeItem("grocery-history");
  } catch {
    // ignore
  }
}
