# Slim Boodschappen — Smart Grocery App

A Dutch-language mobile web app for planning weekly menus and
generating a grocery checklist sorted by store section. Built with
Next.js 14 (App Router), Postgres, and deployed end-to-end on
Railway.

- **Deploy**: see [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- **Design tokens**: see below
- **Hi-fi HTML prototype**: [`Grocery App.html`](./Grocery%20App.html) (reference only)

## Run locally

```bash
cp .env.example .env.local
# Fill in DATABASE_URL, APP_PASSWORD, SESSION_SECRET
npm install
npm run dev                  # → http://localhost:3000
```

Leave those env vars unset and the app falls back to a localStorage-
only demo mode (no login, no database). When you wire them up, the
app applies `db/schema.sql` on first query and any existing local
data is uploaded once and then cleared.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production server (reads `PORT`) |
| `npm run typecheck` | `tsc --noEmit` |

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router (TypeScript) |
| Styling | Tailwind + hand-written CSS that ports the design tokens |
| Auth | Shared `APP_PASSWORD` + signed session cookie (`jose` HS256) |
| DB | Railway Postgres via `pg` |
| Hosting | Railway (Nixpacks) |

## Features

- **Weekmenu tab**: collapsible day sections (Maandag → Zondag + Algemeen), add ingredients with a category badge, autocomplete from history
- **Boodschappenlijst tab**: items grouped by store section (Groenten, Vlees, Vers/Zuivel, Droge voeding, Schoonmaak & overig), progress bar, deduplication, per-item check + bulk clear
- **Multi-week**: `‹` / `›` to navigate, `+` to create a new week
- **Offline-friendly**: works without any backend config via localStorage, with one-shot migration into Postgres on first login

---

## Design tokens

Preserved from the original design doc for reference.

### Colors

| Token | Hex | Usage |
|---|---|---|
| `bg-cream` | `#FAF7F0` | App background |
| `bg-card` | `#FFFFFF` | Cards, day sections, grocery items |
| `bg-muted` | `#EBE7DC` | Tab bar bg, badges, dividers |
| `bg-input` | `#FDFBF7` | Inputs, selects |
| `green-primary` | `#2D5A1B` | Active tab, add button, checkmarks, progress bar |
| `green-dark` | `#1C2B0A` | Headings |
| `green-active` | `#1E3E12` | Button press state |
| `green-muted` | `#7A8C6E` | Subtitle text |
| `green-faint` | `#9AAA8A` | Counts, chevrons, source labels |
| `orange-accent` | `#C4622D` | Algemeen dot, delete hover |
| `border` | `#E0DDD4` | Input borders |
| `border-light` | `#EBE7DC` | Card borders |
| `border-faint` | `#F0EDE4` | Day body top border |
| `divider` | `#F5F2EA` | Ingredient row dividers |
| `text-primary` | `#2A3620` | Ingredient names |
| `text-heading` | `#1C2B0A` | App title, day names |

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
| Section titles (store) | Lora | 15px | 600 |
| Day name, tab labels | DM Sans | 14 / 13px | 600 / 500 |
| Ingredient names | DM Sans | 13px | 400 |
| Grocery item names | DM Sans | 14px | 400 |
| Badges, counts | DM Sans | 10–11px | 500 |

Google Fonts:
```
https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@300;400;500;600
```

### Spacing & radii

- Cards / day sections: `16px`
- Grocery items: `12px`
- Inputs / selects / add button: `10px`
- Week selector: `14px`
- Tab bar: `12px`, inner buttons `10px`
- Badges: `20px` (pill)
- Horizontal content padding: `24px`
- Card gap: `10px`

---

## State shape

```ts
type Ingredient = {
  id: string;
  name: string;
  category: 'vegetables' | 'meats' | 'dairy' | 'dry' | 'cleaning';
};

type WeekData = {
  [dayKey: string]: Ingredient[];   // 'Maandag' | … | 'Zondag' | 'general'
};

type Weeks   = { [weekNum: number]: WeekData };
type Checked = { [ingredientId: string]: boolean };
type HistoryItem = { name: string; category: string };
```

Local-only keys (used when the database is not configured or before
first login): `grocery-weeks`, `grocery-current-week`,
`grocery-checked`, `grocery-history`, and `grocery-migrated-to-remote`.
