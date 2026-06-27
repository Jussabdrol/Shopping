"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import type {
  Checked,
  DayChecked,
  HistoryItem,
  Ingredient,
  WeekData,
  Weeks,
} from "@/lib/types";
import { DAYS, type DayKey } from "@/lib/constants";
import { AppView } from "./AppView";

function computeSmartWeek(weeks: Weeks, checkedDays: DayChecked): number {
  const weekNums = Object.keys(weeks).map(Number).sort((a, b) => a - b);
  return (
    weekNums.find((num) => DAYS.some((day) => !checkedDays[num]?.[day])) ??
    (weekNums.length > 0 ? weekNums[weekNums.length - 1] : 1)
  );
}

export function AppShell() {
  const [weeks, setWeeks, weeksHydrated] = useLocalStorage<Weeks>("grocery-weeks", { 1: {} });
  const [checked, setChecked] = useLocalStorage<Checked>("grocery-checked", {});
  const [checkedDays, setCheckedDays, daysHydrated] = useLocalStorage<DayChecked>(
    "grocery-day-checked",
    {}
  );
  const [history, setHistory] = useLocalStorage<HistoryItem[]>(
    "grocery-history",
    []
  );

  const [currentWeek, setCurrentWeek] = useState(1);
  const smartWeekSetRef = useRef(false);

  useEffect(() => {
    if (!weeksHydrated || !daysHydrated || smartWeekSetRef.current) return;
    smartWeekSetRef.current = true;
    setCurrentWeek(computeSmartWeek(weeks, checkedDays));
  }, [weeksHydrated, daysHydrated, weeks, checkedDays]);

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
      checkedDays={checkedDays}
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
      onToggleDayChecked={(dayKey: DayKey) => {
        setCheckedDays((prev) => {
          const wk = prev[currentWeek] ?? {};
          const isOn = Boolean(wk[dayKey]);
          const nextWk: Partial<Record<DayKey, boolean>> = { ...wk };
          if (isOn) delete nextWk[dayKey];
          else nextWk[dayKey] = true;
          return { ...prev, [currentWeek]: nextWk };
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
