# Deployment Guide: Railway + Supabase

## Recommended Stack
| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, API routes, easy Railway deploy |
| Database | Supabase (Postgres) | Auth + realtime + simple row-level security |
| Hosting | Railway | One-click Next.js deploys, env var management |
| Auth | Supabase Auth | Email/password or magic link — one user per device is fine for this app |

---

## 1. Supabase Setup

### Create project
1. Go to [supabase.com](https://supabase.com) → New project
2. Note your **Project URL** and **anon public key** (Settings → API)

### Database schema

```sql
-- Users are handled by Supabase Auth (auth.users)

-- Weeks
create table weeks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  week_num    integer not null,
  created_at  timestamptz default now(),
  unique(user_id, week_num)
);

-- Ingredients (one row per ingredient per day per week)
create table ingredients (
  id          uuid primary key default gen_random_uuid(),
  week_id     uuid references weeks(id) on delete cascade not null,
  day_key     text not null,   -- 'Maandag' | 'Dinsdag' | ... | 'general'
  name        text not null,
  category    text not null,   -- 'vegetables' | 'meats' | 'dairy' | 'dry' | 'cleaning'
  position    integer default 0,
  created_at  timestamptz default now()
);

-- Checked state (grocery list)
create table checked_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  ingredient_id  uuid references ingredients(id) on delete cascade not null,
  unique(user_id, ingredient_id)
);

-- History (autocomplete)
create table ingredient_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  category    text not null,
  used_count  integer default 1,
  updated_at  timestamptz default now(),
  unique(user_id, name)
);
```

### Row Level Security (RLS)
Enable RLS on all tables and add policies so users can only access their own data:

```sql
-- Example for ingredients (repeat pattern for all tables)
alter table ingredients enable row level security;

create policy "Users can manage their own ingredients"
  on ingredients
  using (
    week_id in (
      select id from weeks where user_id = auth.uid()
    )
  );
```

---

## 2. Next.js Project Setup

```bash
npx create-next-app@latest boodschappen --typescript --tailwind --app
cd boodschappen
npm install @supabase/supabase-js @supabase/ssr
```

### Environment variables (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase client (`lib/supabase.ts`)
```ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

---

## 3. Key API Routes / Server Actions

Implement these as Next.js Server Actions or Route Handlers:

| Action | Description |
|---|---|
| `getOrCreateWeek(userId, weekNum)` | Upsert a week row, return its `id` |
| `getWeekData(weekId)` | Fetch all ingredients for a week, grouped by `day_key` |
| `addIngredient(weekId, dayKey, name, category)` | Insert ingredient row; upsert history |
| `deleteIngredient(ingredientId)` | Delete row |
| `toggleChecked(userId, ingredientId)` | Upsert / delete from `checked_items` |
| `clearChecked(userId, ingredientIds[])` | Bulk delete from `checked_items` |
| `getHistory(userId, query)` | Search `ingredient_history` by name ILIKE `%query%`, order by `used_count desc` |

---

## 4. Railway Deployment

### Steps
1. Push your Next.js project to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Railway auto-detects Next.js and sets the build command to `npm run build`
4. Add environment variables in Railway dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy — Railway assigns a public URL (e.g. `boodschappen.up.railway.app`)

### Custom domain (optional)
Settings → Networking → Add custom domain → point your DNS CNAME to Railway's target.

### `railway.toml` (optional, for explicit config)
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
```

---

## 5. Auth Flow

For a personal grocery app, the simplest approach:
- Magic link (passwordless email) via Supabase Auth
- On first visit, show a simple email input → "Stuur inloglink"
- Supabase sends a link; user clicks it → session cookie set via `@supabase/ssr`
- All data is scoped to `auth.uid()` automatically via RLS

---

## 6. Migration from localStorage

On first login, check if `localStorage` contains existing data (`grocery-weeks`, `grocery-history`, etc.) and offer to import it into Supabase. This gives existing prototype users a smooth migration.

```ts
const localWeeks = localStorage.getItem('grocery-weeks');
if (localWeeks && userIsNewToSupabase) {
  await migrateLocalDataToSupabase(JSON.parse(localWeeks));
  localStorage.clear();
}
```

---

## 7. Suggested Folder Structure

```
boodschappen/
├── app/
│   ├── layout.tsx           # Root layout, font imports (Lora + DM Sans)
│   ├── page.tsx             # Auth gate → redirect to /app
│   ├── login/page.tsx       # Magic link login screen
│   └── app/
│       ├── layout.tsx       # App shell (week selector + tabs)
│       └── page.tsx         # Main app view
├── components/
│   ├── WeekSelector.tsx
│   ├── MenuTab.tsx
│   ├── DaySection.tsx
│   ├── AddIngredientRow.tsx  # Includes autocomplete
│   ├── GroceryTab.tsx
│   └── StoreSection.tsx
├── lib/
│   ├── supabase.ts
│   └── api.ts               # Server actions / fetch helpers
└── .env.local
```
