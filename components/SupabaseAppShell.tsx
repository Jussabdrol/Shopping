"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CategoryId } from "@/lib/constants";
import type {
  Checked,
  HistoryItem,
  Ingredient,
  WeekData,
  Weeks,
} from "@/lib/types";
import * as api from "@/lib/data/supabaseApi";
import { migrateLocalToSupabase } from "@/lib/data/migrate";
import { AppView } from "./AppView";

type Props = {
  userId: string;
  userEmail: string | null;
};

export function SupabaseAppShell({ userId, userEmail }: Props) {
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [weeks, setWeeks] = useState<Weeks>({ 1: {} });
  const [weekIdByNum, setWeekIdByNum] = useState<Record<number, string>>({});
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [checked, setChecked] = useState<Checked>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const reload = useCallback(async () => {
    try {
      await migrateLocalToSupabase(supabase, userId);
      const data = await api.loadAll(supabase, userId);
      setWeeks(data.weeks);
      setWeekIdByNum(data.weekIdByNum);
      setCurrentWeek((prev) => (data.weeks[prev] ? prev : data.currentWeek));
      setChecked(data.checked);
      setHistory(data.history);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

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

    try {
      const saved = await api.addIngredient(supabase, {
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
      await api.recordHistory(supabase, userId, {
        name: saved.name,
        category: saved.category,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      await reload();
    }
  }

  async function handleDeleteIngredient(dayKey: string, id: string) {
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
    try {
      await api.deleteIngredient(supabase, id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      await reload();
    }
  }

  async function handleToggleChecked(id: string) {
    const nextChecked = !checked[id];
    setChecked((prev) => ({ ...prev, [id]: nextChecked }));
    try {
      await api.upsertChecked(supabase, userId, id, nextChecked);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      await reload();
    }
  }

  async function handleClearChecked(ids: string[]) {
    setChecked((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });
    try {
      await api.clearChecked(supabase, userId, ids);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      await reload();
    }
  }

  function handlePrevWeek() {
    setCurrentWeek((w) => Math.max(1, w - 1));
  }

  function handleNextWeek() {
    const weekNums = Object.keys(weeks).map(Number);
    const totalWeeks = weekNums.length > 0 ? Math.max(...weekNums) : 1;
    setCurrentWeek((w) => Math.min(totalWeeks, w + 1));
  }

  async function handleAddWeek() {
    const weekNums = Object.keys(weeks).map(Number);
    const newNum = (weekNums.length > 0 ? Math.max(...weekNums) : 0) + 1;
    setWeeks((prev) => ({ ...prev, [newNum]: {} }));
    setCurrentWeek(newNum);
    try {
      const id = await api.createWeek(supabase, userId, newNum);
      setWeekIdByNum((prev) => ({ ...prev, [newNum]: id }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      await reload();
    }
  }

  async function handleSignOut() {
    await fetch("/auth/signout", { method: "POST" });
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="app">
        <div className="app-header">
          <h1>Slim Boodschappen</h1>
          <div className="subtitle">Laden…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="app-header">
          <h1>Slim Boodschappen</h1>
          <div className="subtitle" style={{ color: "#C4622D" }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppView
      weeks={weeks}
      currentWeek={currentWeek}
      checked={checked}
      history={history}
      userEmail={userEmail}
      onSignOut={handleSignOut}
      onAddIngredient={handleAddIngredient}
      onDeleteIngredient={handleDeleteIngredient}
      onToggleChecked={handleToggleChecked}
      onClearChecked={handleClearChecked}
      onPrevWeek={handlePrevWeek}
      onNextWeek={handleNextWeek}
      onAddWeek={handleAddWeek}
    />
  );
}
