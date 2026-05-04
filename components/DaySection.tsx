"use client";

import { useState } from "react";
import { getCategory } from "@/lib/constants";
import type { HistoryItem, Ingredient } from "@/lib/types";
import { AddIngredientRow } from "./AddIngredientRow";

type Props = {
  label: string;
  items: Ingredient[];
  isGeneral: boolean;
  isChecked?: boolean;
  onAdd: (item: Ingredient) => void;
  onDelete: (id: string) => void;
  onToggleChecked?: () => void;
  history: HistoryItem[];
};

export function DaySection({
  label,
  items,
  isGeneral,
  isChecked = false,
  onAdd,
  onDelete,
  onToggleChecked,
  history,
}: Props) {
  const [open, setOpen] = useState(isGeneral);
  const checkable = !isGeneral && Boolean(onToggleChecked);

  function handleDotClick(e: React.MouseEvent) {
    if (!checkable) return;
    e.stopPropagation();
    onToggleChecked?.();
  }

  return (
    <div className={`day-section${isChecked ? " day-checked" : ""}`}>
      <div className="day-header" onClick={() => setOpen((o) => !o)}>
        <div className="day-header-left">
          <button
            type="button"
            className={`day-dot${isGeneral ? " general" : ""}${
              checkable ? " day-dot-checkable" : ""
            }${isChecked ? " checked" : ""}`}
            onClick={handleDotClick}
            aria-label={
              checkable
                ? isChecked
                  ? `${label} terugzetten`
                  : `${label} afvinken`
                : undefined
            }
            aria-pressed={checkable ? isChecked : undefined}
            tabIndex={checkable ? 0 : -1}
          >
            {checkable && isChecked && <span className="day-dot-tick">✓</span>}
          </button>
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
