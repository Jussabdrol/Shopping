-- Slim Boodschappen — database schema
-- Run this in the Supabase SQL editor on a fresh project.

-- Weeks: one row per (user, week_num)
create table if not exists weeks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  week_num    integer not null,
  created_at  timestamptz default now(),
  unique(user_id, week_num)
);

create index if not exists weeks_user_idx on weeks(user_id);

-- Ingredients: one row per ingredient placed on a day within a week
create table if not exists ingredients (
  id          uuid primary key default gen_random_uuid(),
  week_id     uuid references weeks(id) on delete cascade not null,
  day_key     text not null,
  name        text not null,
  category    text not null,
  position    integer default 0,
  created_at  timestamptz default now()
);

create index if not exists ingredients_week_idx on ingredients(week_id);

-- Checked items: persistent check state for the grocery list
create table if not exists checked_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  ingredient_id  uuid references ingredients(id) on delete cascade not null,
  created_at     timestamptz default now(),
  unique(user_id, ingredient_id)
);

create index if not exists checked_items_user_idx on checked_items(user_id);

-- Ingredient history (autocomplete)
create table if not exists ingredient_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  category    text not null,
  used_count  integer default 1,
  updated_at  timestamptz default now(),
  unique(user_id, name)
);

create index if not exists ingredient_history_user_idx on ingredient_history(user_id);

-- Row Level Security
alter table weeks               enable row level security;
alter table ingredients         enable row level security;
alter table checked_items       enable row level security;
alter table ingredient_history  enable row level security;

-- Weeks policies
drop policy if exists "weeks owner all" on weeks;
create policy "weeks owner all" on weeks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Ingredients policies (derived via week ownership)
drop policy if exists "ingredients owner all" on ingredients;
create policy "ingredients owner all" on ingredients
  for all using (
    week_id in (select id from weeks where user_id = auth.uid())
  ) with check (
    week_id in (select id from weeks where user_id = auth.uid())
  );

-- Checked items policies
drop policy if exists "checked owner all" on checked_items;
create policy "checked owner all" on checked_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- History policies
drop policy if exists "history owner all" on ingredient_history;
create policy "history owner all" on ingredient_history
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
