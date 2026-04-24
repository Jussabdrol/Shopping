"use client";

import { CATEGORIES, DAY_ABBREV, DAY_KEYS } from "@/lib/constants";
import type { Checked, Ingredient, WeekData } from "@/lib/types";

type SourcedIngredient = Ingredient & { source: string };

type Props = {
  weekData: WeekData;
  checked: Checked;
  onToggle: (id: string) => void;
  onClearChecked: (ids: string[]) => void;
};

export function GroceryTab({ weekData, checked, onToggle, onClearChecked }: Props) {
  const allItems: SourcedIngredient[] = [];
  DAY_KEYS.forEach((key) => {
    (weekData[key] ?? []).forEach((item) => {
      allItems.push({ ...item, source: DAY_ABBREV[key] ?? key });
    });
  });

  const seen = new Set<string>();
  const dedupedItems: SourcedIngredient[] = [];
  allItems.forEach((item) => {
    const k = item.name.toLowerCase() + "|" + item.category;
    if (!seen.has(k)) {
      seen.add(k);
      dedupedItems.push(item);
    }
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
      <div className="progress-bar-wrap" style={{ marginTop: 10 }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="scroll-content" style={{ paddingTop: 10 }}>
        {total === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <div className="empty-title">Lijst is leeg</div>
            <div className="empty-sub">
              Voeg ingrediënten toe in het Weekmenu om je lijst te vullen
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
                  <div
                    key={item.id}
                    className={`grocery-item${checked[item.id] ? " checked" : ""}`}
                    onClick={() => onToggle(item.id)}
                  >
                    <div className="check-circle">
                      <span className="check-tick">✓</span>
                    </div>
                    <span className="grocery-item-name">{item.name}</span>
                    <span className="grocery-item-source">{item.source}</span>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
      {checkedCount > 0 && (
        <div className="bottom-bar">
          <button className="clear-btn" onClick={handleClearChecked}>
            Verwijder {checkedCount} afgevinkt{checkedCount !== 1 ? "e items" : " item"}
          </button>
        </div>
      )}
    </>
  );
}
