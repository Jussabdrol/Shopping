"use client";

import { CATEGORIES, DAY_ABBREV, DAY_KEYS } from "@/lib/constants";
import type { Checked, Ingredient, WeekData } from "@/lib/types";
import { Icon } from "./Icon";

type SourcedIngredient = Ingredient & { source: string };

type Props = {
  weekData: WeekData;
  checked: Checked;
  onToggle: (id: string) => void;
  onClearChecked: (ids: string[]) => void;
};

export function GroceryTab({
  weekData,
  checked,
  onToggle,
  onClearChecked,
}: Props) {
  const allItems: SourcedIngredient[] = [];
  DAY_KEYS.forEach((key) => {
    (weekData[key] ?? []).forEach((item) => {
      allItems.push({ ...item, source: DAY_ABBREV[key] ?? key });
    });
  });

  const seen = new Map<string, SourcedIngredient>();
  const counts = new Map<string, number>();
  const dedupedItems: SourcedIngredient[] = [];
  allItems.forEach((item) => {
    const k = item.name.toLowerCase() + "|" + item.category;
    counts.set(k, (counts.get(k) ?? 0) + 1);
    if (!seen.has(k)) {
      seen.set(k, item);
      dedupedItems.push(item);
    }
  });
  dedupedItems.forEach((item) => {
    const k = item.name.toLowerCase() + "|" + item.category;
    const count = counts.get(k) ?? 1;
    if (count > 1) item.source = `${count} x`;
  });

  const total = dedupedItems.length;
  const checkedCount = dedupedItems.filter((i) => checked[i.id]).length;
  const progress = total > 0 ? (checkedCount / total) * 100 : 0;

  function handleClearChecked() {
    const ids = dedupedItems.filter((i) => checked[i.id]).map((i) => i.id);
    onClearChecked(ids);
  }

  return (
    <>
      <div className="grocery-progress">
        <div className="progress-label">
          <span>
            {total > 0 && checkedCount === total
              ? "Alles in huis"
              : "In je mandje"}
          </span>
          <span>
            {checkedCount} van {total}
          </span>
        </div>
        <div
          className="progress-bar-wrap"
          role="progressbar"
          aria-label="Boodschappen afgevinkt"
          aria-valuemin={0}
          aria-valuemax={total || 1}
          aria-valuenow={checkedCount}
        >
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="scroll-content">
        {total === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="bag" width="34" height="34" />
            </div>
            <div className="empty-title">Een frisse start</div>
            <div className="empty-sub">
              Voeg ingrediënten toe in je weekmenu. Je boodschappen verschijnen
              hier vanzelf, gesorteerd per afdeling.
            </div>
          </div>
        ) : (
          CATEGORIES.map((cat) => {
            const catItems = dedupedItems.filter((i) => i.category === cat.id);
            if (catItems.length === 0) return null;
            const catChecked = catItems.filter((i) => checked[i.id]).length;
            return (
              <div className="store-section" key={cat.id}>
                <div className="store-section-header">
                  <span className="store-section-icon">{cat.icon}</span>
                  <span className="store-section-title">{cat.label}</span>
                  <div className="store-section-line" />
                  <span className="store-section-count">
                    {catChecked}/{catItems.length}
                  </span>
                </div>
                {catItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={Boolean(checked[item.id])}
                    className={`grocery-item${checked[item.id] ? " checked" : ""}`}
                    onClick={() => onToggle(item.id)}
                  >
                    <span className="check-circle" aria-hidden="true">
                      <Icon
                        name="check"
                        className="check-tick"
                        width="15"
                        height="15"
                      />
                    </span>
                    <span className="grocery-item-name">{item.name}</span>
                    <span className="grocery-item-source">{item.source}</span>
                  </button>
                ))}
              </div>
            );
          })
        )}
      </div>
      {checkedCount > 0 && (
        <div className="bottom-bar">
          <button className="clear-btn" onClick={handleClearChecked}>
            Verwijder {checkedCount} afgevinkt
            {checkedCount !== 1 ? "e items" : " item"}
          </button>
        </div>
      )}
    </>
  );
}
