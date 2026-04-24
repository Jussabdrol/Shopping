import type { CategoryId, DayKey } from "./constants";

export type Ingredient = {
  id: string;
  name: string;
  category: CategoryId;
};

export type WeekData = Partial<Record<DayKey, Ingredient[]>>;

export type Weeks = Record<number, WeekData>;

export type Checked = Record<string, boolean>;

export type HistoryItem = {
  name: string;
  category: CategoryId;
};
