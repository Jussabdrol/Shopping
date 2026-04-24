"use client";

import { useMemo, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import type {
  Checked,
  HistoryItem,
  Ingredient,
  WeekData,
  Weeks,
} from "@/lib/types";
import { MenuTab } from "./MenuTab";
import { GroceryTab } from "./GroceryTab";
import { WeekSelector } from "./WeekSelector";

type Tab = "menu" | "grocery";

export function AppShell({ userEmail, onSignOut }: { userEmail?: string | null; onSignOut?: () => void }) {
  const [tab, setTab] = useState<Tab>("menu");
  const [weeks, setWeeks] = useLocalStorage<Weeks>("grocery-weeks", { 1: {} });
  const [currentWeek, setCurrentWeek] = useLocalStorage<number>("grocery-current-week", 1);
  const [checked, setChecked] = useLocalStorage<Checked>("grocery-checked", {});
  const [history, setHistory] = useLocalStorage<HistoryItem[]>("grocery-history", []);

  const weekNums = Object.keys(weeks).map(Number);
  const totalWeeks = weekNums.length > 0 ? Math.max(...weekNums) : 1;
  const weekData: WeekData = weeks[currentWeek] ?? {};

  const allIngredients = useMemo(
    () => Object.values(weekData).flat().filter(Boolean) as Ingredient[],
    [weekData]
  );
  const allIngCount = allIngredients.length;
  const uncheckedCount = allIngredients.filter((i) => !checked[i.id]).length;

  function mutateWeekData(updater: (prev: WeekData) => WeekData) {
    setWeeks((prev) => {
      const current = prev[currentWeek] ?? {};
      const next = updater(current);
      return { ...prev, [currentWeek]: next };
    });
  }

  function addHistory(item: Ingredient) {
    setHistory((hist) => {
      const exists = hist.some(
        (h) => h.name.toLowerCase() === item.name.toLowerCase()
      );
      if (exists) return hist;
      return [{ name: item.name, category: item.category }, ...hist];
    });
  }

  function handleAdd(dayKey: string, item: Ingredient) {
    mutateWeekData((prev) => ({
      ...prev,
      [dayKey]: [...(prev[dayKey as keyof WeekData] ?? []), item],
    }));
    addHistory(item);
  }

  function handleDelete(dayKey: string, id: string) {
    mutateWeekData((prev) => ({
      ...prev,
      [dayKey]: (prev[dayKey as keyof WeekData] ?? []).filter((i) => i.id !== id),
    }));
  }

  function handleToggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleClearChecked(ids: string[]) {
    setChecked((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });
  }

  function handlePrevWeek() {
    setCurrentWeek((w) => Math.max(1, w - 1));
  }

  function handleNextWeek() {
    setCurrentWeek((w) => Math.min(totalWeeks, w + 1));
  }

  function handleAddWeek() {
    const newNum = totalWeeks + 1;
    setWeeks((prev) => ({ ...prev, [newNum]: {} }));
    setCurrentWeek(newNum);
    setTab("menu");
  }

  return (
    <div className="app">
      <div className="app-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h1>Slim Boodschappen</h1>
          {userEmail && onSignOut && (
            <button className="logout-link" onClick={onSignOut} type="button">
              Uitloggen
            </button>
          )}
        </div>
        <div className="subtitle">
          {tab === "menu"
            ? `${allIngCount} ingrediënt${allIngCount !== 1 ? "en" : ""} gepland`
            : `${uncheckedCount} item${uncheckedCount !== 1 ? "s" : ""} nog te halen`}
        </div>
      </div>

      <WeekSelector
        currentWeek={currentWeek}
        totalWeeks={totalWeeks}
        onPrev={handlePrevWeek}
        onNext={handleNextWeek}
        onAdd={handleAddWeek}
      />

      <div style={{ padding: "10px 24px 0" }}>
        <div className="tab-bar">
          <button
            className={`tab-btn${tab === "menu" ? " active" : ""}`}
            onClick={() => setTab("menu")}
          >
            📅 Weekmenu
          </button>
          <button
            className={`tab-btn${tab === "grocery" ? " active" : ""}`}
            onClick={() => setTab("grocery")}
          >
            🛒 Boodschappenlijst
          </button>
        </div>
      </div>

      {tab === "menu" ? (
        <MenuTab
          weekData={weekData}
          onAdd={handleAdd}
          onDelete={handleDelete}
          history={history}
        />
      ) : (
        <GroceryTab
          weekData={weekData}
          checked={checked}
          onToggle={handleToggle}
          onClearChecked={handleClearChecked}
        />
      )}
    </div>
  );
}
