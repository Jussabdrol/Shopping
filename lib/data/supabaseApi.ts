import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryId, DayKey } from "@/lib/constants";
import type {
  Checked,
  HistoryItem,
  Ingredient,
  WeekData,
  Weeks,
} from "@/lib/types";

type IngredientRow = {
  id: string;
  week_id: string;
  day_key: string;
  name: string;
  category: string;
  position: number | null;
  created_at: string;
};

type WeekRow = {
  id: string;
  user_id: string;
  week_num: number;
  created_at: string;
};

type CheckedRow = {
  id: string;
  user_id: string;
  ingredient_id: string;
};

type HistoryRow = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  used_count: number;
  updated_at: string;
};

export type WeekIndex = Record<number, string>;

export type InitialAppData = {
  weeks: Weeks;
  weekIdByNum: WeekIndex;
  currentWeek: number;
  checked: Checked;
  history: HistoryItem[];
};

export async function ensureInitialWeek(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data: existing } = await supabase
    .from("weeks")
    .select("id")
    .eq("user_id", userId)
    .eq("week_num", 1)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await supabase
    .from("weeks")
    .insert({ user_id: userId, week_num: 1 })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function loadAll(
  supabase: SupabaseClient,
  userId: string
): Promise<InitialAppData> {
  await ensureInitialWeek(supabase, userId);

  const [{ data: weekRows, error: weeksErr }, { data: checkedRows, error: checkedErr }, { data: historyRows, error: historyErr }] =
    await Promise.all([
      supabase
        .from("weeks")
        .select("id, user_id, week_num, created_at")
        .eq("user_id", userId)
        .order("week_num", { ascending: true }),
      supabase
        .from("checked_items")
        .select("id, user_id, ingredient_id")
        .eq("user_id", userId),
      supabase
        .from("ingredient_history")
        .select("id, user_id, name, category, used_count, updated_at")
        .eq("user_id", userId)
        .order("used_count", { ascending: false })
        .order("updated_at", { ascending: false }),
    ]);

  if (weeksErr) throw weeksErr;
  if (checkedErr) throw checkedErr;
  if (historyErr) throw historyErr;

  const weekList = (weekRows ?? []) as WeekRow[];
  const weekIdByNum: WeekIndex = {};
  weekList.forEach((w) => {
    weekIdByNum[w.week_num] = w.id;
  });

  const weekIds = weekList.map((w) => w.id);
  let ingredientRows: IngredientRow[] = [];
  if (weekIds.length > 0) {
    const { data, error } = await supabase
      .from("ingredients")
      .select("id, week_id, day_key, name, category, position, created_at")
      .in("week_id", weekIds)
      .order("created_at", { ascending: true });
    if (error) throw error;
    ingredientRows = (data ?? []) as IngredientRow[];
  }

  const weeks: Weeks = {};
  weekList.forEach((w) => {
    weeks[w.week_num] = {};
  });
  ingredientRows.forEach((row) => {
    const week = weekList.find((w) => w.id === row.week_id);
    if (!week) return;
    const wd = weeks[week.week_num] ?? (weeks[week.week_num] = {});
    const dayKey = row.day_key as DayKey;
    const bucket = wd[dayKey] ?? (wd[dayKey] = []);
    bucket.push({
      id: row.id,
      name: row.name,
      category: row.category as CategoryId,
    });
  });

  const checked: Checked = {};
  (checkedRows as CheckedRow[] | null)?.forEach((row) => {
    checked[row.ingredient_id] = true;
  });

  const history: HistoryItem[] = (historyRows as HistoryRow[] | null ?? []).map(
    (row) => ({ name: row.name, category: row.category as CategoryId })
  );

  const weekNums = weekList.map((w) => w.week_num);
  const currentWeek = weekNums.length > 0 ? Math.min(...weekNums) : 1;

  return { weeks, weekIdByNum, currentWeek, checked, history };
}

export async function addIngredient(
  supabase: SupabaseClient,
  opts: { weekId: string; dayKey: string; name: string; category: CategoryId }
): Promise<Ingredient> {
  const { data, error } = await supabase
    .from("ingredients")
    .insert({
      week_id: opts.weekId,
      day_key: opts.dayKey,
      name: opts.name,
      category: opts.category,
    })
    .select("id, name, category")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    category: data.category as CategoryId,
  };
}

export async function deleteIngredient(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("ingredients").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertChecked(
  supabase: SupabaseClient,
  userId: string,
  ingredientId: string,
  shouldCheck: boolean
): Promise<void> {
  if (shouldCheck) {
    const { error } = await supabase
      .from("checked_items")
      .upsert(
        { user_id: userId, ingredient_id: ingredientId },
        { onConflict: "user_id,ingredient_id" }
      );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("checked_items")
      .delete()
      .eq("user_id", userId)
      .eq("ingredient_id", ingredientId);
    if (error) throw error;
  }
}

export async function clearChecked(
  supabase: SupabaseClient,
  userId: string,
  ingredientIds: string[]
): Promise<void> {
  if (ingredientIds.length === 0) return;
  const { error } = await supabase
    .from("checked_items")
    .delete()
    .eq("user_id", userId)
    .in("ingredient_id", ingredientIds);
  if (error) throw error;
}

export async function recordHistory(
  supabase: SupabaseClient,
  userId: string,
  item: { name: string; category: CategoryId }
): Promise<void> {
  const { data: existing } = await supabase
    .from("ingredient_history")
    .select("id, used_count")
    .eq("user_id", userId)
    .eq("name", item.name)
    .maybeSingle();
  if (existing) {
    await supabase
      .from("ingredient_history")
      .update({
        used_count: (existing.used_count ?? 1) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("ingredient_history").insert({
      user_id: userId,
      name: item.name,
      category: item.category,
    });
  }
}

export async function createWeek(
  supabase: SupabaseClient,
  userId: string,
  weekNum: number
): Promise<string> {
  const { data, error } = await supabase
    .from("weeks")
    .insert({ user_id: userId, week_num: weekNum })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}
