"use client";

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
      <span className="week-label">Week {currentWeek}</span>
      <div className="week-nav-btns">
        <button
          className="week-nav-btn"
          onClick={onPrev}
          disabled={currentWeek <= 1}
          aria-label="Vorige week"
        >
          ‹
        </button>
        <button
          className="week-nav-btn"
          onClick={onNext}
          disabled={currentWeek >= totalWeeks}
          aria-label="Volgende week"
        >
          ›
        </button>
        <button
          className="week-add-btn"
          onClick={onAdd}
          title="Nieuwe week"
          aria-label="Nieuwe week"
        >
          +
        </button>
      </div>
    </div>
  );
}
