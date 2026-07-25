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
