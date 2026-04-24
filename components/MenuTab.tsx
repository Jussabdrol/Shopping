"use client";

import { DAY_KEYS } from "@/lib/constants";
import type { HistoryItem, Ingredient, WeekData } from "@/lib/types";
import { DaySection } from "./DaySection";

type Props = {
  weekData: WeekData;
  onAdd: (dayKey: string, item: Ingredient) => void;
  onDelete: (dayKey: string, id: string) => void;
  history: HistoryItem[];
};

export function MenuTab({ weekData, onAdd, onDelete, history }: Props) {
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
            onAdd={(item) => onAdd(key, item)}
            onDelete={(id) => onDelete(key, id)}
            history={history}
          />
        );
      })}
    </div>
  );
}
