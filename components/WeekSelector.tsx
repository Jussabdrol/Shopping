"use client";

import { Icon } from "./Icon";

type Props = {
  currentWeek: number;
  totalWeeks: number;
  onPrev: () => void;
  onNext: () => void;
  onAdd: () => void;
};

export function WeekSelector({
  currentWeek,
  totalWeeks,
  onPrev,
  onNext,
  onAdd,
}: Props) {
  return (
    <div className="week-selector">
      <div>
        <span className="eyebrow">Jouw planning</span>
        <div className="week-label" aria-live="polite">
          Week {currentWeek}
        </div>
      </div>
      <div className="week-nav-btns">
        <button
          className="week-nav-btn"
          onClick={onPrev}
          disabled={currentWeek <= 1}
          aria-label="Vorige week"
        >
          <Icon
            name="chevron"
            className="chevron-prev"
            width="16"
            height="16"
          />
        </button>
        <button
          className="week-nav-btn"
          onClick={onNext}
          disabled={currentWeek >= totalWeeks}
          aria-label="Volgende week"
        >
          <Icon name="chevron" width="16" height="16" />
        </button>
        <button
          className="week-add-btn"
          onClick={onAdd}
          title="Nieuwe week"
          aria-label="Nieuwe week"
        >
          <Icon name="plus" width="18" height="18" />
        </button>
      </div>
    </div>
  );
}
