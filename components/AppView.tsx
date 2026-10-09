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
import { BrandMark, Icon } from "./Icon";
import { InstallHelp } from "./InstallHelp";

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
    [weekData],
  );
  const allIngCount = allIngredients.length;
  const uncheckedCount = allIngredients.filter((i) => !checked[i.id]).length;

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand-row">
          <BrandMark />
          <div className="brand-copy">
            <p className="eyebrow">Je week, goed geregeld</p>
            <h1>Slim Boodschappen</h1>
          </div>
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
      </header>

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

      <nav className="tab-bar" aria-label="Overzichten">
        <button
          type="button"
          aria-pressed={tab === "menu"}
          aria-controls="week-content"
          className={`tab-btn${tab === "menu" ? " active" : ""}`}
          onClick={() => setTab("menu")}
        >
          <Icon name="calendar" /> Weekmenu
        </button>
        <button
          type="button"
          aria-pressed={tab === "grocery"}
          aria-controls="week-content"
          className={`tab-btn${tab === "grocery" ? " active" : ""}`}
          onClick={() => setTab("grocery")}
        >
          <Icon name="list" /> Boodschappenlijst
        </button>
      </nav>

      <main
        id="week-content"
        className="tab-content"
        aria-label={tab === "menu" ? "Weekmenu" : "Boodschappenlijst"}
      >
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
      </main>
      <footer className="app-footer">
        <InstallHelp />
      </footer>
    </div>
  );
}
