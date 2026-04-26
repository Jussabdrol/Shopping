# Deployment guide — Railway only

Everything runs on Railway:

- A **Postgres** service (managed by Railway) holds the data.
- A **web** service runs the Next.js app.
- Auth is a single shared password. No external email provider is
  required.

Required env vars on the web service:

| Var | Source |
|---|---|
| `DATABASE_URL` | Reference the Postgres plugin — auto-generated |
| `APP_PASSWORD` | You pick it. Users type this to log in |
| `SESSION_SECRET` | Random 32+ char string. Signs session cookies |

The app auto-creates its tables on first query (idempotent — it just
runs `db/schema.sql`), so you normally do **not** need to log into
psql. The SQL file is still there if you want to run it manually or
inspect it.

---

## 1. Push the code to GitHub

This branch (`claude/build-from-design-specs-cMUEh`) is already pushed
to `origin`. If you want to deploy from `main` instead, merge first.

## 2. Create the Railway project

1. Go to [railway.com/new](https://railway.com/new) → **Deploy from GitHub repo** → pick this repo.
2. Pick the branch you want to deploy from. Railway will start a
   first build using `nixpacks.toml` + `railway.toml`
   (`npm ci → npm run build → npm start`).
3. Let the first build finish (it will fail healthcheck without env
   vars — that's fine, we'll fix it next).

## 3. Add the Postgres database

1. In the project dashboard: **+ Create → Database → Add PostgreSQL**.
2. Railway provisions a Postgres service and exposes a set of vars
   including `DATABASE_URL`.

## 4. Wire the database into the web service

1. Open your **web service → Variables → + New Variable → Add Reference**.
2. Pick the Postgres service and select `DATABASE_URL`. Railway
   stores it as a reference so it always resolves to the current
   credentials.
3. On the same Variables tab, add:
   - `APP_PASSWORD` → whatever password you want to share with
     anyone who should be able to use the app.
   - `SESSION_SECRET` → generate one:
     ```bash
     openssl rand -hex 32
     ```
     Paste the output as the value.

## 5. Redeploy

Click **Deploy** on the web service (or push a new commit). During
the first request the app runs `db/schema.sql` against the new
Postgres service, creating `weeks`, `ingredients`, `checked_items`,
and `ingredient_history`.

## 6. Get a URL and try it

1. **Settings → Networking → Generate domain** on the web service
   gives you something like `slim-boodschappen.up.railway.app`.
2. Open it. You get redirected to `/login`.
3. Enter `APP_PASSWORD`. You're in.

### Optional: custom domain

**Settings → Networking → Custom domain** → point a CNAME at the
target Railway provides. HTTPS is handled for you.

---

## Local development

```bash
cp .env.example .env.local
# Fill in:
#   DATABASE_URL      (any Postgres — local Docker is fine)
#   APP_PASSWORD
#   SESSION_SECRET
npm install
npm run dev
# → http://localhost:3000
```

Quick local Postgres via Docker:

```bash
docker run --rm -d --name slim-pg \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_DB=slim \
  -p 5432:5432 postgres:16
# Then DATABASE_URL=postgresql://postgres:dev@localhost:5432/slim
```

If you leave all three vars unset the app runs in **local mode** —
no login, data is held in `localStorage`. Useful for demos. On the
first authenticated load after adding the vars, any existing local
data is uploaded to Postgres and the local keys are cleared.

---

## Manual schema apply (optional)

If you want to run `db/schema.sql` yourself instead of relying on the
bootstrap:

1. Railway dashboard → Postgres service → **Data** → open the SQL
   console.
2. Paste the contents of `db/schema.sql` and run it.

Or from your laptop, grab the external `DATABASE_URL` from Railway
(Postgres service → **Connect → Public Network**) and:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

---

## How auth works

- `lib/auth.ts` signs a 30-day HS256 JWT and stores it in a
  `HttpOnly` `Secure` (in production) `SameSite=Lax` cookie named
  `slim_session`.
- `middleware.ts` verifies that cookie on every non-auth request.
  Missing/expired → redirect to `/login`.
- `loginAction` (a Next.js server action) does a timing-safe
  comparison against `APP_PASSWORD` and sets the cookie.
- `POST /auth/signout` clears the cookie.
- All server actions in `app/actions/data.ts` call `requireAuth()`
  before touching the database, so a leaked client build cannot
  bypass the password.

## Rotating secrets

- **Change the password**: update `APP_PASSWORD` in Railway and
  redeploy. Existing logged-in sessions keep working until their JWTs
  expire, because they were signed with `SESSION_SECRET`, not the
  password.
- **Invalidate all sessions**: rotate `SESSION_SECRET` (generate a
  new `openssl rand -hex 32`). Everyone has to log in again.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Stuck on `/login` with no error | `APP_PASSWORD` not set on the web service |
| `Error: DATABASE_URL is not configured` | Missing reference from web → Postgres service |
| `relation "weeks" does not exist` on first request | Bootstrap failed — the Postgres user needs rights to `CREATE EXTENSION pgcrypto`. Railway Postgres has this by default; if you're self-hosting, run `db/schema.sql` manually as superuser |
| Login redirects in a loop | `SESSION_SECRET` changed between the request and the cookie, or cookies are blocked. Clear cookies and try again |
