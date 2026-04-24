# Handoff: Slim Boodschappen — Smart Grocery App

## Overview
A Dutch-language mobile web app for planning weekly menus and generating a sorted grocery checklist. Users plan meals day-by-day, add ingredients per day (with a store category tag), and then switch to a checklist view where all ingredients are sorted by grocery store section. The app supports multiple weeks and remembers previously used ingredients for quick re-entry.

## About the Design Files
`Grocery App.html` is a **high-fidelity HTML prototype** — it shows the exact intended look and behavior but is not production code. The task is to **recreate this design as a proper web application** using a framework such as Next.js (recommended) or React + Vite, backed by Supabase for persistence and hosted on Railway.

The HTML prototype uses `localStorage` for state. In production, replace this with Supabase rows tied to an authenticated user.

---

## Fidelity
**High-fidelity.** The prototype is pixel-accurate with final colors, typography, spacing, and interactions. Recreate the UI as closely as possible.

---

## Design Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| `bg-cream` | `#FAF7F0` | App background, status bar |
| `bg-card` | `#FFFFFF` | Cards, day sections, grocery items |
| `bg-muted` | `#EBE7DC` | Tab bar background, badge bg, dividers |
| `bg-input` | `#FDFBF7` | Input fields, selects |
| `green-primary` | `#2D5A1B` | Active tab, add button, checkmarks, progress bar |
| `green-dark` | `#1C2B0A` | Headings, status bar icons |
| `green-active` | `#1E3E12` | Button press state |
| `green-muted` | `#7A8C6E` | Subtitle text |
| `green-faint` | `#9AAA8A` | Counts, chevrons, source labels |
| `orange-accent` | `#C4622D` | General section dot, delete hover |
| `border` | `#E0DDD4` | Input borders |
| `border-light` | `#EBE7DC` | Card borders |
| `border-faint` | `#F0EDE4` | Day body top border |
| `divider` | `#F5F2EA` | Ingredient row dividers |
| `text-primary` | `#2A3620` | Ingredient names, grocery item names |
| `text-heading` | `#1C2B0A` | App title, day names, section titles |

### Category badge colors
| Category | Background | Text |
|---|---|---|
| Groenten | `#E8F5E0` | `#2D6B0E` |
| Vlees | `#FDEEE8` | `#A83A1A` |
| Vers/Zuivel | `#EAF3FD` | `#1A5C9A` |
| Droge voeding | `#FDF6E8` | `#8A6A10` |
| Schoonmaak & overig | `#EDE8FD` | `#4A2A9A` |

### Typography
| Usage | Family | Size | Weight |
|---|---|---|---|
| App title | Lora (serif) | 26px | 600 |
| Section titles (store) | Lora (serif) | 15px | 600 |
| Day name, tab labels | DM Sans | 14px / 13px | 600 / 500 |
| Ingredient names | DM Sans | 13px | 400 |
| Grocery item names | DM Sans | 14px | 400 |
| Badges, counts, sources | DM Sans | 10–11px | 500 |
| Subtitle | DM Sans | 13px | 400 |

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@300;400;500;600
```

### Spacing & Radii
- Phone shell: `border-radius: 50px` (for demo only — not needed in production)
- Cards / day sections: `border-radius: 16px`
- Grocery items: `border-radius: 12px`
- Inputs, selects, add button: `border-radius: 10px`
- Week selector: `border-radius: 14px`
- Tab bar: `border-radius: 12px`, inner buttons `border-radius: 10px`
- Badges: `border-radius: 20px`
- Content padding: `24px` horizontal
- Card gap: `10px`

---

## Screens / Views

### Global Layout
Fixed mobile viewport (max-width ~390px, centered). Two top-level tabs: **Weekmenu** and **Boodschappenlijst**.

A **week selector** sits between the header and tabs:
- Displays "Week {N}"
- Left/right arrows (`‹` / `›`) to navigate between existing weeks (disabled at boundaries)
- `+` button (green) to create a new week

### 1 — Weekmenu Tab
**Purpose:** Plan ingredients for each day of the current week.

**Layout:** Vertically scrollable list of collapsible day sections, in order:
`Maandag, Dinsdag, Woensdag, Donderdag, Vrijdag, Zaterdag, Zondag, Algemeen`

Each **day section card**:
- Header row (always visible): colored dot + day name + optional count badge + chevron
  - Regular days: green dot (`#2D5A1B`)
  - Algemeen: orange dot (`#C4622D`)
  - Chevron rotates 180° when open
- Body (visible when open): list of ingredients + add ingredient row at the bottom
- "Algemeen" starts open by default; all others start closed

Each **ingredient row**:
- Ingredient name (truncated with ellipsis if too long)
- Category badge (colored pill)
- Delete button `×` (gray, turns `#C4622D` on hover)

**Add ingredient row** (inside open day body):
- Text input: "Voeg ingredient toe…"
- Category `<select>` (max-width 110px): Groenten / Vlees / Vers/Zuivel / Droge voeding / Schoonmaak & overig
- Green `+` submit button (36×36px)
- **Autocomplete dropdown**: appears below input when typing ≥1 character. Shows up to 8 matches from the global ingredient history. Each row shows ingredient name + category badge. Keyboard navigation: ArrowUp/Down, Enter to select, Escape to close. Clicking outside closes it. Selecting a suggestion also pre-fills the category select.

### 2 — Boodschappenlijst Tab
**Purpose:** A checklist of all ingredients from the current week's menu, sorted by store section.

**Layout:**
- Thin green progress bar (3px) at top, fills left-to-right based on checked / total
- Scrollable list grouped by store section in this fixed order:
  1. 🥦 Groenten
  2. 🥩 Vlees
  3. 🧀 Vers/Zuivel
  4. 🌾 Droge voeding
  5. 🧹 Schoonmaak & overig
- Sections with 0 items are hidden
- Each section header: icon + title + horizontal rule + `{checked}/{total}` count
- Each grocery item row: circle checkbox + ingredient name + source label (day abbreviation or "Algemeen")
- Tapping a row toggles its checked state
- Checked items: 50% opacity, name gets `text-decoration: line-through`, circle fills green
- Deduplication: if the same ingredient (same name + category, case-insensitive) appears on multiple days, it shows once; the source label shows the first occurrence's day
- If list is empty: centered empty state with cart icon and helper text

**Bottom bar** (appears only when ≥1 item is checked):
- "Verwijder {N} afgevinkt(e) item(s)" button — clears all checked items from this view (does not delete from menu)

---

## Interactions & Behavior

| Trigger | Behavior |
|---|---|
| Tap day header | Toggle open/closed |
| Type in add input | Show autocomplete dropdown with matches from history |
| Click autocomplete suggestion | Fill name + category, close dropdown, focus input |
| Submit add form | Add ingredient to that day, clear input, keep category |
| Click `×` on ingredient | Remove from that day |
| Click `‹` / `›` | Navigate to previous/next week |
| Click `+` (week) | Create new week (weekNum + 1), navigate to it, switch to Weekmenu tab |
| Tap grocery item | Toggle checked |
| Click clear button | Uncheck all checked items in current view |

---

## State Shape

```ts
// All weeks' menus
type Ingredient = {
  id: string;          // random UUID
  name: string;
  category: 'vegetables' | 'meats' | 'dairy' | 'dry' | 'cleaning';
};

type WeekData = {
  [dayKey: string]: Ingredient[];  // dayKey = 'Maandag' | ... | 'general'
};

type Weeks = {
  [weekNum: number]: WeekData;
};

// Checked state for grocery list
type Checked = {
  [ingredientId: string]: boolean;
};

// History for autocomplete
type HistoryItem = {
  name: string;
  category: string;
};
```

In the prototype this lives in `localStorage` under these keys:
- `grocery-weeks`
- `grocery-current-week`
- `grocery-checked`
- `grocery-history`

In production, migrate to Supabase (see `DEPLOYMENT.md`).

---

## Assets
No images or icons. Category icons are Unicode emoji. Fonts are loaded from Google Fonts.

---

## Files in This Package
| File | Description |
|---|---|
| `Grocery App.html` | Full hi-fi prototype — single-file React app |
| `README.md` | This document |
| `DEPLOYMENT.md` | Railway + Supabase setup guide |
