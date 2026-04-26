"use server";

import { getSessionFromCookies, getAuthMode } from "@/lib/auth";
import type { CategoryId } from "@/lib/constants";
import type { HistoryItem, Ingredient, Weeks } from "@/lib/types";
import * as api from "@/lib/data/pgApi";

async function requireAuth() {
  if (getAuthMode() !== "remote") return;
  const ok = await getSessionFromCookies();
  if (!ok) throw new Error("Unauthorized");
}

export async function addIngredientAction(input: {
  weekId: string;
  dayKey: string;
  name: string;
  category: CategoryId;
}): Promise<Ingredient> {
  await requireAuth();
  const saved = await api.addIngredient(input);
  await api.recordHistory({ name: saved.name, category: saved.category });
  return saved;
}

export async function deleteIngredientAction(id: string): Promise<void> {
  await requireAuth();
  await api.deleteIngredient(id);
}

export async function toggleCheckedAction(
  ingredientId: string,
  shouldCheck: boolean
): Promise<void> {
  await requireAuth();
  await api.setChecked(ingredientId, shouldCheck);
}

export async function clearCheckedAction(ingredientIds: string[]): Promise<void> {
  await requireAuth();
  await api.clearChecked(ingredientIds);
}

export async function createWeekAction(weekNum: number): Promise<string> {
  await requireAuth();
  return api.createWeek(weekNum);
}

export type MigrationPayload = {
  weeks: Weeks;
  history: HistoryItem[];
};

export async function migrateLocalDataAction(
  payload: MigrationPayload
): Promise<{ migratedCount: number; historyCount: number }> {
  await requireAuth();

  let migratedCount = 0;
  let historyCount = 0;

  for (const [weekNumStr, wd] of Object.entries(payload.weeks ?? {})) {
    const weekNum = Number(weekNumStr);
    if (!Number.isFinite(weekNum)) continue;
    const weekId = await api.createWeek(weekNum);
    for (const [dayKey, list] of Object.entries(wd ?? {})) {
      for (const item of list ?? []) {
        if (!item?.name) continue;
        await api.addIngredient({
          weekId,
          dayKey,
          name: item.name,
          category: item.category as CategoryId,
        });
        migratedCount += 1;
      }
    }
  }

  for (const h of payload.history ?? []) {
    if (!h?.name) continue;
    await api.recordHistory({
      name: h.name,
      category: h.category as CategoryId,
    });
    historyCount += 1;
  }

  return { migratedCount, historyCount };
}
