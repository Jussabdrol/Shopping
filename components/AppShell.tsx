"use client";

import { useLocalStorage } from "@/lib/useLocalStorage";
import type {
  Checked,
  HistoryItem,
  Ingredient,
  WeekData,
  Weeks,
} from "@/lib/types";
import { AppView } from "./AppView";

export function AppShell() {
  const [weeks, setWeeks] = useLocalStorage<Weeks>("grocery-weeks", { 1: {} });
  const [currentWeek, setCurrentWeek] = useLocalStorage<number>(
    "grocery-current-week",
    1
  );
  const [checked, setChecked] = useLocalStorage<Checked>("grocery-checked", {});
  const [history, setHistory] = useLocalStorage<HistoryItem[]>(
    "grocery-history",
    []
  );

  const weekNums = Object.keys(weeks).map(Number);
  const totalWeeks = weekNums.length > 0 ? Math.max(...weekNums) : 1;

  function mutateWeek(updater: (prev: WeekData) => WeekData) {
    setWeeks((prev) => {
      const current = prev[currentWeek] ?? {};
      return { ...prev, [currentWeek]: updater(current) };
    });
  }

  function recordHistory(item: Ingredient) {
    setHistory((hist) => {
      if (hist.some((h) => h.name.toLowerCase() === item.name.toLowerCase()))
        return hist;
      return [{ name: item.name, category: item.category }, ...hist];
    });
  }

  return (
    <AppView
      weeks={weeks}
      currentWeek={currentWeek}
      checked={checked}
      history={history}
      onAddIngredient={(dayKey, item) => {
        mutateWeek((prev) => ({
          ...prev,
          [dayKey]: [...(prev[dayKey as keyof WeekData] ?? []), item],
        }));
        recordHistory(item);
      }}
      onDeleteIngredient={(dayKey, id) => {
        mutateWeek((prev) => ({
          ...prev,
          [dayKey]: (prev[dayKey as keyof WeekData] ?? []).filter(
            (i) => i.id !== id
          ),
        }));
      }}
      onToggleChecked={(id) => {
        setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
      }}
      onClearChecked={(ids) => {
        setChecked((prev) => {
          const next = { ...prev };
          ids.forEach((id) => delete next[id]);
          return next;
        });
      }}
      onPrevWeek={() => setCurrentWeek((w) => Math.max(1, w - 1))}
      onNextWeek={() => setCurrentWeek((w) => Math.min(totalWeeks, w + 1))}
      onAddWeek={() => {
        const newNum = totalWeeks + 1;
        setWeeks((prev) => ({ ...prev, [newNum]: {} }));
        setCurrentWeek(newNum);
      }}
    />
  );
}
