"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { InitialAppData } from "@/lib/data/pgApi";
import type {
  Checked,
  DayChecked,
  HistoryItem,
  Ingredient,
  WeekData,
  Weeks,
} from "@/lib/types";
import type { CategoryId, DayKey } from "@/lib/constants";
import {
  addIngredientAction,
  clearCheckedAction,
  createWeekAction,
  deleteIngredientAction,
  migrateLocalDataAction,
  toggleCheckedAction,
  toggleDayCheckedAction,
} from "@/app/actions/data";
import {
  collectLocalData,
  hasLocalData,
  markMigrated,
} from "@/lib/data/localMigration";
import { AppView } from "./AppView";

type Props = {
  initial: InitialAppData;
};

export function RemoteAppShell({ initial }: Props) {
  const [weeks, setWeeks] = useState<Weeks>(
    Object.keys(initial.weeks).length > 0 ? initial.weeks : { 1: {} }
  );
  const [weekIdByNum, setWeekIdByNum] = useState<Record<number, string>>(
    initial.weekIdByNum
  );
  const [currentWeek, setCurrentWeek] = useState<number>(initial.currentWeek);
  const [checked, setChecked] = useState<Checked>(initial.checked);
  const [checkedDays, setCheckedDays] = useState<DayChecked>(initial.checkedDays);
  const [history, setHistory] = useState<HistoryItem[]>(initial.history);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const migrationTriedRef = useRef(false);

  useEffect(() => {
    if (migrationTriedRef.current) return;
    migrationTriedRef.current = true;
    if (!hasLocalData()) return;
    const payload = collectLocalData();
    (async () => {
      try {
        await migrateLocalDataAction(payload);
        markMigrated();
        window.location.reload();
      } catch (err) {
        setError(
          err instanceof Error
            ? `Migratie mislukt: ${err.message}`
            : "Migratie mislukt."
        );
      }
    })();
  }, []);

  function run<T>(fn: () => Promise<T>) {
    startTransition(async () => {
      try {
        await fn();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  }

  async function handleAddIngredient(dayKey: string, optimistic: Ingredient) {
    const weekId = weekIdByNum[currentWeek];
    if (!weekId) return;

    setWeeks((prev) => {
      const wd: WeekData = prev[currentWeek] ?? {};
      return {
        ...prev,
        [currentWeek]: {
          ...wd,
          [dayKey]: [...(wd[dayKey as keyof WeekData] ?? []), optimistic],
        },
      };
    });
    setHistory((prev) =>
      prev.some((h) => h.name.toLowerCase() === optimistic.name.toLowerCase())
        ? prev
        : [{ name: optimistic.name, category: optimistic.category }, ...prev]
    );

    run(async () => {
      const saved = await addIngredientAction({
        weekId,
        dayKey,
        name: optimistic.name,
        category: optimistic.category as CategoryId,
      });
      setWeeks((prev) => {
        const wd: WeekData = prev[currentWeek] ?? {};
        return {
          ...prev,
          [currentWeek]: {
            ...wd,
            [dayKey]: (wd[dayKey as keyof WeekData] ?? []).map((i) =>
              i.id === optimistic.id ? saved : i
            ),
          },
        };
      });
    });
  }

  function handleDeleteIngredient(dayKey: string, id: string) {
    setWeeks((prev) => {
      const wd: WeekData = prev[currentWeek] ?? {};
      return {
        ...prev,
        [currentWeek]: {
          ...wd,
          [dayKey]: (wd[dayKey as keyof WeekData] ?? []).filter((i) => i.id !== id),
        },
      };
    });
    setChecked((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    run(() => deleteIngredientAction(id));
  }

  function handleToggleChecked(id: string) {
    const nextChecked = !checked[id];
    setChecked((prev) => ({ ...prev, [id]: nextChecked }));
    run(() => toggleCheckedAction(id, nextChecked));
  }

  function handleClearChecked(ids: string[]) {
    setChecked((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });
    run(() => clearCheckedAction(ids));
  }

  function handleToggleDayChecked(dayKey: DayKey) {
    const weekId = weekIdByNum[currentWeek];
    if (!weekId) return;
    const isOn = Boolean(checkedDays[currentWeek]?.[dayKey]);
    const next = !isOn;
    setCheckedDays((prev) => {
      const wk = prev[currentWeek] ?? {};
      const nextWk: Partial<Record<DayKey, boolean>> = { ...wk };
      if (next) nextWk[dayKey] = true;
      else delete nextWk[dayKey];
      return { ...prev, [currentWeek]: nextWk };
    });
    run(() => toggleDayCheckedAction(weekId, dayKey, next));
  }

  function handlePrevWeek() {
    setCurrentWeek((w) => Math.max(1, w - 1));
  }

  function handleNextWeek() {
    const weekNums = Object.keys(weeks).map(Number);
    const totalWeeks = weekNums.length > 0 ? Math.max(...weekNums) : 1;
    setCurrentWeek((w) => Math.min(totalWeeks, w + 1));
  }

  function handleAddWeek() {
    const weekNums = Object.keys(weeks).map(Number);
    const newNum = (weekNums.length > 0 ? Math.max(...weekNums) : 0) + 1;
    setWeeks((prev) => ({ ...prev, [newNum]: {} }));
    setCurrentWeek(newNum);
    run(async () => {
      const id = await createWeekAction(newNum);
      setWeekIdByNum((prev) => ({ ...prev, [newNum]: id }));
    });
  }

  async function handleSignOut() {
    await fetch("/auth/signout", { method: "POST" });
    window.location.href = "/login";
  }

  if (error) {
    return (
      <div className="app">
        <div className="app-header">
          <h1>Slim Boodschappen</h1>
          <div className="subtitle" style={{ color: "#C4622D" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <AppView
      weeks={weeks}
      currentWeek={currentWeek}
      checked={checked}
      checkedDays={checkedDays}
      history={history}
      userEmail="ingelogd"
      onSignOut={handleSignOut}
      onAddIngredient={handleAddIngredient}
      onDeleteIngredient={handleDeleteIngredient}
      onToggleChecked={handleToggleChecked}
      onClearChecked={handleClearChecked}
      onToggleDayChecked={handleToggleDayChecked}
      onPrevWeek={handlePrevWeek}
      onNextWeek={handleNextWeek}
      onAddWeek={handleAddWeek}
    />
  );
}
