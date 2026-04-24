"use client";

import { useState } from "react";
import { getCategory } from "@/lib/constants";
import type { HistoryItem, Ingredient } from "@/lib/types";
import { AddIngredientRow } from "./AddIngredientRow";

type Props = {
  label: string;
  items: Ingredient[];
  isGeneral: boolean;
  onAdd: (item: Ingredient) => void;
  onDelete: (id: string) => void;
  history: HistoryItem[];
};

export function DaySection({
  label,
  items,
  isGeneral,
  onAdd,
  onDelete,
  history,
}: Props) {
  const [open, setOpen] = useState(isGeneral);
  return (
    <div className="day-section">
      <div className="day-header" onClick={() => setOpen((o) => !o)}>
        <div className="day-header-left">
          <div className={`day-dot${isGeneral ? " general" : ""}`} />
          <span className="day-name">{label}</span>
          {items.length > 0 && <span className="day-count">{items.length}</span>}
        </div>
        <span className={`day-chevron${open ? " open" : ""}`}>▼</span>
      </div>
      {open && (
        <div className="day-body">
          {items.map((item) => (
            <div className="ingredient-item" key={item.id}>
              <div className="ingredient-info">
                <span className="ingredient-name">{item.name}</span>
                <span className={`category-badge ${getCategory(item.category).badgeClass}`}>
                  {getCategory(item.category).label}
                </span>
              </div>
              <button
                className="delete-btn"
                type="button"
                onClick={() => onDelete(item.id)}
                aria-label={`Verwijder ${item.name}`}
              >
                ×
              </button>
            </div>
          ))}
          <AddIngredientRow onAdd={onAdd} history={history} />
        </div>
      )}
    </div>
  );
}
