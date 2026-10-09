"use client";

import { useId, useState } from "react";
import { getCategory } from "@/lib/constants";
import type { HistoryItem, Ingredient } from "@/lib/types";
import { AddIngredientRow } from "./AddIngredientRow";
import { Icon } from "./Icon";

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
  const bodyId = useId();
  const checkable = !isGeneral && Boolean(onToggleChecked);

  function handleDotClick(e: React.MouseEvent) {
    if (!checkable) return;
    e.stopPropagation();
    onToggleChecked?.();
  }

  return (
    <div className={`day-section${isChecked ? " day-checked" : ""}`}>
      <div className="day-header">
        {checkable && (
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
            <span className="day-check-circle">
              {isChecked && <Icon name="check" width="15" height="15" />}
            </span>
          </button>
        )}
        <button
          className="day-disclosure"
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={bodyId}
        >
          {isGeneral && (
            <span className="general-icon">
              <Icon name="bag" />
            </span>
          )}
          <span className="day-copy">
            <span className="day-name">{label}</span>
            <span className="day-preview">
              {items.length > 0
                ? items.map((item) => item.name).join(", ")
                : isGeneral
                  ? "Alles voor in huis"
                  : "Voeg ingrediënten toe"}
            </span>
          </span>
          {items.length > 0 && (
            <span className="day-count">{items.length}</span>
          )}
          <Icon
            name="chevron"
            className={`day-chevron${open ? " open" : ""}`}
            width="15"
            height="15"
          />
        </button>
      </div>
      <div className="day-body" id={bodyId} hidden={!open}>
        {open && (
          <>
            {items.map((item) => (
              <div className="ingredient-item" key={item.id}>
                <div className="ingredient-info">
                  <span className="ingredient-name">{item.name}</span>
                  <span
                    className={`category-badge ${getCategory(item.category).badgeClass}`}
                  >
                    {getCategory(item.category).label}
                  </span>
                </div>
                <button
                  className="delete-btn"
                  type="button"
                  onClick={() => onDelete(item.id)}
                  aria-label={`Verwijder ${item.name}`}
                >
                  <Icon name="close" width="16" height="16" />
                </button>
              </div>
            ))}
            <AddIngredientRow onAdd={onAdd} history={history} />
          </>
        )}
      </div>
    </div>
  );
}
