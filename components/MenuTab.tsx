"use client";

import { DAY_KEYS, type DayKey } from "@/lib/constants";
import type { HistoryItem, Ingredient, WeekData } from "@/lib/types";
import { DaySection } from "./DaySection";

type Props = {
  weekData: WeekData;
  checkedDays: Partial<Record<DayKey, boolean>>;
  onAdd: (dayKey: string, item: Ingredient) => void;
  onDelete: (dayKey: string, id: string) => void;
  onToggleDayChecked: (dayKey: DayKey) => void;
  history: HistoryItem[];
};

export function MenuTab({
  weekData,
  checkedDays,
  onAdd,
  onDelete,
  onToggleDayChecked,
  history,
}: Props) {
  return (
    <div className="scroll-content">
      {DAY_KEYS.map((key) => {
        const isGeneral = key === "general";
        const label = isGeneral ? "Algemeen" : key;
        return (
          <DaySection
            key={key}
            label={label}
            items={weekData[key] ?? []}
            isGeneral={isGeneral}
            isChecked={!isGeneral && Boolean(checkedDays[key])}
            onAdd={(item) => onAdd(key, item)}
            onDelete={(id) => onDelete(key, id)}
            onToggleChecked={isGeneral ? undefined : () => onToggleDayChecked(key)}
            history={history}
          />
        );
      })}
    </div>
  );
}
