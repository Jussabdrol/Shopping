# Deployment guide — Railway + Supabase

This app is a Next.js 14 (App Router) project that uses Supabase for
auth + persistence and runs on Railway.

- Code lives at the repo root.
- Database schema: `supabase/schema.sql`.
- Railway build config: `railway.toml` + `nixpacks.toml`.

---

## 1. Create the Supabase project

1. Sign in at [supabase.com](https://supabase.com) → **New project**.
2. Pick a region close to your users, set a strong DB password, wait
   for the project to provision.
3. In the dashboard, open **Settings → API** and copy:
   - **Project URL** → this becomes `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → this becomes `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Create the tables

1. Open **SQL Editor** in the Supabase dashboard.
2. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql)
   and run it. This creates:
   - `weeks`, `ingredients`, `checked_items`, `ingredient_history`
   - Indexes and row-level security policies scoped to `auth.uid()`

## 3. Configure magic-link auth

1. Go to **Authentication → Providers** and make sure **Email** is enabled.
2. Go to **Authentication → URL configuration**:
   - **Site URL**: your Railway URL once it's deployed (for example
     `https://slim-boodschappen.up.railway.app`). While you're still
     developing locally you can use `http://localhost:3000`.
   - **Additional redirect URLs**: add `${SITE_URL}/auth/callback`
     (and the localhost equivalent for dev). The app uses this route
     to exchange the magic-link code for a session.

## 4. Run locally

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
# → http://localhost:3000
```

If you start the dev server without env vars, the app still runs — it
falls back to the localStorage-only mode and skips the login flow.

## 5. Push to GitHub

This repo is already a git repository. Push the current branch to
GitHub so Railway can pick it up:

```bash
git push -u origin claude/build-from-design-specs-cMUEh
```

(Or merge into `main`/`demo` first and deploy from there — Railway
just needs a branch to track.)

## 6. Deploy on Railway

1. Go to [railway.app](https://railway.app) → **New Project →
   Deploy from GitHub repo** and pick your repo and branch.
2. Railway detects `nixpacks.toml` / `railway.toml` and uses
   `npm ci → npm run build → npm start`.
3. Open the new service → **Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Hit **Deploy**. When it's live, open **Settings → Networking →
   Generate domain** to get a public URL (e.g.
   `slim-boodschappen.up.railway.app`).
5. Go back to Supabase → **Authentication → URL configuration** and
   update the Site URL + redirect URL to that Railway domain.

## 7. Custom domain (optional)

Railway: **Settings → Networking → Custom domain** — point a CNAME at
the target Railway provides. Then update the Supabase redirect URL
one more time.

---

## Environment variables

| Key | Required | Used where |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes (to enable auth) | browser + server Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes (to enable auth) | browser + server Supabase clients |
| `PORT` | no | injected by Railway; `npm start` reads it |

If both Supabase vars are missing the app runs in localStorage-only
mode. That's useful for demos but state isn't shared between devices.

---

## What happens on first login

When a user signs in for the first time, `lib/data/migrate.ts`:

1. Reads `grocery-weeks` / `grocery-history` from `localStorage`.
2. Uploads anything it finds into `weeks`, `ingredients`, and
   `ingredient_history` scoped to the signed-in user.
3. Clears the local keys and sets `grocery-migrated-to-supabase=1`
   so the migration only ever runs once.

## Architecture summary

```
app/
  layout.tsx            # fonts, global shell
  page.tsx              # server component: picks AppShell vs SupabaseAppShell
  login/page.tsx        # magic-link form
  auth/callback/route.ts# exchanges OTP code for a session cookie
  auth/signout/route.ts # signs the user out

components/
  AppView.tsx           # pure presentation (used by both containers)
  AppShell.tsx          # localStorage container
  SupabaseAppShell.tsx  # Supabase container with optimistic mutations
  WeekSelector.tsx
  MenuTab.tsx / DaySection.tsx / AddIngredientRow.tsx
  GroceryTab.tsx

lib/
  constants.ts          # Dutch day + category labels, badge classes
  types.ts
  useLocalStorage.ts
  supabase/
    env.ts client.ts server.ts middleware.ts
  data/
    supabaseApi.ts      # CRUD against Supabase
    migrate.ts          # localStorage → Supabase migration

middleware.ts           # refreshes the Supabase session on every request
supabase/schema.sql     # run once in the Supabase SQL editor
railway.toml / nixpacks.toml
```
