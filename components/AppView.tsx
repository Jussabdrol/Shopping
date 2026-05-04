"use client";

import { useMemo, useState } from "react";
import type {
  Checked,
  DayChecked,
  HistoryItem,
  Ingredient,
  WeekData,
  Weeks,
} from "@/lib/types";
import type { DayKey } from "@/lib/constants";
import { MenuTab } from "./MenuTab";
import { GroceryTab } from "./GroceryTab";
import { WeekSelector } from "./WeekSelector";

type Tab = "menu" | "grocery";

export type AppViewProps = {
  weeks: Weeks;
  currentWeek: number;
  checked: Checked;
  checkedDays: DayChecked;
  history: HistoryItem[];
  userEmail?: string | null;
  onSignOut?: () => void;
  onAddIngredient: (dayKey: string, item: Ingredient) => void;
  onDeleteIngredient: (dayKey: string, id: string) => void;
  onToggleChecked: (id: string) => void;
  onClearChecked: (ids: string[]) => void;
  onToggleDayChecked: (dayKey: DayKey) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onAddWeek: () => void;
};

export function AppView({
  weeks,
  currentWeek,
  checked,
  checkedDays,
  history,
  userEmail,
  onSignOut,
  onAddIngredient,
  onDeleteIngredient,
  onToggleChecked,
  onClearChecked,
  onToggleDayChecked,
  onPrevWeek,
  onNextWeek,
  onAddWeek,
}: AppViewProps) {
  const [tab, setTab] = useState<Tab>("menu");

  const weekNums = Object.keys(weeks).map(Number);
  const totalWeeks = weekNums.length > 0 ? Math.max(...weekNums) : 1;
  const weekData: WeekData = weeks[currentWeek] ?? {};

  const allIngredients = useMemo(
    () => Object.values(weekData).flat().filter(Boolean) as Ingredient[],
    [weekData]
  );
  const allIngCount = allIngredients.length;
  const uncheckedCount = allIngredients.filter((i) => !checked[i.id]).length;

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
        onPrev={onPrevWeek}
        onNext={onNextWeek}
        onAdd={() => {
          onAddWeek();
          setTab("menu");
        }}
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
          checkedDays={checkedDays[currentWeek] ?? {}}
          onAdd={onAddIngredient}
          onDelete={onDeleteIngredient}
          onToggleDayChecked={onToggleDayChecked}
          history={history}
        />
      ) : (
        <GroceryTab
          weekData={weekData}
          checked={checked}
          onToggle={onToggleChecked}
          onClearChecked={onClearChecked}
        />
      )}
    </div>
  );
}
