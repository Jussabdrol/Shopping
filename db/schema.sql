-- Slim Boodschappen — Railway Postgres schema
-- Run once against your Railway Postgres service. The app will also
-- attempt to auto-apply this schema on startup if the tables are
-- missing, so manual execution is optional.

create extension if not exists pgcrypto;

create table if not exists weeks (
  id         uuid primary key default gen_random_uuid(),
  week_num   integer not null unique,
  created_at timestamptz default now()
);

create table if not exists ingredients (
  id         uuid primary key default gen_random_uuid(),
  week_id    uuid references weeks(id) on delete cascade not null,
  day_key    text not null,
  name       text not null,
  category   text not null,
  position   integer default 0,
  created_at timestamptz default now()
);

create index if not exists ingredients_week_idx on ingredients(week_id);

create table if not exists checked_items (
  ingredient_id uuid primary key references ingredients(id) on delete cascade,
  created_at    timestamptz default now()
);

create table if not exists ingredient_history (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  category   text not null,
  used_count integer default 1,
  updated_at timestamptz default now()
);

create index if not exists ingredient_history_used_idx
  on ingredient_history(used_count desc, updated_at desc);
