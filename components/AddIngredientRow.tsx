"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES, getCategory, type CategoryId } from "@/lib/constants";
import type { HistoryItem, Ingredient } from "@/lib/types";

type Props = {
  onAdd: (item: Ingredient) => void;
  history: HistoryItem[];
};

function genId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function AddIngredientRow({ onAdd, history }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryId>("vegetables");
  const [showAuto, setShowAuto] = useState(false);
  const [hiIdx, setHiIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const trimmed = name.trim();
  const suggestions =
    trimmed.length >= 1
      ? history
          .filter((h) => h.name.toLowerCase().includes(trimmed.toLowerCase()))
          .slice(0, 8)
      : [];

  function pickSuggestion(s: HistoryItem) {
    setName(s.name);
    setCategory(s.category);
    setShowAuto(false);
    setHiIdx(-1);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (hiIdx >= 0 && suggestions[hiIdx]) {
      pickSuggestion(suggestions[hiIdx]);
      return;
    }
    const t = name.trim();
    if (!t) return;
    onAdd({ id: genId(), name: t, category });
    setName("");
    setShowAuto(false);
    setHiIdx(-1);
    inputRef.current?.focus();
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showAuto || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHiIdx((i) => Math.min(i + 1, suggestions.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHiIdx((i) => Math.max(i - 1, -1));
    }
    if (e.key === "Escape") {
      setShowAuto(false);
      setHiIdx(-1);
    }
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowAuto(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <form className="add-row" onSubmit={submit}>
      <div className="add-input-wrap" ref={wrapRef}>
        <input
          ref={inputRef}
          className="add-input"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setShowAuto(true);
            setHiIdx(-1);
          }}
          onFocus={() => {
            if (name.trim()) setShowAuto(true);
          }}
          onKeyDown={handleKey}
          placeholder="Voeg ingredient toe…"
          autoComplete="off"
        />
        {showAuto && suggestions.length > 0 && (
          <div className="autocomplete-dropdown">
            {suggestions.map((s, i) => (
              <div
                key={s.name + s.category}
                className={`autocomplete-item${i === hiIdx ? " highlighted" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pickSuggestion(s);
                }}
              >
                <span className="autocomplete-item-name">{s.name}</span>
                <span className={`category-badge ${getCategory(s.category).badgeClass}`}>
                  {getCategory(s.category).label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <select
        className="cat-select"
        value={category}
        onChange={(e) => setCategory(e.target.value as CategoryId)}
      >
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      <button type="submit" className="add-btn" aria-label="Toevoegen">
        +
      </button>
    </form>
  );
}
