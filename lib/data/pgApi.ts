import { query } from "@/lib/db";
import type { CategoryId, DayKey } from "@/lib/constants";
import type {
  Checked,
  DayChecked,
  HistoryItem,
  Ingredient,
  Weeks,
} from "@/lib/types";

type WeekRow = { id: string; week_num: number };
type IngredientRow = {
  id: string;
  week_id: string;
  day_key: string;
  name: string;
  category: string;
};
type CheckedRow = { ingredient_id: string };
type CheckedDayRow = { week_id: string; day_key: string };
type HistoryRow = { name: string; category: string };

export type WeekIndex = Record<number, string>;

export type InitialAppData = {
  weeks: Weeks;
  weekIdByNum: WeekIndex;
  currentWeek: number;
  checked: Checked;
  checkedDays: DayChecked;
  history: HistoryItem[];
};

export async function ensureInitialWeek(): Promise<void> {
  await query(
    `insert into weeks (week_num) values (1)
     on conflict (week_num) do nothing`
  );
}

export async function loadAll(): Promise<InitialAppData> {
  await ensureInitialWeek();

  const [
    weeksResult,
    ingredientsResult,
    checkedResult,
    checkedDaysResult,
    historyResult,
  ] = await Promise.all([
    query<WeekRow>(`select id, week_num from weeks order by week_num asc`),
    query<IngredientRow>(
      `select id, week_id, day_key, name, category
         from ingredients
        order by created_at asc`
    ),
    query<CheckedRow>(`select ingredient_id from checked_items`),
    query<CheckedDayRow>(`select week_id, day_key from checked_days`),
    query<HistoryRow>(
      `select name, category from ingredient_history
        order by used_count desc, updated_at desc`
    ),
  ]);

  const weekList = weeksResult.rows;
  const weekIdByNum: WeekIndex = {};
  const weeks: Weeks = {};
  weekList.forEach((w) => {
    weekIdByNum[w.week_num] = w.id;
    weeks[w.week_num] = {};
  });

  ingredientsResult.rows.forEach((row) => {
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
  checkedResult.rows.forEach((row) => {
    checked[row.ingredient_id] = true;
  });

  const checkedDays: DayChecked = {};
  checkedDaysResult.rows.forEach((row) => {
    const week = weekList.find((w) => w.id === row.week_id);
    if (!week) return;
    const bucket = checkedDays[week.week_num] ?? (checkedDays[week.week_num] = {});
    bucket[row.day_key as DayKey] = true;
  });

  const history: HistoryItem[] = historyResult.rows.map((row) => ({
    name: row.name,
    category: row.category as CategoryId,
  }));

  const weekNums = weekList.map((w) => w.week_num);
  const currentWeek = weekNums.length > 0 ? Math.min(...weekNums) : 1;

  return { weeks, weekIdByNum, currentWeek, checked, checkedDays, history };
}

export async function setDayChecked(
  weekId: string,
  dayKey: string,
  shouldCheck: boolean
): Promise<void> {
  if (shouldCheck) {
    await query(
      `insert into checked_days (week_id, day_key) values ($1, $2)
       on conflict (week_id, day_key) do nothing`,
      [weekId, dayKey]
    );
  } else {
    await query(
      `delete from checked_days where week_id = $1 and day_key = $2`,
      [weekId, dayKey]
    );
  }
}

export async function addIngredient(opts: {
  weekId: string;
  dayKey: string;
  name: string;
  category: CategoryId;
}): Promise<Ingredient> {
  const result = await query<{ id: string; name: string; category: string }>(
    `insert into ingredients (week_id, day_key, name, category)
         values ($1, $2, $3, $4)
      returning id, name, category`,
    [opts.weekId, opts.dayKey, opts.name, opts.category]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    category: row.category as CategoryId,
  };
}

export async function deleteIngredient(id: string): Promise<void> {
  await query(`delete from ingredients where id = $1`, [id]);
}

export async function setChecked(
  ingredientId: string,
  shouldCheck: boolean
): Promise<void> {
  if (shouldCheck) {
    await query(
      `insert into checked_items (ingredient_id) values ($1)
       on conflict (ingredient_id) do nothing`,
      [ingredientId]
    );
  } else {
    await query(`delete from checked_items where ingredient_id = $1`, [
      ingredientId,
    ]);
  }
}

export async function clearChecked(ingredientIds: string[]): Promise<void> {
  if (ingredientIds.length === 0) return;
  await query(
    `delete from checked_items where ingredient_id = any($1::uuid[])`,
    [ingredientIds]
  );
}

export async function recordHistory(item: {
  name: string;
  category: CategoryId;
}): Promise<void> {
  await query(
    `insert into ingredient_history (name, category)
          values ($1, $2)
      on conflict (name)
      do update set used_count = ingredient_history.used_count + 1,
                    updated_at = now(),
                    category   = excluded.category`,
    [item.name, item.category]
  );
}

export async function createWeek(weekNum: number): Promise<string> {
  const result = await query<{ id: string }>(
    `insert into weeks (week_num) values ($1)
          on conflict (week_num) do update set week_num = excluded.week_num
      returning id`,
    [weekNum]
  );
  return result.rows[0].id;
}
