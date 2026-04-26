export const DAYS = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
] as const;

export type DayKey = (typeof DAYS)[number] | "general";

export const DAY_KEYS: DayKey[] = [...DAYS, "general"];

export const DAY_ABBREV: Record<string, string> = {
  Maandag: "Ma",
  Dinsdag: "Di",
  Woensdag: "Wo",
  Donderdag: "Do",
  Vrijdag: "Vr",
  Zaterdag: "Za",
  Zondag: "Zo",
  general: "Algemeen",
};

export type CategoryId =
  | "vegetables"
  | "meats"
  | "dairy"
  | "dry"
  | "freezer"
  | "cleaning";

export type Category = {
  id: CategoryId;
  label: string;
  icon: string;
  badgeClass: string;
};

export const CATEGORIES: Category[] = [
  { id: "vegetables", label: "Groenten", icon: "🥦", badgeClass: "cat-vegetables" },
  { id: "meats", label: "Vlees", icon: "🥩", badgeClass: "cat-meats" },
  { id: "dairy", label: "Vers/Zuivel", icon: "🧀", badgeClass: "cat-dairy" },
  { id: "dry", label: "Droge voeding", icon: "🌾", badgeClass: "cat-dry" },
  { id: "freezer", label: "Vriezer", icon: "🧊", badgeClass: "cat-freezer" },
  { id: "cleaning", label: "Schoonmaak & overig", icon: "🧹", badgeClass: "cat-cleaning" },
];

export function getCategory(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
