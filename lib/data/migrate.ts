import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryId } from "@/lib/constants";
import type { Weeks, HistoryItem } from "@/lib/types";

const MIGRATION_FLAG_KEY = "grocery-migrated-to-supabase";

export function readLocalWeeks(): Weeks | null {
  try {
    const raw = localStorage.getItem("grocery-weeks");
    if (!raw) return null;
    return JSON.parse(raw) as Weeks;
  } catch {
    return null;
  }
}

export function readLocalHistory(): HistoryItem[] | null {
  try {
    const raw = localStorage.getItem("grocery-history");
    if (!raw) return null;
    return JSON.parse(raw) as HistoryItem[];
  } catch {
    return null;
  }
}

export function hasMigrated(): boolean {
  try {
    return localStorage.getItem(MIGRATION_FLAG_KEY) === "1";
  } catch {
    return false;
  }
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

export async function migrateLocalToSupabase(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  if (hasMigrated()) return false;
  const localWeeks = readLocalWeeks();
  const localHistory = readLocalHistory();
  const hasAny =
    (localWeeks && Object.values(localWeeks).some((wd) => Object.values(wd).some((list) => (list?.length ?? 0) > 0))) ||
    (localHistory && localHistory.length > 0);
  if (!hasAny) {
    markMigrated();
    return false;
  }

  const { data: existingWeeks } = await supabase
    .from("weeks")
    .select("week_num")
    .eq("user_id", userId);
  const existingNums = new Set((existingWeeks ?? []).map((r: { week_num: number }) => r.week_num));

  if (localWeeks) {
    for (const [weekNumStr, wd] of Object.entries(localWeeks)) {
      const weekNum = Number(weekNumStr);
      let weekId: string | undefined;
      if (!existingNums.has(weekNum)) {
        const { data, error } = await supabase
          .from("weeks")
          .insert({ user_id: userId, week_num: weekNum })
          .select("id")
          .single();
        if (error) continue;
        weekId = data.id as string;
      } else {
        const { data } = await supabase
          .from("weeks")
          .select("id")
          .eq("user_id", userId)
          .eq("week_num", weekNum)
          .maybeSingle();
        weekId = data?.id as string | undefined;
      }
      if (!weekId) continue;

      const rows: { week_id: string; day_key: string; name: string; category: string }[] = [];
      for (const [dayKey, list] of Object.entries(wd)) {
        (list ?? []).forEach((item) => {
          rows.push({
            week_id: weekId!,
            day_key: dayKey,
            name: item.name,
            category: item.category,
          });
        });
      }
      if (rows.length > 0) {
        await supabase.from("ingredients").insert(rows);
      }
    }
  }

  if (localHistory && localHistory.length > 0) {
    const rows = localHistory.map((h) => ({
      user_id: userId,
      name: h.name,
      category: h.category as CategoryId,
    }));
    await supabase
      .from("ingredient_history")
      .upsert(rows, { onConflict: "user_id,name", ignoreDuplicates: true });
  }

  markMigrated();
  return true;
}
