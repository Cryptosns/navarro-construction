-- Run this in Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard → your project → SQL Editor

-- Projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  location text not null default '',
  status text not null default 'planning'
    check (status in ('planning', 'in_progress', 'on_hold', 'completed')),
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  budget numeric not null default 0,
  spent numeric not null default 0,
  deadline date,
  team_size int not null default 0,
  created_at timestamptz not null default now()
);

-- Clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  company text not null default '',
  email text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table projects enable row level security;
alter table clients enable row level security;

create policy "Users manage own projects"
  on projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own clients"
  on clients for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes
create index if not exists projects_user_id_idx on projects (user_id);
create index if not exists clients_user_id_idx on clients (user_id);

-- Receipts
create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  vendor text not null,
  project text not null default '',
  amount numeric not null default 0,
  category text not null default 'Materials',
  date date not null default current_date,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  file_name text,
  created_at timestamptz not null default now()
);

alter table receipts enable row level security;

create policy "Users manage own receipts"
  on receipts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists receipts_user_id_idx on receipts (user_id);

-- Optional: create a Storage bucket named "receipts" in Supabase Dashboard → Storage

-- Calendar events
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  date date not null,
  project text not null default '',
  type text not null default 'meeting'
    check (type in ('inspection', 'delivery', 'meeting', 'start')),
  created_at timestamptz not null default now()
);

alter table calendar_events enable row level security;

create policy "Users manage own calendar events"
  on calendar_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists calendar_events_user_id_idx on calendar_events (user_id);
create index if not exists calendar_events_date_idx on calendar_events (date);
